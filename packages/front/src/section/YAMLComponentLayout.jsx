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
                                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    background: '#ffffff',
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette.divider, 0.1),
                                    position: 'relative',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)',
                                        borderColor: 'transparent',
                                        zIndex: 1,
                                    },
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
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '4px',
                                            height: '100%',
                                            background: cardGradients[gradientIndex],
                                        }
                                    }}
                                >
                                    {component.icon && (
                                        <Box
                                            sx={{
                                                width: 42,
                                                height: 42,
                                                borderRadius: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: cardGradients[gradientIndex],
                                                boxShadow: '0 8px 16px -4px rgba(0,0,0,0.2)',
                                                color: '#fff',
                                                transition: 'transform 0.3s ease',
                                                '.MuiPaper-root:hover &': {
                                                    transform: 'scale(1.1) rotate(5deg)',
                                                }
                                            }}
                                        >
                                            <Icon 
                                                icon={component.icon} 
                                                width={22} 
                                                height={22} 
                                                style={{ color: '#fff' }} 
                                            />
                                        </Box>
                                    )}
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight: 700,
                                            color: '#2c3e50',
                                            letterSpacing: '0.5px',
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