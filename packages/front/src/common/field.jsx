import React from 'react';
import { TextField, NumberField, ReferenceField, DateField, BooleanField,
    ReferenceInput, AutocompleteInput, TextInput,
    SelectInput,
 } from 'react-admin';

export const getFieldShow = (field) => {
    if (!field || field.type == 'password') return null;
    if (field.type == 'string' || field.key)
        return <TextField key={field.name} label={field.label} source={field.name} />
    else if (field.type == 'integer')
        return <NumberField key={field.name} label={field.label} source={field.name} />
    else if (field.type == 'reference')
        return <ReferenceField key={field.name} link="show" label={field.label} source={field.name} reference={field.reference_entity}>
            <TextField source={field.reference_name} />
        </ReferenceField>
    else if (field.type == 'date')
        return <DateField key={field.name} label={field.label} source={field.name} />
    else if (field.type == 'boolean')
        return <BooleanField key={field.name} label={field.label} source={field.name} />
    else if (field.type == 'objectId')
        return <TextField key={field.name} label={field.label} source={field.name} />
    return 
        <TextField key={field.name} label={field.label} source={field.name} />
}

export const getFieldEdit = (field) => {
    if(!field) 
        return null;
    const {type, autogenerate} = field
    if(autogenerate) return null
    if(type == 'reference')
        return <ReferenceInput key={field.name} label={field?.label} source={field.name} reference={field?.reference_entity} alwaysOn>
            <AutocompleteInput sx={{ width: '300px' }} label={field?.label} optionText={field?.reference_name} 
                filterToQuery={(searchText) => ({ [field?.reference_name || 'q']: searchText })} />
        </ReferenceInput>
    else if(field?.type == 'select')
        return <SelectInput key={field.name} label={field?.label} source={field.name} alwaysOn 
            choices={field?.select_values} 
            optionText="name" optionValue="label"
        />
    else
        return <TextInput key={field.name} label={field?.label} source={field.name} alwaysOn/>
}