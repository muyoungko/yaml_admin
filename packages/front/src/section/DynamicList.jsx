
import React, { useMemo } from 'react';
import {
    AutocompleteInput,
    ChipField,
    Datagrid,
    DateField,
    EditButton,
    Filter,
    FunctionField,
    List,
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

const EditToolbar = props => (
    <Toolbar {...props} >
        <SaveButton />
    </Toolbar>
);

const DynamicFilter = props => (
    <Filter {...props}>

        {
            //Custom Filter Start

            //Custom Filter End
        }
    </Filter>
);

export const DynamicList = props => {
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
        <List {...props} filters={<DynamicFilter />} mutationMode='optimistic'
            exporter={false}
            sort={{ field: 'id', order: 'DESC' }}
            perPage={30}
        //Custom List Action Start

        //Custom List Action End
        >
            {
                //Custom List Body Start

                //Custom List Body End
            }
            <Datagrid rowClick="show" bulkActionButtons={true}>
                {
                    fields.map(field => {
                        if(field.type == 'integer')
                            return <NumberField key={field.name} label={field.label} source={field.name} />
                        else if(field.type == 'string')
                            return <TextField key={field.name} label={field.label} source={field.name} />
                        else if(field.type == 'date')
                            return <DateField key={field.name} label={field.label} source={field.name} />
                        else if(field.type == 'boolean')
                            return <BooleanField key={field.name} label={field.label} source={field.name} />
                        else if(field.type == 'objectId')
                            return <TextField key={field.name} label={field.label} source={field.name} />
                    })
                }
                //Custom List Start

                //Custom List End
                <EditButton />
            </Datagrid>
        </List>
    )
};


export default DynamicList;