import React from 'react';
import { Layout } from 'react-admin';
import MyAppBar from './MyAppBar'
import MyMenu from './MyMenu'

const MyLayout = ({ children }) => (
    // <>{children}</>
    <Layout appBar={MyAppBar} menu={MyMenu} >
        {children}
    </Layout>
);

export default MyLayout;

