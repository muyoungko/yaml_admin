const makeMongoSortFromYml = (sort) => {
    sort = sort || []
    let r = {}
    sort.map(m=>{ 
        r[m.name] = m.desc == true ? -1 : 1
    })
    return r
}

module.exports = {
    makeMongoSortFromYml
}