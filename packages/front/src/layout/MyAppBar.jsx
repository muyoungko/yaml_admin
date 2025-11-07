import React, { useState } from 'react';
import { AppBar, Logout, UserMenu } from 'react-admin';

const MyUserMenu = props => {
    return (
        <UserMenu {...props}>
            <Logout />
        </UserMenu>
    )
}

const MyAppBar = props => <AppBar {...props} userMenu={<MyUserMenu />} >

</AppBar>;


export default MyAppBar;