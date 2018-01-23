const http = require('http')
const https = require('https')
var qs = require('querystring');


const opts = {
  method: 'GET',
}

module.exports = {
  url: (url, cb) => http.get(url, cb),

  rss: (cb) => (username, offset) => {
    // http://backend.deviantart.com/rss.xml?q=favby:username&type=deviation&offset=0
    const q = qs.stringify({ q: `favby:${username}`, type: 'deviation', offset }).replace('%3A', ':')
    console.log('>> Q', q)

    // Note: calling the endpoint directly is flaky (at best) from non-browser clients
    // So uses YQL service, and converts from XML/RSS feed into JSON!
    const url = `https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%20%3D%20'http%3A%2F%2Fbackend.deviantart.com%2Frss.xml%3Fq%3Dfavby%3A${username}%26type%3Ddeviation%26offset%3D${offset}'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys`
    console.log('>> URL path', url)

    return new Promise((res, rej) => {
      https.get(url, response => res(cb(response)))
    })
  }
}
