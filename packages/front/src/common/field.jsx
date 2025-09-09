import React from 'react';
import {
    TextField, NumberField, ReferenceField, DateField, BooleanField,
    ReferenceInput, AutocompleteInput, TextInput,
    SelectInput, FunctionField, ImageInput, ImageField,
} from 'react-admin';

export const getFieldShow = (field) => {
    if (!field || field.type == 'password') return null;
    if (field.type == 'string' || field.key)
        return <TextField key={field.name} label={field.label} source={field.name} />
    else if (field.type == 'integer')
        return <NumberField key={field.name} label={field.label} source={field.name} />
    else if (field.type == 'select')
        return <FunctionField key={field.name} label={field.label} source={field.name}
            render={record => field.select_values.find(m => field.name == record[field.name])?.label} />
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
    else if (field.type == 'image')
        return <TextField key={field.name} label={field.label} source={field.name} />
    else
        return <TextField key={field.name} label={field.label} source={field.name} />
}

const required = (message = 'Required') =>
    value => value ? undefined : message;
const validateRequire = [required()];

export const getFieldEdit = (field) => {
    if (!field)
        return null;
    const { type, autogenerate } = field
    if (autogenerate) return null
    if (type == 'reference')
        return <ReferenceInput key={field.name} label={field?.label} source={field.name} reference={field?.reference_entity} alwaysOn>
            <AutocompleteInput sx={{ width: '300px' }} label={field?.label} optionText={field?.reference_name}
                filterToQuery={(searchText) => ({ [field?.reference_name || 'q']: searchText })} 
                validate={field.required && validateRequire}
                />
        </ReferenceInput>
    else if (field?.type == 'select')
        return <SelectInput key={field.name} label={field?.label} source={field.name} alwaysOn
            choices={field?.select_values}
            optionText="name" optionValue="label"
            validate={field.required && validateRequire}
        />
    else if (field?.type == 'image')
        return <ImageInput key={field.name} source={field.name} label={field.label} accept="image/*" placeholder={<p>{field.label}</p>} 
            validate={field.required && validateRequire}>
            <ImageField source="src" title="title" sx={{ '& img': { maxHeight: '20rem' } }} />
        </ImageInput>
    else
        return <TextInput key={field.name} label={field?.label} source={field.name} alwaysOn 
            validate={field.required && validateRequire}
        />
}