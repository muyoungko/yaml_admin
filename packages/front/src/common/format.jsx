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

    // 레코드 복사 (원본 수정 방지)
    let currentRecord = { ...record };

    // 변수가 없을 경우 null로 처리하여 재시도 (최대 10회)
    for (let retry = 0; retry < 10; retry++) {
        try {
            const argNames = Object.keys(currentRecord);
            const argValues = Object.values(currentRecord);

            // 백틱(`)이나 따옴표 문제 방지
            const template = String(if_expression).replace(/`/g, '\\`');

            // 동적으로 조건 평가
            // 내부 try-catch 제거하여 ReferenceError가 상위로 전파되도록 함
            const fn = new Function(...argNames, `return (${template});`);

            const result = fn(...argValues);
            return !!result;
        } catch (e) {
            if (e instanceof ReferenceError) {
                let missingVar = null;
                // V8 (Chrome, Node)
                const matchV8 = e.message.match(/(.*) is not defined/);
                if (matchV8) missingVar = matchV8[1];

                // Safari
                if (!missingVar) {
                    const matchSafari = e.message.match(/Can't find variable: (.*)/);
                    if (matchSafari) missingVar = matchSafari[1];
                }

                if (missingVar) {
                    // 없는 변수를 null로 설정하고 재시도
                    currentRecord[missingVar.trim()] = null;
                    continue;
                }
            }

            console.error('ifChecker error:', e);
            return false;
        }
    }
    return false;
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