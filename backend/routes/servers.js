module.exports = function registerServerRoutes(app, client) {
  const generateInviteCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 8; i += 1) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
    return code
  }

  const ensureServerSchema = async () => {
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS server (
          id TEXT PRIMARY KEY,
          name VARCHAR(200) NOT NULL,
          owner_id UUID,
          invite_code VARCHAR(32) UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `)
      await client.query(`
        ALTER TABLE server
        ADD COLUMN IF NOT EXISTS invite_code VARCHAR(32) UNIQUE
      `)
    } catch (err) {
      console.error('Failed to ensure server table exists:', err.message)
    }
  }

  const ensureMembershipSchema = async () => {
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS membership (
          user_id INTEGER NOT NULL,
          server_id TEXT NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'member',
          joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (user_id, server_id)
        )
      `)
    } catch (err) {
      console.error('Failed to ensure membership table exists:', err.message)
    }
  }

  ;(async () => {
    await ensureServerSchema()
    await ensureMembershipSchema()
  })()

  // Récupérer la liste des utilisateurs d'un serveur spécifique
  app.get('/servers/:id/users', async (req, res) => {
    try {
      const { id } = req.params;
      
      const query = `
        SELECT 
          m.user_id, 
          m.role, 
          m.joined_at, 
          u.pseudo 
        FROM membership m
        LEFT JOIN utilisateur u ON m.user_id = u.id
        WHERE m.server_id = $1
        ORDER BY u.pseudo ASC
      `;
      
      const result = await client.query(query, [id]);
      return res.json(result.rows);
      
    } catch (error) {
      console.error('Failed to fetch server users:', error.message);
      return res.status(500).json({ message: 'Impossible de récupérer les utilisateurs du serveur.' });
    }
  });

  // Get all servers (owned and custom)
  app.get('/servers', async (req, res) => {
    try {
      const result = await client.query('SELECT id, name, owner_id, invite_code, created_at FROM server ORDER BY created_at DESC')
      return res.json(result.rows)
    } catch (error) {
      console.error('Failed to fetch servers:', error.message)
      return res.status(500).json({ message: 'Impossible de récupérer les serveurs.' })
    }
  })

  // Insert a new server
  app.post('/servers', async (req, res) => {
    try {
      const { id, name, owner_id, invite_code } = req.body
      if (!id || !name) {
        return res.status(400).json({ message: 'Les champs id et name sont requis.' })
      }

      let finalInviteCode = invite_code || generateInviteCode()
      const query = 'INSERT INTO server(id, name, owner_id, invite_code) VALUES($1, $2, $3, $4) RETURNING id, name, owner_id, invite_code, created_at'
      const values = [id, name, owner_id || null, finalInviteCode]
      const result = await client.query(query, values)

      // Try to create default salons (channels) for this server. Non-fatal if it fails.
      ;(async () => {
        try {
          const textId = `${id}-text`
          const voiceId = `${id}-voice`
          await client.query('INSERT INTO salon(id, name, type, server_id, position) VALUES($1,$2,$3,$4,$5)', [textId, 'Général', 'text', id, 0])
          await client.query('INSERT INTO salon(id, name, type, server_id, position) VALUES($1,$2,$3,$4,$5)', [voiceId, 'Vocal 1', 'voice', id, 0])
        } catch (err) {
          console.warn('Could not create default salons for server', id, err.message)
        }
      })()

      return res.status(201).json(result.rows[0])
    } catch (error) {
      console.error('Failed to create server:', error.message)
      return res.status(500).json({ message: 'Impossible de créer le serveur.' })
    }
  })

  // Update an existing server
  app.put('/servers/:id', async (req, res) => {
    try {
      const { id } = req.params
      const { name } = req.body
      if (!name) return res.status(400).json({ message: 'Le champ name est requis.' })

      const query = 'UPDATE server SET name = $1 WHERE id = $2 RETURNING id, name, owner_id, invite_code, created_at'
      const values = [name, id]
      const result = await client.query(query, values)
      if (result.rowCount === 0) return res.status(404).json({ message: 'Serveur introuvable.' })
      return res.json(result.rows[0])
    } catch (error) {
      console.error('Failed to update server:', error.message)
      return res.status(500).json({ message: 'Impossible de mettre à jour le serveur.' })
    }
  })

  app.post('/servers/:id/join', async (req, res) => {
    try {
      const { id } = req.params
      const { user_id } = req.body

      if (!user_id) {
        return res.status(400).json({ message: 'Le champ user_id est requis.' })
      }

      const serverExists = await client.query('SELECT id FROM server WHERE id = $1', [id])
      if (serverExists.rowCount === 0) {
        return res.status(404).json({ message: 'Serveur introuvable.' })
      }

     const result = await client.query(
        `INSERT INTO membership(user_id, server_id, role, joined_at)
         VALUES($1, $2, 'member', CURRENT_TIMESTAMP)
         ON CONFLICT (user_id, server_id)
         DO UPDATE SET joined_at = CURRENT_TIMESTAMP
         RETURNING user_id, server_id, role, joined_at`,
        [user_id, id]
      )

      return res.status(201).json(result.rows[0])
    } catch (error) {
      console.error('Failed to join server:', error.message)
      return res.status(500).json({ message: 'Impossible de rejoindre le serveur.' })
    }
  })

  // Delete a server
  app.delete('/servers/:id', async (req, res) => {
    try {
      const { id } = req.params
      const result = await client.query('DELETE FROM server WHERE id = $1 RETURNING id', [id])
      if (result.rowCount === 0) return res.status(404).json({ message: 'Serveur introuvable.' })
      return res.json({ message: 'Supprimé', id: result.rows[0].id })
    } catch (error) {
      console.error('Failed to delete server:', error.message)
      return res.status(500).json({ message: 'Impossible de supprimer le serveur.' })
    }
  })
}
