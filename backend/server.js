const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:root@localhost:5432/live-chat'
});

let userNameColumn = 'name';

async function connectDb() {
  try {
    await client.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS utilisateur (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        pseudo VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        custom_status VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // detect whether the table uses `pseudo` or `name` for the display name
    try {
      const colRes = await client.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name='utilisateur' AND column_name IN ('pseudo','name') LIMIT 1"
      );
      if (colRes.rows && colRes.rows[0] && colRes.rows[0].column_name) {
        userNameColumn = colRes.rows[0].column_name;
      }
    } catch (err) {
      console.error('Failed to detect name column:', err.message);
    }

    console.log('Connected to PostgreSQL');
  } catch (error) {
    console.error('PostgreSQL connection failed:', error);
  }
}

connectDb();

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/auth/signup', async (req, res) => {
  const { name, pseudo, email, password } = req.body;

  if (!(name || pseudo) || !email || !password) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const displayName = name || pseudo || '';
    const insertQuery = `INSERT INTO utilisateur (${userNameColumn}, email, password) VALUES ($1, $2, $3) RETURNING id`;
    const result = await client.query(insertQuery, [displayName, email, hashedPassword]);
    return res.status(201).json({
      message: 'Compte créé avec succès.',
      user: { id: result.rows[0].id, name: displayName, email }
    });
  } catch (error) {
    console.error('Signup error:', error);
    if (error && error.code === '23505') {
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' });
    }
    return res.status(500).json({ message: 'Erreur serveur. Voir logs pour plus de détails.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis.' });
  }

  try {
    const result = await client.query('SELECT * FROM utilisateur WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    const displayName = user ? (user[userNameColumn] || user.name || user.pseudo) : null;
    return res.json({ message: 'Connexion réussie.', user: { id: user.id, name: displayName, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

app.get('/users', async (req, res) => {
  try {
    const result = await client.query('SELECT id, COALESCE(name, pseudo) AS name, email, created_at FROM utilisateur ORDER BY id');
    return res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch users:', error.message);
    return res.status(500).json({ message: 'Impossible de récupérer les utilisateurs.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
