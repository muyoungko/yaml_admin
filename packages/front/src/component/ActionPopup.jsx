import React, { useState, useEffect, useCallback } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress,
    Table, TableBody, TableCell, TableHead, TableRow, Checkbox
} from '@mui/material';
import { useAdminContext } from '../AdminContext';
import { useNotify } from 'react-admin';
import { fetcher } from '../common/axios';
import { format } from '../common/format';

export const ActionPopup = () => {
    const { popup, setPopup, custom } = useAdminContext();
    const [loading, setLoading] = useState(false);
    const notify = useNotify();

    if (!popup) return null;

    const { action, record } = popup;
    const CustomComponent = action.custom && custom?.action?.[action.custom];

    const handleClose = () => {
        setPopup(null);
    };

    return (
        <Dialog open={true} onClose={handleClose} fullWidth maxWidth="md">
            {CustomComponent && <CustomComponent popup={popup} record={record} />}
        </Dialog>
    );
};
