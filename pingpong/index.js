const http = require('http')
const { Pool } = require('pg')

const pool = new Pool()

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pingpong_counter (
      id INTEGER PRIMARY KEY,
      count BIGINT NOT NULL
    )
  `)

  await pool.query(`
    INSERT INTO pingpong_counter (id, count)
    VALUES (1, 0)
    ON CONFLICT (id) DO NOTHING
  `)
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/pingpong') {
      const result = await pool.query(`
        UPDATE pingpong_counter
        SET count = count + 1
        WHERE id = 1
        RETURNING count
      `)

      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end(`pong ${result.rows[0].count}`)
    } else if (req.method === 'GET' && req.url === '/pongs') {
      const result = await pool.query(`
        SELECT count FROM pingpong_counter WHERE id = 1
      `)

      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end(result.rows[0].count)
    } else {
      res.writeHead(404)
      res.end('Not found')
    }
  } catch (error) {
    console.error('Database error:', error)
    res.writeHead(500)
    res.end('Internal server error')
  }
})

async function startServer() {
  await initializeDatabase()

  server.listen(3000, () => {
    console.log('Server started on port 3000')
  })
}

startServer().catch(error => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
