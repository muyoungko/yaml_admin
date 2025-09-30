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

import { useNavigate } from 'react-router-dom';
import { useAdminContext } from '../AdminContext';
import ComponentLayout from "./ComponentLayout";
//Custom Import Start

//Custom Import End

export const DashboardLayout = ({ custom, ...props }) => {
    const navigate = useNavigate()
    const refresh = useRefresh();
    const yml = useAdminContext();
    
    // Custom List Code Start

    //Custom List Code End
    return (
        <ComponentLayout components={yml?.front?.dashboard} />
    )
};


export default DashboardLayout;