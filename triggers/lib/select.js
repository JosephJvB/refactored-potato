module.exports = selectPhotosUrls

function selectPhotosUrls (data) {
    const urls = []
    let len = data.length
    while (urls.length < 25) {
        if(len < 0) {
            return null
        }
        const idx = Math.floor(Math.random() * len--)
        if(data[idx] && data[idx].links.download) {
            urls.push(data[idx].links.download)
            data.splice(idx, 1)
        }
    }
    return urls
}