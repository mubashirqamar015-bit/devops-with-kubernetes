const http = require('http')
const fs = require('fs/promises')

const port = Number(process.env.PORT)
const backendUrl = process.env.BACKEND_URL
const imageUrl = process.env.IMAGE_URL
const cacheDuration = Number(process.env.CACHE_DURATION)
const imagePath = process.env.IMAGE_PATH

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('A valid PORT environment variable is required')
}

if (!backendUrl || !imageUrl || !imagePath) {
  throw new Error('BACKEND_URL, IMAGE_URL and IMAGE_PATH are required')
}

if (!Number.isFinite(cacheDuration) || cacheDuration < 0) {
  throw new Error('A valid CACHE_DURATION environment variable is required')
}

let refreshPromise = null

async function downloadImage() {
  const response = await fetch(imageUrl)

  if (!response.ok) {
    throw new Error(`Image download failed: ${response.status}`)
  }

  const image = Buffer.from(await response.arrayBuffer())
  const temporaryPath = `${imagePath}.tmp`

  await fs.writeFile(temporaryPath, image)
  await fs.rename(temporaryPath, imagePath)

  console.log('New image downloaded and cached')
}

async function refreshImage() {
  if (!refreshPromise) {
    refreshPromise = downloadImage()
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

async function getImage() {
  try {
    const stats = await fs.stat(imagePath)
    const age = Date.now() - stats.mtimeMs

    if (age > cacheDuration) {
      refreshImage().catch(error => {
        console.error('Image refresh failed:', error.message)
      })
    }

    return fs.readFile(imagePath)
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }

    await refreshImage()
    return fs.readFile(imagePath)
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/todo') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(`
      <h1>Todo app</h1>

      <form id="todo-form">
        <input
          type="text"
          id="todo-input"
          maxlength="140"
          placeholder="Write a todo..."
          required
        >
        <button type="submit">Send</button>
      </form>

      <h2>Todos</h2>
      <ul id="todo-list"></ul>

      <img src="/todo/image" alt="Random picture">

      <script>
        const form = document.querySelector('#todo-form')
        const input = document.querySelector('#todo-input')
        const list = document.querySelector('#todo-list')

        async function loadTodos() {
          const response = await fetch('/todo/todos')

          if (!response.ok) {
            throw new Error('Failed to fetch todos')
          }

          const todos = await response.json()

          list.replaceChildren()

          for (const todo of todos) {
            const item = document.createElement('li')
            item.textContent = todo.todo
            list.appendChild(item)
          }
        }

        form.addEventListener('submit', async event => {
          event.preventDefault()

          const todo = input.value.trim()

          if (!todo) return

          const response = await fetch('/todo/todos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ todo })
          })

          if (!response.ok) {
            alert('Failed to create todo')
            return
          }

          input.value = ''
          await loadTodos()
        })

        loadTodos().catch(error => {
          console.error(error)
          list.textContent = 'Unable to load todos'
        })
      </script>
    `)
  } else if (
    (req.method === 'GET' || req.method === 'POST') &&
    req.url === '/todo/todos'
  ) {
    try {
      let options = {}

      if (req.method === 'POST') {
        let body = ''

        for await (const chunk of req) {
          body += chunk
        }

        options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body
        }
      }

      const response = await fetch(`${backendUrl}/todos`, options)
      const data = await response.text()

      res.writeHead(response.status, {
        'Content-Type': 'application/json'
      })
      res.end(data)
    } catch (error) {
      console.error('Todo backend request failed:', error.message)
      res.writeHead(502)
      res.end('Todo backend unavailable')
    }
  } else if (req.method === 'GET' && req.url === '/todo/image') {
    try {
      const image = await getImage()

      res.writeHead(200, { 'Content-Type': 'image/jpeg' })
      res.end(image)
    } catch (error) {
      console.error('Unable to get image:', error.message)
      res.writeHead(500)
      res.end('Unable to load image')
    }
  } else {
    res.writeHead(404)
    res.end('Not found')
  }
})

server.listen(port, () => {
  console.log(`Server started in port ${port}`)
})