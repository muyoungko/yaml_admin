import React, { useState, useEffect } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import axiosInstance from '../common/axios';
import YAMLIcon from './YAMLIcon';
import { filterToQueryString } from './YAMLFilterUtil';

export const YAMLComponentCount = ({ component }) => {
    const { entity, filter, icon, label, desc, unit } = component;
    const theme = useTheme();
    const [count, setCount] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!entity) return;

        const queryString = `_start=0&_end=1&${filterToQueryString(filter)}`;

        axiosInstance.get(`/${entity}?${queryString}`)
            .then(res => {
                setCount(parseInt(res.headers['x-total-count'] ?? 0));
            })
            .catch(() => setCount(null))
            .finally(() => setLoading(false));
    }, [entity]);

    return (
        <Box
            sx={{
                borderRadius: 3,
                p: 3,
                background: '#ffffff',
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.1),
                display: 'flex',
                alignItems: 'center',
                gap: 2.5,
                height: '100%',
                boxSizing: 'border-box',
            }}
        >
            {/* Icon badge */}
            <YAMLIcon icon={icon} size={44} />

            {/* Text */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.5, noWrap: true }}
                >
                    {label}
                </Typography>

                {loading ? (
                    <Skeleton variant="text" width={60} height={40} />
                ) : (
                    <Typography
                        variant="h4"
                        sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1 }}
                    >
                        {count?.toLocaleString() ?? '-'}
                        {unit && (
                            <Typography
                                component="span"
                                variant="body2"
                                sx={{ fontWeight: 500, color: 'text.secondary', ml: 0.5 }}
                            >
                                {unit}
                            </Typography>
                        )}
                    </Typography>
                )}

                {desc && (
                    <Typography
                        variant="caption"
                        sx={{ color: 'text.disabled', mt: 0.5, display: 'block' }}
                    >
                        {desc}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default YAMLComponentCount;
