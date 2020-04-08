const redis = require('redis')
let client;

module.exports = {
    exists,
    set,
    del,
    close
}

function init () {
    const PORT = process.env.redis_port || 6379
    const HOST = process.env.redis_host || '127.0.0.1'
    client = redis.createClient(PORT, HOST)
}

function exists (key) {
    if(!client) init()
    return new Promise((resolve, reject) => {
        return client.exists(key, (err, int) => {
            if(err) {
                console.error('Redis exists error:', err)
                reject(err)
            }
            resolve(int)
        })
    })
}
function set (key, value) {
    if(!client) init()
    return new Promise((resolve, reject) => {
        return client.set(key, value, (err) => {
            if(err) {
                console.error('Redis set error:', err)
                reject(err)
            }
            resolve(true)
        })
    })
}
function del (key) {
    if(!client) init()
    return new Promise((resolve, reject) => {
        return client.del(key, (err, int) => {
            if(err) {
                console.error('Redis del error:', err)
                reject(err)
            }
            resolve(int)
        })
    })
}
function close () {
    if(!client) return
    client.quit()
    client = null
}