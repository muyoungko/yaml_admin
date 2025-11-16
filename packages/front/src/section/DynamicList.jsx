
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import moment from 'moment';
import React, { useMemo, useCallback } from 'react';
import {
    Button,
    CreateButton,
    Datagrid,
    EditButton,
    Filter,
    List,
    SaveButton,
    Toolbar,
    TopToolbar,
    useNotify,
    useRecordContext,
    useRefresh,
    useResourceContext
} from 'react-admin';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdminContext } from '../AdminContext';
import { postFetcher } from '../common/axios.jsx';
import { getFieldEdit, getFieldShow } from '../common/field';
import DynamicLayout from './DynamicLayout';
import { ifChecker } from '../common/format';
import { act } from '../common/actionParser';
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

const DynamicFilter = ({ custom, ...props }) => {
    const yml = useAdminContext();
    const resource = useResourceContext(props);
    const yml_entity = useMemo(() => {
        return yml.entity[resource]
    }, [yml, resource])

    return (
        <Filter {...props}>
            {
                yml_entity.crud?.search?.map(m => {
                    const field = yml_entity.fields.find(f => f.name == m.name)
                    return getFieldEdit({
                        field,
                        search: true,
                        globalFilter: custom?.globalFilterDelegate(resource) || {},
                        crud_field: m
                    })
                })
            }
            {
                //Custom Filter Start

                //Custom Filter End
            }
        </Filter>
    )
};

const ListActions = ({ crud, custom, ...props }) => {
    const resource = useResourceContext(props);
    const fileInputRef = React.createRef();
    const notify = useNotify();
    const refresh = useRefresh();
    const location = useLocation()

    const convertFileToBase64 = async file => {

        if (file) {
            const arrayBuffer = await file.arrayBuffer(); // ArrayBuffer 얻기
            const uint8Array = new Uint8Array(arrayBuffer); // Uint8Array로 변환

            // Uint8Array를 문자열로 변환
            const binaryString = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');

            // Base64 인코딩
            return btoa(binaryString);
        } else {
            return null
        }
    };

    const handleImportFiles = async files => {
        const file = files[0];

        const base64 = await convertFileToBase64(file)
        await postFetcher(`/excel/${resource}/import`, {}, { base64 }).then(res => {
            if (res && res.r) {
                notify(
                    res.msg,
                    { type: 'success' },
                    {},
                    false
                );
                refresh();
            } else {
                notify(
                    res.msg,
                    { type: 'error' },
                    {},
                    false
                );
            }
        }).catch(e => {
            notify(
                e.message,
                { type: 'error' },
                {},
                false
            );
        });
    };

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleExportClick = () => {
        const params = new URLSearchParams(location.search);
        let filter = params.get("filter")
        if (filter)
            filter = JSON.parse(filter)
        else
            filter = {}
        const globalFilter = custom?.globalFilterDelegate(resource)
        let mergedFilter = {}
        if (globalFilter) {
            mergedFilter = { ...filter, ...globalFilter }
        }
        postFetcher(`/excel/${resource}/export`, {}, { filter: mergedFilter }).then(r => {
            if (!r.r) {
                notify(
                    r.msg ? r.msg : 'xlsx 생성에 실패하였습니다.',
                    'warning',
                    {},
                    false
                );
            } else if (r && r.r) {
                const link = document.createElement('a');
                link.href = r.url;
                const today = moment().format('YYYYMMDDHHmmss');
                link.setAttribute('download', `${today}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                notify(
                    'Download Start...',
                    'info',
                    {},
                    false
                );
            }
        });
    }

    const createSearch = useMemo(() => {
        let search = ''
        if (Array.isArray(crud.create)) {
            const params = new URLSearchParams(location.search);
            let filter = params.get("filter")
            if (filter)
                filter = JSON.parse(filter)
            else
                filter = null

            if (filter) {
                crud.create.forEach(f => {
                    if (f.default) {
                        let q = f.default
                        if (q.startsWith('$')) {
                            q = q.replace('$', '')
                            if (search !== '')
                                search += '&'
                            search += `${q}=${filter[q]}`
                        }
                    }
                })
            }
        }
        return search
    }, [crud.create, location])

    return (
        <TopToolbar>
            {crud?.create && <CreateButton to={{ pathname: `/${resource}/create`, search: createSearch }} />}
            {crud?.import && <>
                <input
                    type="file"
                    accept=".xlsx"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={e => handleImportFiles(e.target.files)}
                />
                <Button onClick={handleImportClick} startIcon={<UploadIcon />} label='Import' />
            </>}
            {crud?.export && <Button onClick={handleExportClick} startIcon={<DownloadIcon />} label='Export' />}
        </TopToolbar>
    );
};


const RowButton = ({ crud_field }) => {
    const navigate = useNavigate()
    const record = useRecordContext()
    return <Button label={crud_field.label} onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        crud_field.action.forEach(a => {
            act(a, record, {
                navigate
            })
        })
    }} />
}

export const DynamicList = ({ custom, ...props }) => {
    const navigate = useNavigate()
    const refresh = useRefresh();
    const yml = useAdminContext();
    const resource = useResourceContext(props);

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

    const fields = useMemo(() => {
        return yml.entity[resource].fields
    }, [yml, resource])

    const findField = useCallback((name) => {
        let name_array = name.split('.')[0]
        let r = fields.find(f => f.name == name_array)
        if (!r)
            r = fields.find(f => f.name == name)
        return r;
    }, [fields])

    const shouldShowFields = useCallback(( crud_field ) => {

        if (
            fields.map(a => a.name).includes(crud_field.name)
            || crud_field.type == 'button'
        )
            return true

        return findField(name) != null

        return false

    }, [fields])
    //Custom List Code Start

    //Custom List Code End
    return (
        <DynamicLayout entity={yml.entity[resource]} custom={custom}>
            <List {...props} filters={<DynamicFilter custom={custom} />} mutationMode='optimistic'
                exporter={false}
                sort={{ field: 'id', order: 'DESC' }}
                perPage={30}
                actions={<ListActions crud={crud} custom={custom} />}
                filter={custom?.globalFilterDelegate(resource) || {}}
            //Custom List Action Start

            //Custom List Action End
            >
                {
                    //Custom List Body Start

                    //Custom List Body End
                }
                <Datagrid rowClick={crud.show ? "show" : false}
                    bulkActionButtons={crud.delete ? true : false}
                >
                    {crud.list == true && fields.map(m => {
                        return getFieldShow({
                            field: m,
                            isList: true
                        })
                    })}
                    {crud.list != true && crud.list
                        .filter(f => f.name)
                        .filter(f => shouldShowFields(f))
                        .map((crud_field, index) => {
                            if(crud_field.type == 'button') {
                                return <RowButton key={index} crud_field={crud_field} />
                            } else {
                                let m = findField(crud_field.name)
                                return getFieldShow({
                                    crud_field,
                                    field: m,
                                    isList: true
                                })
                            }
                        })}

                    {crud.edit && <EditButton />}
                </Datagrid>
            </List>
        </DynamicLayout>
    )
};


export default DynamicList;