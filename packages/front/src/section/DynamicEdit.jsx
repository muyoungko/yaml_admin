
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
    
    const getDefaultValue = useCallback((crud_field) => {
        let name = crud_field?.name
        let defaultValue = crud_field?.default
        if (defaultValue) {
            if(Number.isInteger(defaultValue))
                return defaultValue
            
            if (defaultValue.startsWith('$')) {
                const params = new URLSearchParams(location.search);
                let q = defaultValue

                //check default is integer by watching fields
                let field = fields.find(f => f.name == name)
                let type = 'string'
                if (field.type == 'integer')
                    type = 'integer'
                else if (field.type == 'reference') {
                    let { reference_match, reference_entity } = field
                    let reference_entity_yml = yml.entity[reference_entity]
                    let reference_match_field = reference_entity_yml.fields.find(f => f.name == reference_match)
                    let reference_type = reference_match_field.type
                    if (reference_type == 'integer')
                        type = 'integer'
                    else
                        type = 'string'
                }

                if (q.startsWith('$')) {
                    q = q.replace('$', '')
                    let value = params.get(q)
                    if (type == 'integer' && value)
                        value = parseInt(value)
                    return value
                }
            } else 
                return defaultValue
        }

        return null
    }, [location, yml, fields])

    //Custom Create Code Start
    
    //Custom Create Code End
    
    return (
        <Edit title={<DynamicTitle />} {...props} mutationMode='optimistic' redirect="list"
        //Custom Create Property Start
       
        //Custom Create Property End
        >
            <SimpleForm toolbar={<EditToolbar />}
            //Custom Create SimpleForm Property Start

            //Custom Create SimpleForm Property End
            >
                {fields.filter(field => crud.edit == true || crud.edit.map(a=>a.name).includes(field.name))
                    .filter(field => field.key != true)
                    //exclude field by api_generate
                    .filter(field => checkApiGenerateContain(field.name))
                    .map(field => {
                        let crud_field = crud.create == true ? null : crud.create.find(a => a.name == field.name)
                        let defaultValue = getDefaultValue(crud_field)
                        return getFieldEdit({
                            field, 
                            search:false, 
                            globalFilter: custom?.globalFilterDelegate ? custom.globalFilterDelegate(resource) : {},
                            defaultValue,
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
