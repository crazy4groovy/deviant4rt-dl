require('./utils/ctrl-c')
const pad = require('lodash/padStart')
const getStream = require('get-stream')

const req = require('./utils/dlPipe').rss(async function processRss(response) {
  const a = await getStream(response)
  return JSON.parse(a)
})
const finfo = require('./utils/urlDirFilepath')('favs')
const queue = require('./utils/taskQueue')(8)
const dl = queue(require('./utils/dlFile')) // QUEUED DL!!

const [, , un, pg] = process.argv
const username = un || '' // <<------------------------------------------
let page = pg || 0

const limit = 60
let iTitle = page * limit

async function doDownloads({ map, username }) {
  const titles = Object.keys(map)
  console.log('DL:', titles.length)

  const dls = []
  for (const i in titles) {
      try {
          const title = titles[i]
          const url = map[title];
          if (!url) continue

          const { dir, filePath } = finfo(username, url, title)

          // await dl(url, dir, filePath) // synchronously
          dls.push(dl(url, dir, filePath)) // asynchronously QUEUED

          // console.log('QUEUED', i, filePath, dls.length)
      } catch(err) { console.log('C1', err.message); continue; }
  }
  // await Promise.all(dls).catch(err => console.error('ERROR during downloads:', err))
  console.log('QUEUED UP:', titles.length)
  return Promise.all(dls).catch(console.error)
}

(async function main() {
  while(true) {
    console.log(username, page)
    const data = await req(username, page * limit)
    if (!data.query.results || !data.query.results.rss.channel) break;

    const { item: items = [] } = data.query.results.rss.channel

    const map = items.reduce((coll, it = {}) => {
      if (it.content) {
        coll[`${pad(iTitle++, 4, '0')}-${it.title[0]}`] = it.content.url.replace(/https:/g, 'http:')
      }
      return coll
    }, {})

    //console.log(map)
    await doDownloads({ map, username })

    console.log('*********', items.length)
    if (items.length < (limit / 2)) break
    page++
  }
  console.log('Done Done!')
})()
