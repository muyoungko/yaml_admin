
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
import { getFieldShow } from '../common/field';
//Custom Import Start

//Custom Import End

const DynamicTitle = () => {
    const record = useRecordContext();
    if (!record) return null;
    return <span></span>;
};

const ShowContent = ({ customFunc }) => {
    const record = useRecordContext();
    if (!record) return null;
    return (
        <>
            {customFunc(record)}
        </>
    )
};

export const DynamicShow = ({custom, ...props}) => {
    const navigate = useNavigate()
    const refresh = useRefresh();
    const yml = useAdminContext();
    const resource = useResourceContext(props); 
    
    const fields = useMemo(() => {
        return yml.entity[resource].fields
    }, [yml, resource])

    const yml_entity = useMemo(() => {
        return yml.entity[resource]
    }, [yml, resource])

    const customFunc = useMemo(()=> {
        return custom?.entity?.[resource]?.show
    }, [yml, resource])
    // Custom List Code Start

    //Custom List Code End
    return (
        <Show title={<DynamicTitle />} {...props} >
            <SimpleShowLayout>
                {customFunc && <ShowContent customFunc={customFunc} fields={fields} />}
                {!customFunc && fields.map(m=>{
                    return getFieldShow(m)
                })}
            //Custom Show Start

            //Custom Show End

            </SimpleShowLayout>
        </Show>
    )
};


export default DynamicShow;