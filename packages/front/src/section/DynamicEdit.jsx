
import { useEffect, useMemo, useCallback } from 'react';
import {
    AutocompleteInput,
    Edit,
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


export const DynamicEdit = ({custom, ...props}) => {
    const { permissions } = usePermissions();
    const yml = useAdminContext();
    const resource = useResourceContext(props); 
    
    const fields = useMemo(() => {
        return yml.entity[resource].fields
    }, [yml, resource])

    const api_generate = useMemo(() => {
        return yml.entity[resource].api_generate || {}
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

    const checkApiGenerateContain = useCallback((name) => {
        if(!api_generate)
            return true;
        if(api_generate[name])
            return false;
        if(name.includes('.') && api_generate[name.split('.')[0]]) {
            return false;
        }
        return true;
    }, [api_generate])
    
    //Custom Create Code Start
    
    //Custom Create Code End
    
    return (
        <Edit title={<DynamicTitle />} {...props} mutationMode='optimistic' redirect="edit"
        //Custom Create Property Start
       
        //Custom Create Property End
        >
            <SimpleForm toolbar={<EditToolbar />}
            //Custom Create SimpleForm Property Start

            //Custom Create SimpleForm Property End
            >
                {fields.filter(field => crud.edit == true || crud.edit.map(a=>a.name).includes(field.name))
                    //exclude field by api_generate
                    .filter(field => checkApiGenerateContain(field.name))
                    .map(field => {
                    return getFieldEdit({
                        field, 
                        search:false, 
                        globalFilter: custom?.globalFilterDelegate ? custom.globalFilterDelegate(resource) : {},
                        crud_field:crud.edit == true ? null : crud.edit.find(a=>a.name == field.name)
                    })
                })}

                {/* Custom Create Start */}

                {/* Custom Create End */}
            </SimpleForm>
        </Edit>
    )
}


export default DynamicEdit;







//Custom Outside Start

//Custom Outside End
