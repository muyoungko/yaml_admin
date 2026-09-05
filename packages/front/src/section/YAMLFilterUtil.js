const COMPARISON_OPS = ['$lte ', '$gte ', '$lt ', '$gt '];

function resolveFilterValue(f) {
    let value = f.value;

    if (value === undefined || value === null) return null;

    if (typeof value === 'string') {
        if (COMPARISON_OPS.some(op => value.includes(op))) {
            return value; // e.g. "$lte 100" — keep as-is
        }
        if (value.startsWith('$')) {
            value = localStorage.getItem(value.substring(1));
            if (value === null || value === undefined) return null;
        }
    }

    if (f.type === 'integer') {
        value = parseInt(value);
        if (isNaN(value)) return null;
    }

    return value;
}

/**
 * Returns a plain object { name: resolvedValue } for use as a react-admin filter.
 */
export function filterToObject(filters) {
    if (!filters) return {};
    const result = {};
    filters.forEach(f => {
        const value = resolveFilterValue(f);
        if (value !== null && value !== undefined) {
            result[f.name] = value;
        }
    });
    return result;
}

/**
 * Returns a query string "name=value&..." for use in manual fetch calls.
 */
export function filterToQueryString(filters) {
    if (!filters) return '';
    let query = '';
    filters.forEach(f => {
        const value = resolveFilterValue(f);
        if (value !== null && value !== undefined) {
            query += `${f.name}=${encodeURIComponent(value)}&`;
        }
    });
    return query;
}
