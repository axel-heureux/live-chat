module.exports = function registerMembershipRoutes(app, client) {
  // Récupérer tous les utilisateurs (memberships) d'un serveur donné
  app.get('/servers/:serverId/users', async (req, res) => {
    try {
      const { serverId } = req.params;

      if (!serverId) {
        return res.status(400).json({ message: 'L\'ID du serveur est requis.' });
      }

      // Utilisation de $1 au lieu de l'ID en dur
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
      
      const result = await client.query(query, [serverId]);
      
      return res.json(result.rows);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error.message);
      return res.status(500).json({ message: 'Impossible de récupérer les utilisateurs.' });
    }
  });
}