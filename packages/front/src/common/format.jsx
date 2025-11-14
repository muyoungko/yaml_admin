/**
 * example 
 *  ${name}(${parent_id})
 *  ${name}${parent_id?'(도면)':''}
 * 
 * @param {*} format_string  
 * @param {*} record 
 * @returns 
 */
const format = (format_string, record) => {
    if (!format_string) return ''
    const ctx = record || {}
    try {
        const argNames = Object.keys(ctx)
        const argValues = argNames.map(k => ctx[k])
        const template = String(format_string).replace(/`/g, '\\`')
        const fn = new Function(...argNames, `return \`${template}\`;`)
        const result = fn(...argValues)
        return result == null ? '' : String(result)
    } catch (e) {
        try {
            let out = String(format_string)
            out = out.replace(/\$\{([^}]+)\}/g, (_, expr) => {
                try {
                    const getter = new Function('ctx', `with (ctx) { return (${expr}); }`)
                    const val = getter(ctx)
                    return val == null ? '' : String(val)
                } catch (err) {
                    const simple = ctx[expr.trim()]
                    return simple == null ? '' : String(simple)
                }
            })
            return out
        } catch {
            return ''
        }
    }
}

const getQueryStringValue = (q) => {
    let paramsString = ''
    if (window.location.search && window.location.search.length > 1) {
        paramsString = window.location.search.substring(1)
    } else {
        const hash = window.location.hash || ''
        const qIndex = hash.indexOf('?')
        if (qIndex !== -1) {
            paramsString = hash.substring(qIndex + 1)
        }
    }
    let params = new URLSearchParams(paramsString)
    let value = params.get(q)
    return value
    
}
export { format, getQueryStringValue }