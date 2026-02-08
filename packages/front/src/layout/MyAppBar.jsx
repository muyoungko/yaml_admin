import React from 'react';
import { AppBar, Logout, UserMenu } from 'react-admin';
import { Typography, Box } from '@mui/material';
import { useAdminContext } from '../AdminContext';

const MyUserMenu = props => {
    return (
        <UserMenu {...props}>
            <Logout />
        </UserMenu>
    )
}

const MyAppBar = props => {
    const { custom } = useAdminContext();
    const appName = custom?.layout?.appName || 'Admin';

    return (
        <AppBar {...props} userMenu={<MyUserMenu />}>
            <Box flex={1} display="flex" alignItems="center">
                <Typography variant="h6" color="inherit" sx={{ fontWeight: 600 }}>
                    {appName}
                </Typography>
            </Box>
        </AppBar>
    );
};

export default MyAppBar;