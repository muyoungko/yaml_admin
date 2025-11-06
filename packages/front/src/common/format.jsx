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

export { format }