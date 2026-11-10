const { randomUUID } = require('crypto')
const fs = require('fs')

const randomString = randomUUID()
const filePath = process.env.FILE_PATH || '/usr/src/app/files/output.txt'

function writeLog() {
  const log = `${new Date().toISOString()}: ${randomString}\n`

  fs.writeFileSync(filePath, log)
}

writeLog()
setInterval(writeLog, 5000)
