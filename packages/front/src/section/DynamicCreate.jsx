
import { useEffect, useMemo } from 'react';
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

export const DynamicCreate = ({custom, ...props}) => {
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

    return (
        <Create title={<DynamicTitle />} {...props} mutationMode='optimistic' redirect="list"
        //Custom Create Property Start

        //Custom Create Property End
        >
            <SimpleForm toolbar={<EditToolbar />}
            //Custom Create SimpleForm Property Start

            //Custom Create SimpleForm Property End
            >
                {fields.filter(field => crud.create == true || crud.create.map(a=>a.name).includes(field.name) )
                    //exclude field by api_generate
                    .filter(field => !api_generate[field.name])
                    .map(field => {
                    return getFieldEdit(field, false, custom?.globalFilterDelegate(resource))
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
