module.exports = selectPhotos

function selectPhotos (data) {
    const photos = []
    let len = data.length
    while (photos.length < 25) {
        if(len < 0) {
            throw new Error('Failed to select 25 valid photos')
        }
        const idx = Math.floor(Math.random() * len--)
        if(data[idx] && data[idx].id && data[idx].links.download) {
            photos.push(data[idx])
            data.splice(idx, 1)
        }
    }
    return photos
}