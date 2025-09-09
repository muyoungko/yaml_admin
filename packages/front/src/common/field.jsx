import React from 'react';
import {
    TextField, NumberField, ReferenceField, DateField, BooleanField,
    ReferenceInput, AutocompleteInput, TextInput,
    SelectInput, FunctionField, ImageInput, ImageField,
} from 'react-admin';
import { Avatar } from '@mui/material';
import ClickableImageField from '../component/ClickableImageField';
import SafeImageField from '../component/SafeImageField';

export const getFieldShow = (field, isList = false) => {
    if (!field || field.type == 'password') return null;
    if (field.type == 'string' || field.key){
        return <TextField key={field.name} label={field.label} source={field.name} />
    } else if (field.type == 'integer')
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
    else if (field.type == 'image') {
        if(field.avatar)
            return <FunctionField label={field.label} render={record =>
                <Avatar alt="Natacha" src={record[field.name].image_preview} 
                        sx={isList ? {width: 100, height: 100} : {width: 256, height: 256}}/>
            } />
        else 
            return <ClickableImageField key={field.name} label={field.label} source={field.name} 
                width={isList ? "100px" : "200px"} height={isList ? "100px" : "200px"}/>
    } 
    else
        return <TextField key={field.name} label={field.label} source={field.name} />
}

const required = (message = 'ra.validation.required') =>
    value => value ? undefined : message;
const validateRequire = [required()];

export const getFieldEdit = (field, search = false) => {
    if (!field)
        return null;
    const { type, autogenerate } = field
    if (autogenerate && !search) return null
    if (type == 'reference')
        return <ReferenceInput key={field.name} label={field?.label} source={field.name} reference={field?.reference_entity} alwaysOn>
            <AutocompleteInput sx={{ width: '300px' }} label={field?.label} optionText={field?.reference_name}
                filterToQuery={(searchText) => ({ [field?.reference_name || 'q']: searchText })} 
                validate={field.required && !search && validateRequire}
                />
        </ReferenceInput>
    else if (field?.type == 'select')
        return <SelectInput key={field.name} label={field?.label} source={field.name} alwaysOn
            choices={field?.select_values}
            optionText="name" optionValue="label"
            validate={field.required && !search && validateRequire}
        />
    else if (field?.type == 'image') {
        return <ImageInput key={field.name} source={field.name} label={field.label} accept="image/*" placeholder={<p>{field.label}</p>} 
            validate={field.required && !search && validateRequire}>
            <SafeImageField source={'src'} title={'title'} />
        </ImageInput>
    }
    else {
        return <TextInput key={field.name} label={field?.label} source={field.name} alwaysOn 
            validate={field.required && !search && validateRequire}
        />
    }
}