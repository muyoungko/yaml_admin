const moment = require('moment')
const fs = require('fs')

const withConfigLocal = ({path, path_private, base_url, api_host}) => {

    const upload = async (key, stream) => {
        return await fs.writeFileSync(path + '/' + key, stream)
    }

    const uploadSecure = async (key, stream) => {
        return await fs.writeFileSync(path_private + '/' + key, stream)
    }

    const getUrlSecure = async (Key, auth) => { 
        let r = `${api_host}/local-secure-download?key=${Key}`
        let shortToken = await auth.genenrateShortToken()
        r += `&token=${shortToken}`
        return r
    }

    return {
        upload,
        uploadSecure,
        getUrl: async (key) => {
            return await getUrl(key)
        },
        getUrlSecure,
    }
}

module.exports = {
    withConfigLocal
};