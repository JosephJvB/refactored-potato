const redis = require('redis')
const PORT = process.env.redis_port || 6379
const HOST = process.env.redis_host || '127.0.0.1'
const client = redis.createClient(PORT, HOST)

module.exports = {
    exists,
    set,
    del,
}

function exists (key) {
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