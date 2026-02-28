import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress,
    Table, TableBody, TableCell, TableHead, TableRow, Checkbox
} from '@mui/material';
import { useAdminContext, fetcher } from 'yaml-admin-front';
export const MyPopupContent = () => {
    const { popup, setPopup, custom } = useAdminContext();
    const handleClose = () => {
        setPopup(null);
    };
    return (
        <>
            <DialogTitle>Popup Title</DialogTitle>
            <DialogContent>
                Content
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </>
    );
};
