import {
    TextField, NumberField, ReferenceField, DateField, BooleanField,
    ReferenceInput, AutocompleteInput, TextInput,
    SelectInput, FunctionField, ImageInput, ImageField, FileInput, FileField,
    ArrayInput, ArrayField, SingleFieldList, Datagrid, SimpleFormIterator, BooleanInput,
    DateInput, NumberInput, DateTimeInput,
    FormDataConsumer,
} from 'react-admin';
import { Avatar, Chip, Box } from '@mui/material';
import ClickableImageField from '../component/ClickableImageField';
import SafeImageField from '../component/SafeImageField';
import { format, ifChecker } from '../common/format';

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
        if (field.multiline)
            return <FunctionField key={field.name} label={label} render={record => <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{record[field.name]}</pre>} />
        return <TextField key={field.name} label={label} source={field.name} multiline={field.multiline}/>
    } else if (field.type == 'integer')
        return <NumberField key={field.name} label={label} source={field.name} />
    else if (field.type == 'length')
        return <FunctionField key={field.name} label={label} render={record =>
            <>
                {record[field.name]?.length}
            </>
        } />
    else if (field.type == 'select'){
        if(field.select_values)
            return <FunctionField key={field.name} label={label} source={field.name}
                render={record => field.select_values.find(m => m.name == record[field.name])?.label} />
        else   
            return <TextField key={field.name} label={label} source={field.name} />
    } else if (field.type == 'reference')
        return <ReferenceField key={field.name} link="show" label={label} source={field.name} reference={field.reference_entity}>
            {!field.reference_format && <TextField source={field.reference_name} />}
            {field.reference_format && (() => {
                    return (
                        <FunctionField
                            render={record => format(field.reference_format, record)}
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
            if (isList) {
                if(crud_field?.chip) {
                    return <FunctionField key={field.name} label={label} render={record =>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {record?.[field.name]?.map((item, index) => (
                                <Chip key={index} label={format(crud_field.format, item)} size="small" />
                            ))}
                        </Box>
                    } />
                } else {
                    return <FunctionField key={field.name} label={label} render={record =>
                        record?.[field.name]?.length || 0
                    } />
                }
            } else {
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
        return <TextField key={field.name} label={label} source={field.name}/>
}

const required = (message = 'ra.validation.required') =>
    value => value ? undefined : message;
const validateRequire = [required()];

const validateCustom = (rules) => (value, allValues) => {
    if (!rules) return undefined;
    for (const rule of rules) {
        if (rule.if && !ifChecker(rule.if, allValues)) continue;
        if (rule.input === 'number') {
            if (value && !/^\d+$/.test(value)) return rule.message;
        } else if (rule.input === 'length') {
            if (value) {
                if (rule.min && value.length < rule.min) return rule.message;
                if (rule.max && value.length > rule.max) return rule.message;
            }
        }
    }
    return undefined;
}

export const getFieldEdit = ({field, search = false, globalFilter = {}, label = null, defaultValue = null, crud_field}) => {
    if (!field)
        return null;

    if(field.condition) {
        return <FormDataConsumer key={field.name + "condition"}>
            {({formData, scopedFormData}) => {
                let record = scopedFormData ? scopedFormData : formData
                if(field.condition.includes('==')) {
                    let [key, value] = field.condition.split('==')
                    key = key.trim()
                    value = value.trim().replace(/['"]/g, '')
                    if(record?.[key] != value) return null
                }
                return getFieldEditCore({field, search, globalFilter, label, defaultValue, crud_field})
            }}
        </FormDataConsumer> 
    } else {
        return getFieldEditCore({field, search, globalFilter, label, defaultValue, crud_field})
    }
}

export const getFieldEditCore = ({field, search = false, globalFilter = {}, label = null, defaultValue = null, crud_field}) => {
    
    const { type, autogenerate } = field
    if (autogenerate && !search) return null
    defaultValue = defaultValue || field.default //TODO : parameter defaultValue calcuration

    const validators = []
    if (field.required && !search && field.type !== 'password') validators.push(required())
    if (field.validate && !search) validators.push(validateCustom(field.validate))

    if (type == 'reference') {
        let filter = {...globalFilter}
        if(crud_field?.filter) {
            crud_field.filter.forEach(f => {
                filter[f.name] = f.value
                if(f.value?.startsWith('$')) {
                    let value = localStorage.getItem(f.value.replace('$', ''))
                    if(value)
                        filter[f.name] = value
                }
            })
        }

        return <ReferenceInput key={field.name} label={field?.label} source={field.name} reference={field?.reference_entity}
            alwaysOn={globalFilter[field.name] ? false : true}
            filter={filter}
        >
            <AutocompleteInput label={field?.label} 
                optionText={(record) => format(field?.reference_format, record) || record[field?.reference_name]}
                filterToQuery={(searchText) => ({ [field?.reference_name || 'q']: searchText })}
                validate={validators}
                defaultValue={defaultValue || globalFilter[field.name] }
            />
        </ReferenceInput>
    } else if (field?.type == 'select') {
        return <SelectInput key={field.name} label={field?.label} source={field.name} alwaysOn
            choices={field?.select_values}
            optionText="label" optionValue="name"
            validate={validators}
            defaultValue={defaultValue}
        />
    } else if (field?.type == 'integer') {
        return <NumberInput key={field.name} label={field?.label} source={field.name} alwaysOn
            validate={validators}
            defaultValue={defaultValue}
        />
    }
    else if (field?.type == 'image') {
        return <ImageInput key={field.name} source={field.name} label={label || field.label} accept="image/*" placeholder={<p>{field.label}</p>}
            sx={(theme) => ({
                maxWidth: theme?.components?.MuiFormControl?.styleOverrides?.root?.maxWidth
            })}
            validate={validators}>
            <SafeImageField source={'src'} title={'title'}/>
        </ImageInput>
    }
    else if (field?.type == 'file') {
        return <FileInput key={field.name} source={field.name} placeholder={<p>{field.label}</p>}
            sx={(theme) => ({
                maxWidth: theme?.components?.MuiFormControl?.styleOverrides?.root?.maxWidth
            })}
            validate={validators}>
            <FileField source="src" title="title" />
        </FileInput>
    }
    else if (field?.type == 'boolean') {
        if(search)
            return <SelectInput key={field.name} label={field?.label} source={field.name} alwaysOn
                choices={[
                    { name: '', label: '' },
                    { name: 'true', label: 'TRUE' },
                    { name: 'false', label: 'FALSE' },
                ]}
                optionText="label" optionValue="name"
                validate={validators}
                defaultValue={defaultValue}
                resettable
            />
        else
            return <BooleanInput key={field.name} label={field?.label} source={field.name} alwaysOn
                validate={validators}
                defaultValue={defaultValue}
            />
    }
    else if (field?.type == 'date') {
        if(field.showtime)
            return <DateTimeInput key={field.name} label={field?.label} source={field.name} alwaysOn
                validate={validators}
                defaultValue={defaultValue}
            />
        else
            return <DateInput key={field.name} label={field?.label} source={field.name} alwaysOn
                validate={validators}
                defaultValue={defaultValue}
            />
    }
    else if (field.type == 'array') {
        return (<ArrayInput key={field.name} source={field.name} label={field.label} alwaysOn
        >
            <SimpleFormIterator>
                {field.fields && field.fields.map(subField => {
                    // recursively call getFieldEdit to render the sub fields
                    return getFieldEdit({
                        field:subField, 
                        search, 
                        globalFilter, 
                        label:subField.label,
                    })
                })}
            </SimpleFormIterator>
        </ArrayInput>
        );
    } else {
        return <TextInput key={field.name} label={field?.label} source={field.name} alwaysOn
            required={!search && field?.type != 'password' && field.required}
            validate={validators}
            defaultValue={defaultValue}
            multiline={field.multiline}
            resettable
        />
    }
}
