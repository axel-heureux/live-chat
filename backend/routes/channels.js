module.exports = function registerChannelRoutes(app, client) {
  // Ensure table exists
  (async () => {
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS salon (
          id TEXT PRIMARY KEY,
          name VARCHAR(200) NOT NULL,
          type VARCHAR(20) NOT NULL,
          server_id TEXT NOT NULL,
          position INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `)
    } catch (err) {
      console.error('Failed to ensure salon table exists:', err.message)
    }
  })()

  // Get channels, optional server_id filter
  app.get('/channels', async (req, res) => {
    try {
      const { server_id } = req.query
      let query = 'SELECT id, name, type, server_id, position, created_at FROM salon'
      const values = []
      if (server_id) {
        query += ' WHERE server_id = $1'
        values.push(server_id)
      }
      query += ' ORDER BY position ASC, created_at ASC'
      const result = await client.query(query, values)
      return res.json(result.rows)
    } catch (error) {
      console.error('Failed to fetch channels:', error.message)
      return res.status(500).json({ message: "Impossible de récupérer les salons." })
    }
  })

  // Create a channel
  app.post('/channels', async (req, res) => {
    try {
      const { id, name, type, server_id, position } = req.body
      if (!id || !name || !type || !server_id) {
        return res.status(400).json({ message: 'Les champs id, name, type et server_id sont requis.' })
      }
      const query = 'INSERT INTO salon(id, name, type, server_id, position) VALUES($1,$2,$3,$4,$5) RETURNING id, name, type, server_id, position, created_at'
      const values = [id, name, type, server_id, position || 0]
      const result = await client.query(query, values)
      return res.status(201).json(result.rows[0])
    } catch (error) {
      console.error('Failed to create channel:', error.message)
      return res.status(500).json({ message: "Impossible de créer le salon." })
    }
  })

  // Update a channel
  app.put('/channels/:id', async (req, res) => {
    try {
      const { id } = req.params
      const { name, type, position } = req.body
      if (!name) return res.status(400).json({ message: 'Le champ name est requis.' })
      const query = 'UPDATE salon SET name = $1, type = $2, position = $3 WHERE id = $4 RETURNING id, name, type, server_id, position, created_at'
      const values = [name, type || 'text', position || 0, id]
      const result = await client.query(query, values)
      if (result.rowCount === 0) return res.status(404).json({ message: 'Salon introuvable.' })
      return res.json(result.rows[0])
    } catch (error) {
      console.error('Failed to update channel:', error.message)
      return res.status(500).json({ message: "Impossible de mettre à jour le salon." })
    }
  })

  // Delete a channel
  app.delete('/channels/:id', async (req, res) => {
    try {
      const { id } = req.params
      const result = await client.query('DELETE FROM salon WHERE id = $1 RETURNING id', [id])
      if (result.rowCount === 0) return res.status(404).json({ message: 'Salon introuvable.' })
      return res.json({ message: 'Supprimé', id: result.rows[0].id })
    } catch (error) {
      console.error('Failed to delete channel:', error.message)
      return res.status(500).json({ message: "Impossible de supprimer le salon." })
    }
  })
}
