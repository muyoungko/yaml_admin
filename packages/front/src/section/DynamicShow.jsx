
import React, { useMemo } from 'react';
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
//Custom Import Start

//Custom Import End

const DynamicTitle = () => {
    const record = useRecordContext();
    if (!record) return null;
    return <span></span>;
};

export const DynamicShow = props => {
    const navigate = useNavigate()
    const refresh = useRefresh();
    const yml = useAdminContext();
    const resource = useResourceContext(props); // 예: "ils", "server" 등

    const fields = useMemo(() => {
        return yml.entity[resource].fields
    }, [yml, resource])

    //Custom List Code Start

    //Custom List Code End
    return (
        <Show title={<DynamicTitle />} {...props} >
            <SimpleShowLayout>
                
                {fields.map(m=>{
                    if(m.type == 'string' || m.key)
                        return <TextField key={m.name} label={m.label} source={m.name} />
                    else if(m.type == 'integer')
                        return <NumberField key={m.name} label={m.label} source={m.name} />
                    else if(m.type == 'date')
                        return <DateField key={m.name} label={m.label} source={m.name} />
                    else if(m.type == 'boolean')
                        return <BooleanField key={m.name} label={m.label} source={m.name} />
                    else if(m.type == 'objectId')
                        return <TextField key={m.name} label={m.label} source={m.name} />
                })}
                
            //Custom Show Start

            //Custom Show End

            </SimpleShowLayout>
        </Show>
    )
};


export default DynamicShow;