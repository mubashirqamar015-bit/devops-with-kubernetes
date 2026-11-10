const http = require('http')
const fs = require('fs')

const filePath = process.env.FILE_PATH || '/usr/src/app/files/output.txt'
const counterFile = process.env.COUNTER_FILE || '/usr/src/app/data/pingpong.txt'

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    const log = fs.readFileSync(filePath, 'utf8')
    const counter = fs.readFileSync(counterFile, 'utf8')

    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end(`${log}Ping / Pongs: ${counter}`)
  } else {
    res.writeHead(404)
    res.end('Not found')
  }
})

server.listen(3000, () => {
  console.log('Server started on port 3000')
})