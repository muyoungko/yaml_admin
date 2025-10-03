import React, { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import {
    useRefresh,
} from 'react-admin';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdminContext } from '../AdminContext';
import { postFetcher, fetcher } from '../common/axios.jsx';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Box, Paper } from '@mui/material';
import { act } from '../common/actionParser';

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
    const fetchedKeysRef = useRef(new Set())

    useEffect(() => {
        let {entity, key, parent_key, label, sort} = component
        const custon_filter = (custom?.globalFilterDelegate && custom?.globalFilterDelegate(entity)) || {}
        let url = `/${entity}?${parent_key}=`
        if(custon_filter) {
            url += `&${Object.keys(custon_filter).map(key => `${key}=${custon_filter[key]}`).join('&')}`
        }
        if(sort) {
            url += `&_sort=${sort.map(s => `${s.name}`).join(',')}`
            url += `&_order=${sort.map(s => `${s.desc ? 'DESC' : 'ASC'}`).join(',')}`
        }
        
        fetcher(url).then(res => {
            
            if(Array.isArray(res)) {
                setList(res)
                res.map(m=>{
                    fetchChild(m)
                })
            }
        })
    }, [component, custom])

    const findNode = useCallback((node, targetKeyValue) => {
        if(node[component.key] == targetKeyValue) {
            return node
        }
        if(Array.isArray(node.list)) {
            for(let n of node.list) {
                let r = findNode(n, targetKeyValue)
                if(r) {
                    return r
                }
            }
        }
        return null
    }, [component])

    
    const updateNodeChildren = useCallback((nodes, targetKeyValue, children) => {
        if(!Array.isArray(nodes)) return nodes
        return nodes.map(node => {
            if(node[component.key] === targetKeyValue) {
                return { ...node, list: children }
            }
            if(Array.isArray(node.list)) {
                const updated = updateNodeChildren(node.list, targetKeyValue, children)
                if(updated !== node.list) {
                    return { ...node, list: updated }
                }
            }
            return node
        })
    }, [component])

    const fetchChild = useCallback((item) => {
        let {entity, key, parent_key, label, sort} = component
        const custon_filter = (custom?.globalFilterDelegate && custom?.globalFilterDelegate(entity)) || {}
        let key_value = item[component.key]
        if(fetchedKeysRef.current.has(key_value)) return
        let url = `/${entity}?${parent_key}=${key_value}`
        if(custon_filter) {
            url += `&${Object.keys(custon_filter).map(key => `${key}=${custon_filter[key]}`).join('&')}`
        }
        if(sort) {
            url += `&_sort=${sort.map(s => `${s.name}`).join(',')}`
            url += `&_order=${sort.map(s => `${s.desc ? 'DESC' : 'ASC'}`).join(',')}`
        }
        fetcher(url).then(res => {
            let children = Array.isArray(res) ? res : []
            // remove self references and duplicates
            children = children.filter(c => c?.[component.key] !== key_value)
            setList(prev => updateNodeChildren(prev, key_value, children))
            fetchedKeysRef.current.add(key_value)
            // recursively prefetch deeper children
            children.forEach(child => fetchChild(child))
        })
    }, [component, custom, updateNodeChildren])

    const itemClick = useCallback((event, nodeId) => {
        let theNode = findNode({list}, nodeId)
        let isPeer = !theNode.list || theNode.list.length == 0
        if(isPeer) {
            if(component.peer_click?.action) {
                let args = []
                component.argment.forEach(arg => {
                    args.push(theNode[arg.name])
                })
                for(let action of component.peer_click.action) {  
                    act(action, args, {
                        navigate
                    })
                }
            }
        }

        if(custom?.itemClick && typeof custom?.itemClick == 'function') {
            custom.itemClick(theNode)
        }
        
    }, [component, custom, list, findNode])

    const renderTree = (item, visited) => {
        const id = item[component.key]
        if(visited?.has(id)) return null
        const nextVisited = visited ? new Set(visited) : new Set()
        nextVisited.add(id)
        return (
            <TreeItem key={id} itemId={`${id}`} label={<span >{item[component.label]}</span>} >
                {item.list?.map(child => renderTree(child, nextVisited))}
            </TreeItem>
        )
    }
    
    return (
        <Box sx={{ minHeight: 352, minWidth: 250 }}>
            <SimpleTreeView onItemClick={itemClick}>
                {list.map(item => {
                    return (
                        renderTree(item)
                    )
                })}
            </SimpleTreeView>
        </Box>
    )
};


export default EntityTreeView;