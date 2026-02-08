import React from 'react';
import { Layout } from 'react-admin';
import MyAppBar from './MyAppBar'
import MyMenu from './MyMenu'
import { useAdminContext } from '../AdminContext';

const MyLayout = ({ children }) => {
    const { custom } = useAdminContext();
    const AppBarComponent = custom?.layout?.AppBar || MyAppBar;
    const MenuComponent = custom?.layout?.Menu || MyMenu;

    return (
        <Layout appBar={AppBarComponent} menu={MenuComponent} >
            {children}
        </Layout>
    );
};

export default MyLayout;

