const http = require('http')
const fs = require('fs/promises')
const path = require('path')

const port = process.env.PORT || 3000
const imagePath = path.join(__dirname, 'data', 'image.jpg')
const cacheDuration = 10 * 60 * 1000

let refreshPromise = null

async function downloadImage() {
  const response = await fetch('https://picsum.photos/1200')

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

      <form onsubmit="return false">
        <input
          type="text"
          name="todo"
          maxlength="140"
          placeholder="Write a todo..."
        >
        <button type="submit">Send</button>
      </form>

      <h2>Todos</h2>
      <ul>
        <li>Learn Kubernetes</li>
        <li>Complete exercise 1.13</li>
        <li>Build a Todo app</li>
      </ul>

      <img src="/todo/image" alt="Random picture">
    `)
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
