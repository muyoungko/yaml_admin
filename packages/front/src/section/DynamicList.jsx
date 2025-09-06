
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

const DynamicFilter = props => {
    const yml = useAdminContext();
    const resource = useResourceContext(props);
    const yml_entity = useMemo(() => {
        return yml.entity[resource]
    }, [yml, resource])

    return (
        <Filter {...props}>
            {
                yml_entity.crud?.list?.search?.map(m => {
                    return <TextInput key={m.name} label={m.label} source={m.name} alwaysOn/>
                })
            }
            {
                //Custom Filter Start

                //Custom Filter End
            }
        </Filter>
    )
};

export const DynamicList = props => {
    const navigate = useNavigate()
    const refresh = useRefresh();
    const yml = useAdminContext();
    const resource = useResourceContext(props);

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
                    fields.map(m => {
                        if (m.type == 'string' || m.key)
                            return <TextField key={m.name} label={m.label} source={m.name} />
                        else if (m.type == 'integer')
                            return <NumberField key={m.name} label={m.label} source={m.name} />
                        else if (m.type == 'reference')
                            return <ReferenceField link="show" label={m.label} source={m.name} reference={m.reference_entity}>
                                <TextField source={m.reference_name} />
                            </ReferenceField>
                        else if (m.type == 'date')
                            return <DateField key={m.name} label={m.label} source={m.name} />
                        else if (m.type == 'boolean')
                            return <BooleanField key={m.name} label={m.label} source={m.name} />
                        else if (m.type == 'objectId')
                            return <TextField key={m.name} label={m.label} source={m.name} />
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