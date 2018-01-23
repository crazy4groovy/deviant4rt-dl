const path = require('path')
const sanitize = require('sanitize-filename')

module.exports = group => (username, url, title) => {
  const tag = sanitize(url.split('.').pop())
  const dir = `./${group}/${username}/`
  const fileName = `./${sanitize(title)}.${tag}`
  const filePath = path.resolve(dir, fileName)

  return { dir, filePath }
}
