import React, { useMemo, useCallback } from 'react';
import {
    useRefresh,
} from 'react-admin';

import { useNavigate } from 'react-router-dom';
import { useAdminContext } from '../AdminContext';
import { Box, Grid, Card, CardContent, CardHeader } from '@mui/material';
import Component from './Component';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// 컨테이너 근처에서

//Custom Import Start

//Custom Import End

export const ComponentLayout = ({ components, custom, ...props }) => {
    const navigate = useNavigate()
    const refresh = useRefresh();
    const yml = useAdminContext();
    const theme = useTheme();
    const mdUp = useMediaQuery(theme.breakpoints.up('md'));
    return (
        <Box padding={2} sx={{width:1200}}>
            <Grid container spacing={2} sx={{backgroundColor:'#f0f0f0'}}>
                {components?.map((component, index) => {
                    return <Grid item key={index} size={component.size || 4} >
                        <Card>
                            <CardHeader title={component.label} />
                            <CardContent>
                                <Component component={component} />
                            </CardContent>
                        </Card>
                    </Grid>
                })}
            </Grid>
        </Box>
    )
};


export default ComponentLayout;