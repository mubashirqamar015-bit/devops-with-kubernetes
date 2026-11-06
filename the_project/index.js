const http = require('http')

const port = process.env.PORT || 3000

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end('<h1>Todo app</h1>')
  } else {
    res.writeHead(404)
    res.end('Not found')
  }
})

server.listen(port, () => {
  console.log(`Server started in port ${port}`)
})

