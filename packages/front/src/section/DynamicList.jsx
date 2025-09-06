
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
    BooleanField,
} from 'react-admin';

import { useNavigate } from 'react-router-dom';
import { useAdminContext } from '../AdminContext';
import { getFieldShow, getFieldEdit } from '../common/field';
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
                    const field = yml_entity.fields.find(f => f.name == m.name)
                    return getFieldEdit(field)
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
                        return getFieldShow(m)
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