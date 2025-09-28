import {
    TextField, NumberField, ReferenceField, DateField, BooleanField,
    ReferenceInput, AutocompleteInput, TextInput,
    SelectInput, FunctionField, ImageInput, ImageField, FileInput, FileField,
    ArrayInput, ArrayField, SingleFieldList, Datagrid, SimpleFormIterator, BooleanInput,
    DateInput, NumberInput,
} from 'react-admin';
import { Avatar } from '@mui/material';
import ClickableImageField from '../component/ClickableImageField';
import SafeImageField from '../component/SafeImageField';

/**
 * 
 * @param {*} field example {{
    "name": "lock_list",
    "label": "mylabel",
    "type": "array",
    "fields": [
        {
            "name": "member_no",
            "type": "reference",
            "reference_entity": "member",
            "reference_match": "member_no",
            "reference_name": "name"
        },
        {
            "name": "reg_date",
            "type": "date"
        }
    ]
}}
 * @param {*} field_path example "lock_list.member_no"
 * @returns example {{
    "name": "member_no",
    "type": "reference",
    "reference_entity": "member",
    "reference_match": "member_no",
    "reference_name": "name"
    }}
 */
const findChildField = (field, field_path) => {
    let field_path_array = field_path.split('.')
    if (field_path_array.length == 1)
        return field
    else {
        let child_field_name = field_path_array[1]
        let field_path_rest = field_path_array.slice(1).join('.')
        return findChildField(field.fields.find(f => f.name == child_field_name), field_path_rest)
    }
}

export const getFieldShow = ({ field, isList, crud_field }) => {
    let label = crud_field?.label || field.label
    if (!field || field.type == 'password') return null;
    if (field.type == 'string' || field.key) {
        return <TextField key={field.name} label={label} source={field.name} />
    } else if (field.type == 'integer')
        return <NumberField key={field.name} label={label} source={field.name} />
    else if (field.type == 'length')
        return <FunctionField key={field.name} label={label} render={record =>
            <>
                {record[field.name]?.length}
            </>
        } />
    else if (field.type == 'select')
        return <FunctionField key={field.name} label={label} source={field.name}
            render={record => field.select_values.find(m => m.name == record[field.name])?.label} />
    else if (field.type == 'reference')
        return <ReferenceField key={field.name} link="show" label={label} source={field.name} reference={field.reference_entity}>
            {!field.reference_format && <TextField source={field.reference_name} />}
            {field.reference_format && (() => {
                    // Extract field names from the format string
                    // e.g. "${name}(${phone})(${user_type})" => ['name', 'phone', 'user_type']
                    const matches = [...field.reference_format.matchAll(/\$\{(\w+)\}/g)];
                    const fieldNames = matches.map(m => m[1]);
                    // Build a label string for TextField
                    // e.g. "${name}(${phone})(${user_type})" => "{name}({phone})({user_type})"
                    // We'll use FunctionField to render the formatted string
                    return (
                        <FunctionField
                            render={record => {
                                let str = field.reference_format;
                                fieldNames.forEach(fn => {
                                    str = str.replace(`\$\{${fn}\}`, record?.[fn] ?? '');
                                });
                                return str;
                            }}
                        />
                    );
                })()
            }
        </ReferenceField>
    else if (field.type == 'date')
        return <DateField key={field.name} label={label} source={field.name} showTime={field.showtime} />
    else if (field.type == 'boolean')
        return <BooleanField key={field.name} label={label} source={field.name} />
    else if (field.type == 'objectId')
        return <TextField key={field.name} label={label} source={field.name} />
    else if (field.type == 'array') {
        if (crud_field?.name?.includes('.')) {
            let child_field = findChildField(field, crud_field.name)
            return <ArrayField key={field.name} source={field.name} label={label}>
                <SingleFieldList linkType={false}>
                    {getFieldShow({ field: child_field, isList })}
                </SingleFieldList>
            </ArrayField>
        } else {
            if (isList)
                return <FunctionField key={field.name} label={label} render={record =>
                    record?.[field.name]?.length || 0
                } />
            else {
                return <ArrayField label={label} source={field.name} >
                    <Datagrid bulkActionButtons={false} rowClick={false}>
                        {field.fields.map(m => getFieldShow({ field: m, isList }))}
                    </Datagrid>
                </ArrayField>
            }
        }
    } else if (field.type == 'file') {
        return <FunctionField key={field.name} label={label} render={record =>
            <a href={record?.[field.name]?.image_preview} target="_blank">{record?.[field.name]?.title || 'Download'}</a>
        } />
    } else if (field.type == 'image') {
        if (field.avatar)
            return <FunctionField label={label} render={record =>
                <Avatar alt="Natacha" src={record[field.name].image_preview}
                    sx={isList ? { width: 100, height: 100 } : { width: 256, height: 256 }} />
            } />
        else
            return <ClickableImageField key={field.name} label={label} source={field.name}
                width={isList ? "100px" : "200px"} height={isList ? "100px" : "200px"} />
    }
    else
        return <TextField key={field.name} label={label} source={field.name} />
}

const required = (message = 'ra.validation.required') =>
    value => value ? undefined : message;
const validateRequire = [required()];

export const getFieldEdit = ({field, search = false, globalFilter = {}, label = null, crud_field}) => {
    if (!field)
        return null;
    const { type, autogenerate } = field
    if (autogenerate && !search) return null

    if (type == 'reference') {
        return <ReferenceInput key={field.name} label={field?.label} source={field.name} reference={field?.reference_entity}
            alwaysOn={globalFilter[field.name] ? false : true}
            filter={globalFilter}
            defaultValue={crud_field?.default}
        >
            <AutocompleteInput sx={{ width: '300px' }} label={field?.label} optionText={field?.reference_name}
                filterToQuery={(searchText) => ({ [field?.reference_name || 'q']: searchText })}
                validate={field.required && !search && validateRequire}
                defaultValue={globalFilter[field.name]}
            />
        </ReferenceInput>
    } else if (field?.type == 'select')
        return <SelectInput key={field.name} label={field?.label} source={field.name} alwaysOn
            choices={field?.select_values}
            optionText="label" optionValue="name"
            validate={field.required && !search && validateRequire}
            defaultValue={crud_field?.default}
        />
    else if (field?.type == 'integer') {
        return <NumberInput key={field.name} label={field?.label} source={field.name} alwaysOn
            validate={field.required && !search && validateRequire}
            defaultValue={crud_field?.default}
        />
    }
    else if (field?.type == 'image') {
        return <ImageInput key={field.name} source={field.name} label={label || field.label} accept="image/*" placeholder={<p>{field.label}</p>}
            validate={field.required && !search && validateRequire}>
            <SafeImageField source={'src'} title={'title'} />
        </ImageInput>
    }
    else if (field?.type == 'file') {
        return <FileInput key={field.name} source={field.name} placeholder={<p>{field.label}</p>}
            validate={field.required && !search && validateRequire}>
            <FileField source="src" title="title" />
        </FileInput>
    }
    else if (field?.type == 'boolean') {
        return <BooleanInput key={field.name} label={field?.label} source={field.name} alwaysOn
            validate={field.required && !search && validateRequire}
            defaultValue={crud_field?.default}
        />
    }
    else if (field?.type == 'date') {
        return <DateInput key={field.name} label={field?.label} source={field.name} alwaysOn
            showTime={field.showtime}
            validate={field.required && !search && validateRequire}
            defaultValue={crud_field?.default}
        />
    }
    else if (field.type == 'array') {
        return (<ArrayInput key={field.name} source={field.name} label={field.label} alwaysOn>
            <SimpleFormIterator>
                {field.fields && field.fields.map(subField => {
                    // recursively call getFieldEdit to render the sub fields
                    return getFieldEdit({
                        field:subField, 
                        search, 
                        globalFilter, 
                        label:subField.label,
                        crud_field  //TODO : crud_field should be child of the field
                    })
                })}
            </SimpleFormIterator>
        </ArrayInput>
        );
    } else {
        return <TextInput key={field.name} label={field?.label} source={field.name} alwaysOn
            required={!search && field?.type != 'password' && field.required}
            validate={field.required && field?.type != 'password' && !search && validateRequire}
            defaultValue={crud_field?.default}
        />
    }
}