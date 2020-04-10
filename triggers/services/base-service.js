module.exports = class BaseService {
    constructor(name) {
        this.name = name
    }

    logAndThrow(e) {
        if(e.isAxiosError) {
            e.message = e.response.data.message || e.message || 'Unknown Axios error'
            e.statusCode = e.response.status
        }
        e.message = `Error @ ${this.name}\n${e.message}`
        console.error(e)
        throw e
    }
}