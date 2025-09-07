
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

const required = (message = 'Required') =>
    value => value ? undefined : message;
const maxLength = (max, message = (max + '자 이하로 입력해주세요')) =>
    value => value && value.length > max ? message : undefined;
const validateName = [required(), maxLength(15)];
const validateRequire = [required()];


export const DynamicCreate = props => {
    const { permissions } = usePermissions();
    const yml = useAdminContext();
    const resource = useResourceContext(props); 
    
    const fields = useMemo(() => {
        return yml.entity[resource].fields
    }, [yml, resource])

    //Custom Create Code Start
    
    //Custom Create Code End

    return (
        <Create title={<DynamicTitle />} {...props} mutationMode='optimistic' redirect="list"
        //Custom Create Property Start

        //Custom Create Property End
        >
            <SimpleForm toolbar={<EditToolbar />}
            //Custom Create SimpleForm Property Start

            //Custom Create SimpleForm Property End
            >
                {fields.map(field => {
                    return getFieldEdit(field)
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
