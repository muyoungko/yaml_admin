import React, { forwardRef, useState, useEffect } from 'react'
import { AppBar, UserMenu, Logout, MenuItemLink, useRefresh, useUserMenu, LoadingIndicator } from 'react-admin';
import Avatar from '@mui/material/Avatar';
import { Badge, Typography, Toolbar, Tabs, Tab, Button, Box, List as CoreList, Chip, CircularProgress } from '@mui/material';


const ProjectMenu = forwardRef((props, ref) => {
    const { onClose } = useUserMenu();
    const refresh = useRefresh();

    useEffect(() => {
    }, [])

    return (
        <MenuItemLink
            ref={ref}
            to="/screen"
            primaryText={<Typography color={selected ? 'primary' : ''}>{props.project.name}</Typography>}
            leftIcon={<MyCustomIcon url={props.project.img && props.project.img.src} />}
            onClick={handleClick} // close the menu on click
        />
    )
});

const MyUserMenu = props => {
    const [projectList, setProjectList] = useState([]);
    const [url, setUrl] = useState({});

    useEffect(() => {

    }, [])

    const handleChange = () => {
        let selected_project = getSelectedProject()
        projectList.map(m => {
            if (selected_project == m.id)
                if (m.img)
                    setUrl(m.img.src)
                else
                    setUrl(null)
        })
    }
    return (
        <UserMenu {...props}>
            {projectList.map(m => (
                <ProjectMenu key={m.id} project={m} onChange={handleChange} />
            ))}
            <Logout />
        </UserMenu>
    )
}


const MyAppBar = props => <AppBar {...props} userMenu={<MyUserMenu />} >

</AppBar>;


export default MyAppBar;