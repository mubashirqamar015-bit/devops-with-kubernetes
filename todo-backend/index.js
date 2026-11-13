const http = require('http')

const todos = []

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/todos') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(todos))
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

      const todo = {
        id: todos.length + 1,
        todo: data.todo
      }

      todos.push(todo)

      res.writeHead(201, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(todo))
    } catch {
      res.writeHead(400)
      res.end('Invalid JSON')
    }
  } else {
    res.writeHead(404)
    res.end('Not found')
  }
})

server.listen(3000, () => {
  console.log('Todo backend started on port 3000')
})
