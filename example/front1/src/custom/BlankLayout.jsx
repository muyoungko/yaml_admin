import React from 'react';
import { ActionPopup } from 'yaml-admin-front';

const BlankLayout = ({ children }) => (
    <>
    {children}
    <ActionPopup />
    </>
);

export default BlankLayout;

