const { randomUUID } = require('crypto')
const http = require('http')

const randomString = randomUUID()

setInterval(() => {
  console.log(`${new Date().toISOString()}: ${randomString}`)
}, 5000)

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    const timestamp = new Date().toISOString()

    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end(`${timestamp}: ${randomString}`)
  } else {
    res.writeHead(404)
    res.end('Not found')
  }
})

server.listen(3000, () => {
  console.log('Server started on port 3000')
})

