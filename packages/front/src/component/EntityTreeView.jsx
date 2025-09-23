import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
    useRefresh,
} from 'react-admin';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdminContext } from '../AdminContext';
import { postFetcher, fetcher } from '../common/axios.jsx';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Box, Paper } from '@mui/material';


/**
 * @param {object} component
 * {
    "component": "tree",
    "entity": "region",
    "key": "id",
    "parent_key": "parent_id",
    "label": "name"
   }
 * @param {*} component 
 * @returns 
 */
export const EntityTreeView = ({ component, custom, ...props }) => {
    const navigate = useNavigate()
    const refresh = useRefresh();
    const yml = useAdminContext();
    const [list, setList] = useState([])
    useEffect(() => {
        let {entity, key, parent_key, label} = component
        const custon_filter = custom?.globalFilterDelegate(entity) || {}
        let url = `/${entity}?${parent_key}=`
        if(custon_filter) {
            url += `&${Object.keys(custon_filter).map(key => `${key}=${custon_filter[key]}`).join('&')}`
        }
        fetcher(url).then(res => {
            setList(res)
        })
    }, [component])

    return (
        <Box sx={{ minHeight: 352, minWidth: 250 }}>
            <SimpleTreeView>
                {list.map(item => {
                    return <TreeItem key={item[component.key]} itemId={item[component.key]} label={item[component.label]} />
                })}
                {/* <TreeItem itemId="grid" label="Data Grid">
                    <TreeItem itemId="grid-community" label="@mui/x-data-grid" />
                    <TreeItem itemId="grid-pro" label="@mui/x-data-grid-pro" />
                    <TreeItem itemId="grid-premium" label="@mui/x-data-grid-premium" />
                </TreeItem>
                <TreeItem itemId="pickers" label="Date and Time Pickers">
                    <TreeItem itemId="pickers-community" label="@mui/x-date-pickers" />
                    <TreeItem itemId="pickers-pro" label="@mui/x-date-pickers-pro" />
                </TreeItem>
                <TreeItem itemId="charts" label="Charts">
                    <TreeItem itemId="charts-community" label="@mui/x-charts" />
                </TreeItem>
                <TreeItem itemId="tree-view" label="Tree View">
                    <TreeItem itemId="tree-view-community" label="@mui/x-tree-view" />
                </TreeItem> */}
            </SimpleTreeView>
        </Box>
    )
};


export default EntityTreeView;