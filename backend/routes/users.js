module.exports = function registerUserRoutes(app, client) {
  app.get('/users', async (req, res) => {
    try {
      const result = await client.query(
        'SELECT id, COALESCE(name, pseudo) AS name, email, created_at FROM utilisateur ORDER BY id'
      )
      return res.json(result.rows)
    } catch (error) {
      console.error('Failed to fetch users:', error.message)
      return res.status(500).json({ message: 'Impossible de récupérer les utilisateurs.' })
    }
  })
}
