const http = require('http')
const fs = require('fs')

const filePath = process.env.FILE_PATH || '/usr/src/app/files/output.txt'

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    try {
      const log = fs.readFileSync(filePath, 'utf8')

      const response = await fetch('http://pingpong-svc:3000/pongs')

      if (!response.ok) {
        throw new Error(`Ping Pong returned ${response.status}`)
      }

      const counter = await response.text()

      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end(`${log}Ping / Pongs: ${counter}`)
    } catch (error) {
      console.error('Failed to retrieve log or pong count:', error.message)
      res.writeHead(500)
      res.end('Unable to retrieve application data')
    }
  } else {
    res.writeHead(404)
    res.end('Not found')
  }
})

server.listen(3000, () => {
  console.log('Server started on port 3000')
})
