require('request')
const request = require('request-promise-native')

function doPersist(body) {
  const options = {
      method: 'POST',
      uri: 'https://api.myjson.com/bins', // free JSON storage
      json: true, // Automatically string-ify the body to JSON
      body // payload object/array
  }

  return request(options)
  .then(data => data.uri)
  .catch(err => console.log('ERR1', err))
}

try { module.exports = doPersist } catch (ignore) {}
