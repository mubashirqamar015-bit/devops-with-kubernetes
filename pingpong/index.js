const http = require('http')
const fs = require('fs')

const counterFile = process.env.COUNTER_FILE || '/usr/src/app/data/pingpong.txt'

if (!fs.existsSync(counterFile)) {
  fs.writeFileSync(counterFile, '0')
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/pingpong') {
    let counter = Number(fs.readFileSync(counterFile, 'utf8'))

    counter++

    fs.writeFileSync(counterFile, String(counter))

    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end(`pong ${counter}`)
  } else if (req.method === 'GET' && req.url === '/pongs') {
    const counter = fs.readFileSync(counterFile, 'utf8')

    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end(counter)
  } else {
    res.writeHead(404)
    res.end('Not found')
  }
})

server.listen(3000, () => {
  console.log('Server started on port 3000')
})
