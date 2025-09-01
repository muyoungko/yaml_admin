import React from 'react';
import { Layout, AppBar } from 'react-admin';
//import MyAppBar from './MyAppBar'
import MyMenu from './MyMenu'

const MyLayout = (props) => <Layout {...props} appBar={AppBar} menu={MyMenu} />;

export default MyLayout;