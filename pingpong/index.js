const http = require('http')

let counter = 0

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/pingpong') {
    counter++
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end(`pong ${counter}`)
  } else {
    res.writeHead(404)
    res.end('Not found')
  }
})

server.listen(3000, () => {
  console.log('Server started on port 3000')
})
