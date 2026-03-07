import React, { useMemo, useCallback } from 'react';
import {
    useRefresh,
} from 'react-admin';

import { useAdminContext } from '../AdminContext';
import { Box, Card, Paper, CardContent, Grid, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import YAMLComponent from './YAMLComponent';
import { useTheme, alpha } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import YAMLComponentTable from './YAMLComponentTable';

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

const cardGradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
];

export const YAMLComponentLayout = ({ components, custom, ...props }) => {
    const refresh = useRefresh();
    const yml = useAdminContext();
    const theme = useTheme();
    const mdUp = useMediaQuery(theme.breakpoints.up('md'));

    return (
        <Box
            sx={{
                minHeight: '100vh',
                padding: { xs: 2, md: 4 },
            }}
        >
            <Grid container spacing={3} >
                {components?.map((component, index) => {
                    console.log(`Dashboard Component [${index}] ${component.label}:`, component);
                    const gradientIndex = index % cardGradients.length;
                    return (
                        <Grid item key={index} size={{ xs: 12, md: component.size || 4 }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    borderRadius: 4,
                                    overflow: 'hidden',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    background: '#ffffff',
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette.primary.main, 0.08),
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                                        borderColor: alpha(theme.palette.primary.main, 0.2),
                                    },
                                }}
                            >
                                {/* Card Header with Gradient */}
                                <Box
                                    sx={{
                                        borderColor: theme.palette.primary.main,
                                        px: 3,
                                        py: 3,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                    }}
                                >
                                    {component.icon && (
                                        <Icon 
                                            icon={component.icon} 
                                            width={24} 
                                            height={24} 
                                            style={{ color: '#666' }} 
                                        />
                                    )}
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight: 600,
                                            color: '#333',
                                            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                        }}
                                    >
                                        {component.label}
                                    </Typography>
                                </Box>

                                {/* Card Content */}
                                <CardContent sx={{ p: 3 }}>
                                    {component.component === 'table' && <YAMLComponentTable component={component} />}
                                    {component.component === 'chart' && <YAMLComponent component={component} />}
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