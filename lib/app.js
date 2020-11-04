const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this protected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/authors', async(req, res) => {
  try {
    const data = await client.query('SELECT * from authors');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/authors/:id', async(req, res) => {
  try {
    const authorId = req.params.id;

    const data = await client.query(`
      SELECT * from authors 
      WHERE authors.id=$1
      `, [authorId]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});


app.post('/authors/', async(req, res) => {
  try {
    const newAuthor = req.body.author_name;
    const newPublications = req.body.published_books;
    const newLiving = req.body.living;
    const newBorn = req.body.born;
    const newOwnerId = req.body.owner_id;


    const data = await client.query(`
      INSERT INTO authors (author_name, published_books, living, born, owner_id) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
    
    [newAuthor, newPublications, newLiving, newBorn, newOwnerId]);
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.put('/authors/:id', async(req, res) => {
  try {
    const newAuthor = req.body.author_name;
    const newPublications = req.body.published_books;
    const newLiving = req.body.living;
    const newBorn = req.body.born;
    const newOwnerId = req.body.owner_id;

    const data = await client.query(`
      UPDATE authors
      SET author_name = $1,
      published_books = $2,
      living = $3,
      born = $4,
      owner_id = $5
      WHERE authors.id = $6
      RETURNING *;
    `,
    [newAuthor, newPublications, newLiving, newBorn, newOwnerId, req.params.id]);
    
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/authors/:id', async(req, res) =>{
  try {
    const authorId = req.params.id;

    const data = await client.query(`
      DELETE from authors
      WHERE authors.id = $1
    `,
    [authorId]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
