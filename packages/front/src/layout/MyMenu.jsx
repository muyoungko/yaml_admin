// in src/MyMenu.js
import { Menu } from 'react-admin';
import { Divider } from '@mui/material';
import { useAdminContext } from '../AdminContext';

const MyMenu = () => {
    const yml = useAdminContext();
    return (
        <Menu>
            <Menu.DashboardItem />
            {yml?.entity && Object.keys(yml.entity).map(name => {

                return (
                    <>
                        <Menu.ResourceItem name={name} />
                    </>
                )
            })}
        </Menu>
    )
};

export default MyMenu;