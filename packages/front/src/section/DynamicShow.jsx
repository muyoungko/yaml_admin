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

export const DynamicShow = ({ custom, ...props }) => {
    const refresh = useRefresh();
    const yml = useAdminContext();
    const resource = useResourceContext(props);

    const fields = useMemo(() => {
        return yml.entity[resource].fields
    }, [yml, resource])

    const customFunc = useMemo(() => {
        return custom?.entity?.[resource]?.show
    }, [yml, resource])

    const crud = useMemo(() => {
        return yml.entity[resource].crud || {
            show: true,
            edit: true,
            create: true,
            delete: true,
            list: true,
            import: false,
            export: false,
        }
    }, [yml, resource])

    const findField = useCallback((name) => {
        let name_array = name.split('.')[0]
        let r = fields.find(f => f.name == name_array)
        if (!r)
            r = fields.find(f => f.name == name)
        return r;
    }, [fields])

    const shouldShowFields = useCallback(( crud_field ) => {

        if (
            fields.map(a => a.name).includes(crud_field.name)
            || crud_field.type == 'button'
        )
            return true

        if (crud_field.name.includes('.')) {
            let name_array = crud_field.name.split('.')
            let current_fields = fields
            for(let i=0; i<name_array.length; i++) {
                let field = current_fields.find(f => f.name == name_array[i])
                if(!field) return false
                if(i == name_array.length - 1) return true
                if(field.fields) current_fields = field.fields
                else return false
            }
        }

        return false

    }, [fields])
    // Custom List Code Start

    //Custom List Code End
    return (
        <Show title={<DynamicTitle />} {...props} >
            <SimpleShowLayout>
                {customFunc && <ShowContent customFunc={customFunc} fields={fields} />}
                {!customFunc && crud.show == true && fields.map(m => {
                    return getFieldShow({
                        field: m,
                    })
                })}

                {!customFunc && crud.show != true && crud.show.filter(f => f.name).filter(f => shouldShowFields(f)).map(crud_field => {
                    let m = findField(crud_field.name)
                    return getFieldShow({
                        crud_field,
                        field: m,
                    })
                })}
            //Custom Show Start

            //Custom Show End

            </SimpleShowLayout>
        </Show>
    )
};


export default DynamicShow;