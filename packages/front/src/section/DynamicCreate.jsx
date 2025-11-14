
import { useEffect, useMemo, useCallback } from 'react';
import {
    AutocompleteInput,
    Create,
    NumberInput,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextInput,
    usePermissions,
    useRecordContext,
    Toolbar,
    SaveButton,
    useResourceContext,
} from 'react-admin';
import { getQueryStringValue } from '../common/format';
import { getFieldEdit } from '../common/field';
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

export const DynamicCreate = ({ custom, ...props }) => {
    const { permissions } = usePermissions();
    const yml = useAdminContext();
    const resource = useResourceContext(props);

    const fields = useMemo(() => {
        return yml.entity[resource].fields
    }, [yml, resource])

    const api_generate = useMemo(() => {
        return yml.entity[resource].api_generate || {}
    }, [yml, resource])

    const checkApiGenerateContain = useCallback((name) => {
        if (!api_generate)
            return true;
        if (api_generate[name])
            return false;
        if (name.includes('.') && api_generate[name.split('.')[0]]) {
            return false;
        }
        return true;
    }, [api_generate])

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

    return (
        <Create title={<DynamicTitle />} {...props} mutationMode='optimistic' redirect="list"
        //Custom Create Property Start

        //Custom Create Property End
        >
            <SimpleForm toolbar={<EditToolbar />}
            //Custom Create SimpleForm Property Start

            //Custom Create SimpleForm Property End
            >
                {fields.filter(field => crud.create == true || crud.create.map(a => a.name).includes(field.name))
                    //exclude field by api_generate
                    .filter(field => checkApiGenerateContain(field.name))
                    .map(field => {
                        let crud_field = crud.create == true ? null : crud.create.find(a => a.name == field.name) 
                        if(crud_field?.default) {
                            let q = crud_field?.default
                            if(q.startsWith('$')) {
                                q = q.replace('$', '')
                                let value = getQueryStringValue(q)
                                if(value) {
                                    crud_field.default = value
                                }
                            }
                        }
                        return getFieldEdit({
                            field,
                            search: false,
                            globalFilter: custom?.globalFilterDelegate(resource),
                            crud_field,
                        })
                    })}

                {/* Custom Create Start */}

                {/* Custom Create End */}
            </SimpleForm>
        </Create>
    )
}


export default DynamicCreate;







//Custom Outside Start

//Custom Outside End
