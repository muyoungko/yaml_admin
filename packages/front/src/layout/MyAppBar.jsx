import React, { forwardRef, useState, useEffect } from 'react'
import { AppBar,  UserMenu, Logout, MenuItemLink, useRefresh, useUserMenu, LoadingIndicator} from 'react-admin';
import Avatar from '@mui/material/Avatar';
import client from '../common/client'
import {getSelectedProject} from '../common/common'
import {Badge, Typography, Toolbar, Tabs, Tab, Button, Box, List as CoreList, Chip, CircularProgress} from '@mui/material';


const ProjectMenu = forwardRef((props, ref) => {
    const { onClose } = useUserMenu();
    const refresh = useRefresh();
    const [selected, setSelected] = useState(false);
    const handleClick = (e) =>{
        sessionStorage.setItem('devil_project', props.project.id)
        localStorage.setItem('devil_project', props.project.id)
        props.onChange()
        onClose()
        refresh()
    }

    useEffect(() => {
        let selected_project = getSelectedProject()
        if(selected_project == props.project.id)
            setSelected(true)
        else 
            setSelected(false)
    }, [])

    return (
    <MenuItemLink
        ref={ref}
        to="/screen"
        primaryText={<Typography color={selected?'primary':''}>{props.project.name}</Typography>}
        leftIcon={<MyCustomIcon url={props.project.img && props.project.img.src} />}
        onClick={handleClick} // close the menu on click
    />
)});

const MyCustomIcon = (props) => {
    return (
        props && props.url && props.url.length > 1?
        <Avatar
            sx={{height: 30,
                width: 30}}
            src={props.url}
        />
        :
        <Avatar
            sx={{height: 30,
                width: 30}}
        />
    )
};


const MyUserMenu = props => {
    const [projectList, setProjectList] = useState([]);
    const [url, setUrl] = useState({});
    

    useEffect(() => {
        client.request_get('/project').then(list=>{
            let selected_project = getSelectedProject()
            if(list && list.length){
                list.map(m=>{
                    if(m.id == selected_project)
                        if(m.img)
                            if(url != m.img.src)
                                setUrl(m.img.src)
                        else 
                            if(url != null)
                                setUrl(null)
                })
                
                if(list.length != projectList.length)
                    setProjectList(list)
            }
        })
    }, [])

    const handleChange = ()=>{
        let selected_project = getSelectedProject()
        projectList.map(m=>{
            if(selected_project == m.id)
                if(m.img)
                    setUrl(m.img.src)
                else 
                    setUrl(null)
        })
    }
    return (
    <UserMenu {...props}
        icon={<MyCustomIcon url={url}/>}>
             {projectList.map(m=>(
                 <ProjectMenu key={m.id} project={m} onChange={handleChange}/>
             ))}
             <Logout/>
    </UserMenu>
)}


const MyAppBar = props => <AppBar {...props} userMenu={<MyUserMenu />} >
    
</AppBar>;


export default MyAppBar;