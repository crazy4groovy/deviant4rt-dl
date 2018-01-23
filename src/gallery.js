require('./utils/ctrl-c')
const random = require('lodash/random')
const pad = require('lodash/padStart')
const Damn = require('damn')

const persist = require('./utils/persist')
const finfo = require('./utils/urlDirFilepath')('gallery')
const queue = require('./utils/taskQueue')(8)
const dl = queue(require('./utils/dlFile')) // QUEUED DL!!

const [, , un, pg] = process.argv
const username = un || '' // <<--------------------------------
let page = pg || 0

const doPersist = false
const process1 = require('../keys.json')

const cloneShallow = (...objs) => Object.assign({}, ...objs)
const cloneDeep = obj => JSON.parse(JSON.stringify(obj))
const delaySecs = s => new Promise(r => setTimeout(r, s * 1000))

const limit = 24
let iTitle = page * limit
const reduceContent = (col, a) => {
    col[`${pad(iTitle++, 4, '0')}-${a.title}`] = a.content && a.content.src.replace(/https:/g, 'http:')
    return col
}

function getCreds() {
    const useKey = random(1, Object.keys(process1.env).length)
    const creds = process1.env[`DEVIANTART_SECRET_KEY${useKey}`].split(':')
    console.log('KEY #', useKey, creds)
    return creds
}

async function doGalleryWork({ username = '', persist = false }, cbContent) {
    let da = await Damn.clientCredentials(...getCreds())

    /*
    const fs = await Promise.all('lmn'.split('').map(l => da.userFriendsSearch(username, l)))
    console.log(JSON.stringify(fs, null, 2))
    // jq: .[][].username
    */

    const qs = { limit, mature_content: true }
    const map = {}
    let lastLength = limit

    while (true) {
        qs.offset = limit * page
        console.log('PAGE', page, iTitle, username)

        const results = (await da.galleryAll(username, qs)) || []  // QUERY

        console.log(Object.keys(results).length)
        const mappedContent = results.reduce(reduceContent, {})

        if (cbContent) await cbContent({ map: mappedContent, username })

        Object.assign(map, mappedContent)

        if (Object.keys(results).length === 0) {
            if (lastLength === limit) {
                console.log('!THROTTLING...', new Date().toLocaleString())
                await delaySecs((Math.random() * 60) + 120)
                da = await Damn.clientCredentials(...getCreds())
                continue
            }
            else break
        }

        lastLength = Object.keys(results).length
        page++
        await delaySecs((Math.random() + 1) * 4 + 30)
    }

    const total = Object.keys(map).length // REDUCE
    const csv = Object.keys(map).map(a => map[a]).join(';')

    return { csv, map, total, username } // return bulk response
}

// -----------------------------------------------------------------------------

async function doDownloads({ map, username }) {
    const titles = Object.keys(map)
    console.log('DL:', titles.length)

    const dls = []
    for (const i in titles) {
        try {
            const title = titles[i]
            const url = map[title]
            if (!url) continue

            const { dir, filePath } = finfo(username, url, title)

            // await dl(url, dir, filePath) // synchronously
            dls.push(dl(url, dir, filePath)) // asynchronously QUEUED

            // console.log('QUEUED', i, filePath, dls.length)
        } catch(err) { console.log(err.message); continue; }
    }
    // await Promise.all(dls).catch(err => console.error('ERROR during downloads:', err))
    console.log('QUEUED UP:', titles.length)
    return Promise.all(dls).catch(console.error)
}

doGalleryWork({ username }, doDownloads) // dl files as batches
.catch(console.error)
.then(async (data) => Object.assign(data, { persistedTo: doPersist ? (await persist(data.map)) : null }))
// .then(doDownloads) // dl entire file list in bulk
.then(() => console.log('DONE DONE!'))

/*
exports.endpoint = async function(req, res) {
    try {
        const { url } = req
        const { query } = require('url').parse(url, true)

        if (!query.username) {
            res.end('no username')
            return
        }

        const result = await doGalleryWork(query)
        res.end(JSON.stringify(result))
    } catch (err) {
        res.end('KABOOM: ' + err.message)
    }
}
*/
