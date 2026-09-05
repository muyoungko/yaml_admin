import React, { useMemo, useState, useEffect } from 'react';
import { useGetList } from 'react-admin';
import { useAdminContext } from '../AdminContext';
import { Box, Skeleton, Typography, Chip } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { filterToObject } from './YAMLFilterUtil';

function getNestedValue(record, path) {
    return path.split('.').reduce((obj, key) => {
        if (Array.isArray(obj)) return obj.map(item => item?.[key]).filter(v => v !== null && v !== undefined);
        return obj?.[key];
    }, record);
}

function renderValue(fieldDef, record) {
    const value = getNestedValue(record, fieldDef.name);
    if (value === null || value === undefined || value === '') return '-';

    switch (fieldDef.type) {
        case 'date':
            return new Date(value).toLocaleString('ko-KR', {
                year: '2-digit', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit',
            });
        case 'boolean':
            return value;   // handled as chip below
        case 'select': {
            const found = fieldDef.select_values?.find(s => s.name == value);
            return found?.label ?? String(value);
        }
        default:
            return String(value);
    }
}

export const YAMLComponentList = ({ component }) => {
    const { yml } = useAdminContext();
    const theme = useTheme();
    const [filter, setFilter] = useState({});

    const sort = useMemo(() => {
        const firstSort = Array.isArray(component.sort) ? component.sort[0] : null;
        if (!firstSort?.name) return { field: 'id', order: 'DESC' };
        return { field: firstSort.name, order: firstSort.desc ? 'DESC' : 'ASC' };
    }, [component.sort]);

    useEffect(() => {
        setFilter(filterToObject(component.filter));
    }, [component.filter]);

    const { data, isLoading, error } = useGetList(
        component.entity,
        {
            pagination: { page: 1, perPage: component.limit || 10 },
            sort,
            filter,
        },
        { enabled: Object.keys(filter).length > 0 || !component.filter }
    );

    if (isLoading) {
        return (
            <Box sx={{ width: '100%', ...(component.height ? { minHeight: component.height } : {}) }}>
                {Array.from({ length: component.limit || 5 }).map((_, i) => (
                    <Skeleton key={i} variant="text" height={44} sx={{ borderRadius: 1, mb: 0.5 }} />
                ))}
            </Box>
        );
    }

    if (error) return <Typography color="error" variant="body2">Error loading data</Typography>;

    const entityDef = yml?.entity?.[component.entity];
    if (!entityDef) return null;

    if (!data || data.length === 0) {
        return (
            <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
                {component.none ?? 'No data'}
            </Typography>
        );
    }

    const fieldConfs = component.fields ?? [];

    return (
        <Box sx={{ width: '100%', ...(component.height ? { minHeight: component.height } : {}) }}>
            {data.map((record, rowIdx) => {
                const fields = fieldConfs.map(fc => {
                    const fieldName = typeof fc === 'string' ? fc : fc.name;
                    // dot notation 지원: ils.key → entityDef.fields에서 ils 찾고 → ils.fields에서 key 찾기
                    const parts = fieldName.split('.');
                    let fieldDef = entityDef.fields.find(f => f.name === parts[0]);
                    for (let i = 1; i < parts.length; i++) {
                        fieldDef = fieldDef?.fields?.find(f => f.name === parts[i]);
                    }
                    // api_generate 필드 등 entityDef에 없는 경우도 허용 (string으로 렌더)
                    return { fieldConf: fc, fieldDef: fieldDef ?? { name: fieldName, type: 'string' }, fieldName };
                });

                return (
                    <Box
                        key={record.id ?? rowIdx}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            py: 1.25,
                            px: 0.5,
                            borderBottom: rowIdx < data.length - 1
                                ? `1px solid ${alpha(theme.palette.divider, 0.6)}`
                                : 'none',
                            '&:hover': {
                                background: alpha(theme.palette.primary.main, 0.04),
                                borderRadius: 1,
                            },
                        }}
                    >
                        {fields.map(({ fieldDef, fieldName, fieldConf }, colIdx) => {
                            const isFirst = colIdx === 0;
                            const isLast = colIdx === fields.length - 1;
                            const raw = getNestedValue(record, fieldName);
                            const value = renderValue(fieldDef, record);

                            // 배열 → 태그 목록
                            if (Array.isArray(raw)) {
                                return (
                                    <Box
                                        key={fieldName}
                                        sx={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 0.5,
                                            ml: isFirst ? 0 : 'auto',
                                            flex: isFirst ? 1 : undefined,
                                        }}
                                    >
                                        {raw.length === 0 ? (
                                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>-</Typography>
                                        ) : raw.map((item, i) => (
                                            <Chip
                                                key={i}
                                                label={String(item)}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.7rem',
                                                    fontWeight: 500,
                                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                    color: theme.palette.primary.main,
                                                    border: 'none',
                                                }}
                                            />
                                        ))}
                                    </Box>
                                );
                            }

                            if (fieldDef.type === 'boolean') {
                                return (
                                    <Chip
                                        key={fieldName}
                                        label={raw ? (fieldConf?.true_label ?? 'Y') : (fieldConf?.false_label ?? 'N')}
                                        size="small"
                                        sx={{
                                            height: 20,
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            bgcolor: raw
                                                ? alpha('#10b981', 0.12)
                                                : alpha('#ef4444', 0.12),
                                            color: raw ? '#059669' : '#dc2626',
                                            border: 'none',
                                            ml: isFirst ? 0 : 'auto',
                                        }}
                                    />
                                );
                            }

                            return (
                                <Typography
                                    key={fieldName}
                                    variant="body2"
                                    noWrap
                                    sx={{
                                        flex: isFirst ? 1 : undefined,
                                        ml: !isFirst && !isLast ? 0 : undefined,
                                        ml: isLast ? 'auto' : undefined,
                                        fontWeight: isFirst ? 600 : 400,
                                        color: isFirst ? 'text.primary' : 'text.secondary',
                                        fontSize: isFirst ? '0.85rem' : '0.78rem',
                                        textAlign: isLast ? 'right' : 'left',
                                        flexShrink: isFirst ? 1 : 0,
                                    }}
                                >
                                    {value}
                                </Typography>
                            );
                        })}
                    </Box>
                );
            })}
        </Box>
    );
};

export default YAMLComponentList;
