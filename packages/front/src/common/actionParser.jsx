/**
  - type: body
    crud : list
    entity: item
    filter:
        - name: region_id
        value: $arg0
    sort:
        - name: seq
        desc: false
 * @param {*} action 
 * @param {*} args 
 * @returns 
 */

const act = (action, args, {navigate}) => {
    if (!action || !action.type) return action
    if (action.type === 'body') {
        let { crud, entity, filter, sort } = action
        let url = `/${entity}`

        const filterObject = {}
        if (Array.isArray(filter)) {
            filter.forEach((f) => {
                if (!f || !f.name) return
                let value = f.value
                if (typeof value === 'string' && value.startsWith('$arg')) {
                    const index = parseInt(value.replace('$arg', ''), 10)
                    if (Array.isArray(args)) value = args[index]
                    else if (args && typeof args === 'object') value = args[index]
                }
                filterObject[f.name] = value
            })
        }

        const params = new URLSearchParams()
        if (Object.keys(filterObject).length > 0) {
            params.set('filter', JSON.stringify(filterObject))
        }

        // sort: 첫 번째 정렬 조건만 사용 (react-admin과 호환: sort, order)
        if (Array.isArray(sort) && sort.length > 0 && sort[0]?.name) {
            params.set('sort', sort[0].name)
            params.set('order', sort[0].desc ? 'DESC' : 'ASC')
        }

        const qs = params.toString()
        const fullUrl = qs ? `${url}?${qs}` : url

        if (typeof navigate === 'function') {
            navigate(fullUrl)
            return null
        }
        return fullUrl
    }
    return action
}

export { act }