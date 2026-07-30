const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const registerHealthRoutes = require('./routes/health');
const registerAuthRoutes = require('./routes/auth');
const registerUserRoutes = require('./routes/users');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:root@localhost:5432/live-chat'
});

const options = { userNameColumn: 'name' };

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

    try {
      const colRes = await client.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name='utilisateur' AND column_name IN ('pseudo','name') LIMIT 1"
      );
      if (colRes.rows && colRes.rows[0] && colRes.rows[0].column_name) {
        options.userNameColumn = colRes.rows[0].column_name;
      }
    } catch (err) {
      console.error('Failed to detect name column:', err.message);
    }

    console.log('Connected to PostgreSQL');
    registerHealthRoutes(app);
    registerAuthRoutes(app, client, options, bcrypt);
    registerUserRoutes(app, client);
  } catch (error) {
    console.error('PostgreSQL connection failed:', error);
  }
}

connectDb();

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
