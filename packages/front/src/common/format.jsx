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

/**
 * 
 * if_expression example: 
 * floor_id==null
 * floor_id!=null
 * 
 * @param {string} if_expression 
 * @param {object} record 
 * @returns {boolean}
 */
const ifChecker = (if_expression, record = {}) => {
    if (!if_expression) return false;
    try {
      // 안전하게 record의 키를 함수 인자로 전달
      const argNames = Object.keys(record);
      const argValues = Object.values(record);
  
      // 백틱(`)이나 따옴표 문제 방지
      const template = String(if_expression).replace(/`/g, '\\`');
  
      // 동적으로 조건 평가
      const fn = new Function(...argNames, `
        try {
          return (${template});
        } catch (e) {
          return false;
        }
      `);
  
      const result = fn(...argValues);
      return !!result;
    } catch (e) {
      console.error('ifChecker error:', e);
      return false;
    }
  };

/**
 * react-admin HashRouter용 쿼리 파라미터 파싱
 * location.hash에서 쿼리 파라미터를 추출하여 URLSearchParams 반환
 *
 * @param {object} location - react-router location 객체
 * @returns {URLSearchParams}
 */
const parseQuery = (location) => {
    const hashSearch = window.location.href.split('?')[1] || '';
    return new URLSearchParams(hashSearch);
};

export { format, ifChecker, parseQuery }