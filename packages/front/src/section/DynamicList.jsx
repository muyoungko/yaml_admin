
import React from 'react';
import {
    AutocompleteInput,
    ChipField,
    Datagrid,
    DateField,
    EditButton,
    Filter,
    FunctionField,
    List,
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
    useRefresh
} from 'react-admin';

import { useNavigate } from 'react-router-dom';
//Custom Import Start

//Custom Import End

const DynamicTitle = () => {
    const record = useRecordContext();
    if (!record) return null;
    return <span>ILS 관리</span>;
};

const EditToolbar = props => (
    <Toolbar {...props} >
        <SaveButton />
    </Toolbar>
);

const DynamicFilter = props => (
    <Filter {...props}>
        <TextInput resettable label="id" source="id" alwaysOn/>
        
            <TextInput resettable label="키" source="key" alwaysOn/>
                

            <ReferenceInput source="server_id" reference="server" alwaysOn>
                <AutocompleteInput label="공장" optionText="name" />
            </ReferenceInput>
                

            <ReferenceInput source="place_id" reference="place" alwaysOn>
                <AutocompleteInput label="장소" optionText="key" />
            </ReferenceInput>
                

            <TextInput resettable label="ILS 별칭" source="name" alwaysOn/>
                
<SelectInput resettable label="버전" source="version" choices={[{"id":"1","name":"1"},{"id":"2","name":"2"}]} alwaysOn/>

        {
        //Custom Filter Start
        
//Custom Filter End
        }
    </Filter>
);

export const DynamicList = props => {
    const navigate = useNavigate()
    const refresh = useRefresh();

    //Custom List Code Start

    //Custom List Code End
    return (
        <List title="ILS 관리" {...props} filters={<DynamicFilter/>} mutationMode='optimistic'
            exporter={false}
            sort={{ field: 'id', order: 'DESC' }}
            perPage={30}
            //Custom List Action Start
        
//Custom List Action End
        >
            {
                //Custom List Body Start
            
//Custom List Body End
            }
            <Datagrid rowClick="show" bulkActionButtons={true}>
                <TextField label="ID" source="id" />
                <TextField label="키" source="key" false/>
<ReferenceField link="show" label="공장" source="server_id" reference="server">
            <TextField source="name" />
        </ReferenceField>
<ReferenceField link="show" label="장소" source="place_id" reference="place">
            <TextField source="key" />
        </ReferenceField>
<NumberField label="배터리" source="battery" />
<DateField label="최근 동기화" source="sync_date" showTime={true}/>
<TextField label="ILS 별칭" source="name" false/>
<FunctionField label="버전" render={record => {
                    let list = [{"id":"1","name":"1"},{"id":"2","name":"2"}]
                    if(record.version) {
                        let ff = list.filter(f=>f.id==record.version)
                        return ff.length > 0 ? ff[0].name : record.version
                    } else {
                        return ''
                    }
                }} />
<TextField label="Serial" source="serial" false/>
                //Custom List Start
                <ReferenceArrayField link="show" label="잠금자" source="lock_member_list" reference="user">
                    <SingleFieldList>
                        <ChipField source="name" />
                    </SingleFieldList>
                </ReferenceArrayField>

//Custom List End
                <EditButton label='수정'/>
            </Datagrid>
        </List>
    )
};


export default DynamicList;