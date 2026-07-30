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

async function connectDb() {
  try {
    await client.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Connected to PostgreSQL');
  } catch (error) {
    console.error('PostgreSQL connection failed:', error.message);
  }
}

connectDb();

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await client.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
      [name, email, hashedPassword]
    );
    return res.status(201).json({ message: 'Compte créé avec succès.' });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' });
    }
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis.' });
  }

  try {
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    return res.json({ message: 'Connexion réussie.', user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
