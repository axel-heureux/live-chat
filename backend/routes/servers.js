module.exports = function registerServerRoutes(app, client) {
  // Ensure table exists
  (async () => {
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS serveur (
          id TEXT PRIMARY KEY,
          name VARCHAR(200) NOT NULL,
          description TEXT,
          owner_id UUID,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `)
    } catch (err) {
      console.error('Failed to ensure serveur table exists:', err.message)
    }
  })()

  // Get all servers (owned and custom)
  app.get('/servers', async (req, res) => {
    try {
      const result = await client.query('SELECT id, name, description, owner_id, created_at FROM serveur ORDER BY created_at DESC')
      return res.json(result.rows)
    } catch (error) {
      console.error('Failed to fetch servers:', error.message)
      return res.status(500).json({ message: 'Impossible de récupérer les serveurs.' })
    }
  })

  // Insert a new server
  app.post('/servers', async (req, res) => {
    try {
      const { id, name, description, owner_id } = req.body
      if (!id || !name) {
        return res.status(400).json({ message: 'Les champs id et name sont requis.' })
      }

      const query = 'INSERT INTO serveur(id, name, description, owner_id) VALUES($1, $2, $3, $4) RETURNING id, name, description, owner_id, created_at'
      const values = [id, name, description || null, owner_id || null]
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
      const { name, description } = req.body
      if (!name) return res.status(400).json({ message: 'Le champ name est requis.' })

      const query = 'UPDATE serveur SET name = $1, description = $2 WHERE id = $3 RETURNING id, name, description, owner_id, created_at'
      const values = [name, description || null, id]
      const result = await client.query(query, values)
      if (result.rowCount === 0) return res.status(404).json({ message: 'Serveur introuvable.' })
      return res.json(result.rows[0])
    } catch (error) {
      console.error('Failed to update server:', error.message)
      return res.status(500).json({ message: 'Impossible de mettre à jour le serveur.' })
    }
  })

  // Delete a server
  app.delete('/servers/:id', async (req, res) => {
    try {
      const { id } = req.params
      const result = await client.query('DELETE FROM serveur WHERE id = $1 RETURNING id', [id])
      if (result.rowCount === 0) return res.status(404).json({ message: 'Serveur introuvable.' })
      return res.json({ message: 'Supprimé', id: result.rows[0].id })
    } catch (error) {
      console.error('Failed to delete server:', error.message)
      return res.status(500).json({ message: 'Impossible de supprimer le serveur.' })
    }
  })
}
