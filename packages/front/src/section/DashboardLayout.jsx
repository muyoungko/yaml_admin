import React, { useMemo, useCallback } from 'react';
import {
    AutocompleteInput,
    ChipField,
    Datagrid,
    DateField,
    EditButton,
    Filter,
    FunctionField,
    Show,
    SimpleShowLayout,
    NumberField,
    ReferenceArrayField,
    ReferenceField,
    ReferenceInput,
    SaveButton,
    SelectInput,
    SingleFieldList,
    TextField,
    TextInput,
    Toolbar,
    useRecordContext,
    useRefresh,
    useResourceContext,
    BooleanField,
} from 'react-admin';

import { useAdminContext } from '../AdminContext';
import YAMLComponentLayout from "./YAMLComponentLayout";
import { Box, Grid } from '@mui/material';
//Custom Import Start

//Custom Import End

export const DashboardLayout = ({ custom, ...props }) => {
    const refresh = useRefresh();
    const yml = useAdminContext();
    const dashboard = yml?.front?.dashboard;

    // Custom List Code Start

    //Custom List Code End

    if (!dashboard) return null;

    // sections mode: dashboard is an object with a sections key
    if (!Array.isArray(dashboard) && dashboard.sections) {
        return (
            <Box sx={{ minHeight: '100vh', padding: { xs: 2, md: 4 } }}>
                <Grid container spacing={3} alignItems="flex-start">
                    {dashboard.sections.map((section, index) => (
                        <Grid item key={index} size={{ xs: 12, md: section.size || 12 }}>
                            <YAMLComponentLayout components={section.components} compact />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    // default mode: dashboard is a flat array of components
    return <YAMLComponentLayout components={dashboard} />;
};


export default DashboardLayout;
