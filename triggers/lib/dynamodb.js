const DB = require('aws-sdk/clients/dynamodb')
const dbClient = new DB({
    accessKeyId: process.env.access_key,
    secretAccessKey: process.env.secret_key,
    region: 'ap-southeast-2'
})

const docParams = {
    TableName: 'recursive-message-lock',
    Key: { partitionKey: { s: 'LOCK' }, id: { s: 'LOCK' } }
}

module.exports = {
    get,
    update
}

function get () {
    return new Promise((resolve, reject) => {
        dbClient.getItem(docParams, (err, data) => {
            if(err) {
                console.error('dynamo get error:', err)
                reject(err)
            }
            console.log('GOT ITEM', data)
            resolve(data)
        })
    })
}
function update (blocked) {
    const updateData = {
        ...docParams,
        blocked: {
            L: blocked.map(id => ({s: id}))
        }
    }
    return new Promise((resolve, reject) => {
        dbClient.putItem(updateData, (err, data) => {
            if(err) {
                console.error('dynamo put error:', err)
                reject(err)
            }
            resolve(data)
        })
    })
}