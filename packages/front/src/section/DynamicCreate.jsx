
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
import { getFieldEdit } from '../common/field';
import { useAdminContext } from '../AdminContext';
import { useLocation } from 'react-router-dom';
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
    const location = useLocation()

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

    const getDefaultValue = useCallback((crud_field) => {
        if (crud_field?.default) {
            if(Number.isInteger(crud_field?.default))
                return crud_field?.default
            
            if (crud_field?.default.startsWith('$')) {
                const params = new URLSearchParams(location.search);
                let q = crud_field?.default
                let name = crud_field.name

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
            }
        }

        return null
    }, [location, yml, fields])

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
                        let defaultValue = getDefaultValue(crud_field)
                        return getFieldEdit({
                            field,
                            search: false,
                            globalFilter: custom?.globalFilterDelegate ? custom.globalFilterDelegate(resource) : {},
                            defaultValue,
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
