module.exports = function registerAuthRoutes(app, client, options, bcrypt) {
  app.post('/api/auth/signup', async (req, res) => {
    const { name, pseudo, email, password } = req.body

    if (!(name || pseudo) || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' })
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10)
      const displayName = name || pseudo || ''
      const insertQuery = `INSERT INTO utilisateur (${options.userNameColumn}, email, password) VALUES ($1, $2, $3) RETURNING id`
      const result = await client.query(insertQuery, [displayName, email, hashedPassword])
      return res.status(201).json({
        message: 'Compte créé avec succès.',
        user: { id: result.rows[0].id, name: displayName, email }
      })
    } catch (error) {
      console.error('Signup error:', error)
      if (error && error.code === '23505') {
        return res.status(409).json({ message: 'Cet email est déjà utilisé.' })
      }
      return res.status(500).json({ message: 'Erreur serveur. Voir logs pour plus de détails.' })
    }
  })

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' })
    }

    try {
      const result = await client.query('SELECT * FROM utilisateur WHERE email = $1', [email])
      const user = result.rows[0]

      if (!user) {
        return res.status(401).json({ message: 'Identifiants invalides.' })
      }

      const valid = await bcrypt.compare(password, user.password)
      if (!valid) {
        return res.status(401).json({ message: 'Identifiants invalides.' })
      }

      const displayName = user ? (user[options.userNameColumn] || user.name || user.pseudo) : null
      return res.json({ message: 'Connexion réussie.', user: { id: user.id, name: displayName, email: user.email } })
    } catch (error) {
      console.error('Login error:', error)
      return res.status(500).json({ message: 'Erreur serveur.' })
    }
  })
}
