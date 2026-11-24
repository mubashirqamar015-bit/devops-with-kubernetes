const http = require('http')
const { Pool } = require('pg')

const port = Number(process.env.PORT)

if (!port) {
  throw new Error('PORT environment variable is required')
}

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD
})

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      todo VARCHAR(140) NOT NULL
    )
  `)

  console.log('Database initialized')
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/todos') {
    try {
      const result = await pool.query(
        'SELECT id, todo FROM todos ORDER BY id'
      )

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(result.rows))
    } catch (error) {
      console.error('Failed to fetch todos:', error.message)
      res.writeHead(500)
      res.end('Database error')
    }
  } else if (req.method === 'POST' && req.url === '/todos') {
    let body = ''

    for await (const chunk of req) {
      body += chunk
    }

    try {
      const data = JSON.parse(body)

      if (!data.todo || typeof data.todo !== 'string') {
        res.writeHead(400)
        return res.end('Todo is required')
      }

      const result = await pool.query(
        'INSERT INTO todos (todo) VALUES ($1) RETURNING id, todo',
        [data.todo]
      )

      res.writeHead(201, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(result.rows[0]))
    } catch (error) {
      if (error instanceof SyntaxError) {
        res.writeHead(400)
        return res.end('Invalid JSON')
      }

      console.error('Failed to create todo:', error.message)
      res.writeHead(500)
      res.end('Database error')
    }
  } else {
    res.writeHead(404)
    res.end('Not found')
  }
})

initializeDatabase()
  .then(() => {
    server.listen(port, () => {
      console.log(`Todo backend started on port ${port}`)
    })
  })
  .catch(error => {
    console.error('Database initialization failed:', error.message)
    process.exit(1)
  })