import React, { useMemo, useCallback } from 'react';
import {
    useRefresh,
} from 'react-admin';

import { useAdminContext } from '../AdminContext';
import { Box, Card, Paper, CardContent, Grid, Typography } from '@mui/material';

import { useTheme, alpha } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import YAMLComponentTable from './YAMLComponentTable';
import YAMLComponentChart from './YAMLComponentChart';
import YAMLComponentWelcome from './YAMLComponentWelcome';
import YAMLComponentCount from './YAMLComponentCount';
import YAMLComponentList from './YAMLComponentList';
import YAMLIcon from './YAMLIcon';

// 컨테이너 근처에서

//Custom Import Start

//Custom Import End

const getChartIcon = (type) => {
    switch(type) {
        case 'line': return <TimelineIcon sx={{ fontSize: 20 }} />;
        case 'bar': return <BarChartIcon sx={{ fontSize: 20 }} />;
        case 'pie': return <PieChartIcon sx={{ fontSize: 20 }} />;
        default: return <TrendingUpIcon sx={{ fontSize: 20 }} />;
    }
};

const cardColors = [
    '#6366f1', // indigo
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#10b981', // emerald
    '#f59e0b', // amber
    '#f97316', // orange
    '#8b5cf6', // violet
    '#14b8a6', // teal
];

export const YAMLComponentLayout = ({ components, compact, custom, ...props }) => {
    const refresh = useRefresh();
    const yml = useAdminContext();
    const theme = useTheme();
    const mdUp = useMediaQuery(theme.breakpoints.up('md'));

    return (
        <Box
            sx={compact ? {} : {
                minHeight: '100vh',
                padding: { xs: 2, md: 4 },
            }}
        >
            <Grid container spacing={3} >
                {components?.map((component, index) => {
                    console.log(`Dashboard Component [${index}] ${component.label}:`, component);
                    const iconColor = cardColors[index % cardColors.length];

                    // welcome: full-width banner, no card wrapper
                    if (component.component === 'welcome') {
                        return (
                            <Grid item key={index} size={{ xs: 12, md: component.size || 12 }}>
                                <YAMLComponentWelcome component={component} iconColor={iconColor} />
                            </Grid>
                        );
                    }

                    // count: stat card, no card wrapper
                    if (component.component === 'count') {
                        return (
                            <Grid item key={index} size={{ xs: 12, md: component.size || 3 }}>
                                <YAMLComponentCount component={component} iconColor={iconColor} />
                            </Grid>
                        );
                    }

                    return (
                        <Grid item key={index} size={{ xs: 12, md: component.size || 4 }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    borderRadius: 4,
                                    overflow: 'hidden',
                                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    background: '#ffffff',
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette.divider, 0.1),
                                    position: 'relative',
                                }}
                            >
                                {/* Card Header with Gradient */}
                                <Box
                                    sx={{
                                        px: 3,
                                        py: 2.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                                    }}
                                >
                                    <YAMLIcon icon={component.icon} size={44} color={iconColor} />
                                    <Typography
                                        variant="body2"
                                        sx={{ color: 'text.primary', fontWeight: 700, mb: 0.5, noWrap: true }}
                                    >
                                        {component.label}
                                    </Typography>
                                </Box>

                                {/* Card Content */}
                                <CardContent sx={{ p: 3 }}>
                                    {component.component === 'table' && <YAMLComponentTable component={component} />}
                                    {component.component === 'chart' && <YAMLComponentChart component={component} />}
                                    {component.component === 'list' && <YAMLComponentList component={component} />}
                                </CardContent>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    )
};


export default YAMLComponentLayout;
