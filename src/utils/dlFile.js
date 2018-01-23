const fs = require('fs')
const mkdirp = require('mkdirp')

const dl = require('./dlPipe').url

module.exports = (url /* : string */, dir /* : string */, filePath /* : string */) /* : Promise */  => {
  if (fs.existsSync(filePath)) {
    return Promise.reject(new Error(`[DL] ERROR: File exists: ${filePath}`))
  }

  mkdirp.sync(dir)
  const file = fs.createWriteStream(filePath)

  return new Promise((res, rej) => {
    dl(url, (response) => {
      response.pipe(file)
      file.on('finish', () => file.close(res))  // close() is async, call cb after close completes.
    })
    .on('error', (err) => {
      console.error(`[DL] GET Error: ${err.message}`)
      fs.unlink(filePath)
      rej(err)
    })
  })
}
