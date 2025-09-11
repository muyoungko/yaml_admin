
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import moment from 'moment';
import React, { useMemo } from 'react';
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

const DynamicFilter = props => {
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
                    return getFieldEdit(field, true)
                })
            }
            {
                //Custom Filter Start

                //Custom Filter End
            }
        </Filter>
    )
};

const ListActions = ({crud, ...props}) => {
    const resource = useResourceContext(props);
    const fileInputRef = React.createRef();
    const notify = useNotify();
    const refresh = useRefresh();
    const location = useLocation()

    const convertFileToBase64 = async file => {
        
        if(file){
            const arrayBuffer = await file.arrayBuffer(); // ArrayBuffer 얻기
            const uint8Array = new Uint8Array(arrayBuffer); // Uint8Array로 변환
        
            // Uint8Array를 문자열로 변환
            const binaryString = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
        
            // Base64 인코딩
            return btoa(binaryString);
        } else  {
            return null
        }
    };

    const handleImportFiles = async files => {
        const file = files[0];

        const base64 = await convertFileToBase64(file)
        await postFetcher(`/excel/${resource}/import`, {}, {base64}).then(res => {
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
        //url에서 filter paremeters를 가져와서 export
        const params = new URLSearchParams(location.search); // Query String 파싱
        const filter = params.get("filter")
        postFetcher(`/excel/${resource}/export`, {}, { filter: (filter && JSON.parse(filter)) }).then(r => {
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

    return (
        <TopToolbar>
            {crud?.create && <CreateButton />}
            {crud?.import && <>
                <input
                    type="file"
                    accept=".xlsx"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={e => handleImportFiles(e.target.files)}
                />
                <Button onClick={handleImportClick} startIcon={<UploadIcon />} label='Import'/>
            </>}
            {crud?.export && <Button onClick={handleExportClick} startIcon={<DownloadIcon />} label='Export'/>}
        </TopToolbar>
    );
};

export const DynamicList = props => {
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

    //Custom List Code Start

    //Custom List Code End
    return (
        <List {...props} filters={<DynamicFilter />} mutationMode='optimistic'
            exporter={false}
            sort={{ field: 'id', order: 'DESC' }}
            perPage={30}
            actions={<ListActions crud={crud} />}
        //Custom List Action Start

        //Custom List Action End
        >
            {
                //Custom List Body Start

                //Custom List Body End
            }
            <Datagrid rowClick="show" bulkActionButtons={true}>
                {
                    fields.filter(field => crud.list == true || crud.list.map(a=>a.name).includes(field.name) ).map(m => {
                        return getFieldShow(m, true)
                    })
                }
                //Custom List Start

                //Custom List End
                <EditButton />
            </Datagrid>
        </List>
    )
};


export default DynamicList;