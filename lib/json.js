const axios = require('axios')
const fs = require('fs')
const path = require('path')

const URL = 'https://api.unsplash.com//search/photos'

module.exports = {
    loadExampleJson,
    loadRemoteJson
}

async function loadRemoteJson (inputQuery) {
    try {
        const res = await axios({
            method: 'get',
            url: URL,
            params: {
                client_id: '5hGHo5piKDNaPTSRv-cSM8wdpMmlrUu7ylKY4abeK7g',//process.env.client_id,
                page: 1,
                query: inputQuery,
                per_page: 25
            }
        })
        return res.data.results
    } catch (e) {
        console.log('Error @ loadRemoteJson:', e.message)
    }
}

async function loadExampleJson () { // using this to avoid exceeding rate-limit
    const p = path.join(__dirname, '../../testing/example.json')
    const contents = fs.readFileSync(p, 'utf8')
    return JSON.parse(contents).results
}