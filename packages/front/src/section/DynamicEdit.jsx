
import { useEffect, useMemo } from 'react';
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


export const DynamicEdit = props => {
    const { permissions } = usePermissions();
    const yml = useAdminContext();
    const resource = useResourceContext(props); // 예: "ils", "server" 등
    
    const fields = useMemo(() => {
        return yml.entity[resource].fields
    }, [yml, resource])

    //Custom Create Code Start
    useEffect(() => {
        console.log('props', props, yml.entity[resource])
    }, [props, yml, resource])
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
                {fields.map(field => {
                    const {type, autogenerate} = field
                    if (autogenerate) return null
                    return (
                        <TextInput
                            key={field.name}
                            resettable
                            label={field.label}
                            source={field.name}
                            validate={validateRequire}
                        />
                    )
                })}
                {/* <TextInput resettable label="키" source="key" validate={validateRequire} />
                <ReferenceInput source="server_id" reference="server" alwaysOn>
                    <AutocompleteInput sx={{ width: '300px' }} label="공장" optionText="name" />
                </ReferenceInput>
                <ReferenceInput source="place_id" reference="place" alwaysOn>
                    <AutocompleteInput sx={{ width: '300px' }} label="장소" optionText="key" />
                </ReferenceInput>
                <NumberInput label="배터리" source="battery" />
                <TextInput resettable label="ILS 별칭" source="name" validate={validateRequire} />
                <SelectInput resettable label="버전" source="version" defaultValue="undefined" choices={[{ "id": "1", "name": "1" }, { "id": "2", "name": "2" }]} validate={validateRequire} />
                <TextInput resettable label="Serial" source="serial" validate={validateRequire} /> */}

                {/* Custom Create Start */}

                {/* Custom Create End */}
            </SimpleForm>
        </Edit>
    )
}


export default DynamicEdit;







//Custom Outside Start

//Custom Outside End
