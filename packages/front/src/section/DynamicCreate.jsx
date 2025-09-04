
import React from 'react';
import {
    AutocompleteInput,
    Create,
    NumberInput,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextInput,
    usePermissions,
    useRecordContext
} from 'react-admin';

//Custom Import Start

//Custom Import End

const IlsTitle = () => {
    const record = useRecordContext();
    if (!record) return null;
    return <span>ILS 관리</span>;
};

const required = (message = 'Required') =>
    value => value ? undefined : message;
const maxLength = (max, message = (max + '자 이하로 입력해주세요')) =>
    value => value && value.length > max ? message : undefined;
const validateName = [required(), maxLength(15)];
const validateRequire = [required()];


export const DynamicCreate = props => {
    const { permissions } = usePermissions();
    //Custom Create Code Start

    //Custom Create Code End
    return (
        <Create title={<IlsTitle />} {...props} mutationMode='optimistic' redirect="list"
        //Custom Create Property Start

        //Custom Create Property End
        >
            <SimpleForm toolbar={<EditToolbar />}
            //Custom Create SimpleForm Property Start

            //Custom Create SimpleForm Property End
            >
                <TextInput resettable label="키" source="key" validate={validateRequire} />
                <ReferenceInput source="server_id" reference="server" alwaysOn>
                    <AutocompleteInput sx={{ width: '300px' }} label="공장" optionText="name" />
                </ReferenceInput>
                <ReferenceInput source="place_id" reference="place" alwaysOn>
                    <AutocompleteInput sx={{ width: '300px' }} label="장소" optionText="key" />
                </ReferenceInput>
                <NumberInput label="배터리" source="battery" />
                <TextInput resettable label="ILS 별칭" source="name" validate={validateRequire} />
                <SelectInput resettable label="버전" source="version" defaultValue="undefined" choices={[{ "id": "1", "name": "1" }, { "id": "2", "name": "2" }]} validate={validateRequire} />
                <TextInput resettable label="Serial" source="serial" validate={validateRequire} />
                {/* Custom Create Start */}

                {/* Custom Create End */}
            </SimpleForm>
        </Create>
    )
}


export default DynamicCreate;







//Custom Outside Start

//Custom Outside End
