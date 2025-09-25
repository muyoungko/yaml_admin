import { useState, useMemo } from 'react';
import { Menu } from 'react-admin';
import SubMenu from './SubMenu';
import { Icon } from '@iconify/react';
import { useAdminContext } from '../AdminContext';

const MyMenu = () => {
    const yml = useAdminContext();
    const [state, setState] = useState({
        
    });
    const handleToggle = (menu) => {
        setState(state => ({ ...state, [menu]: !state[menu] }));
    };

    const categoryList = useMemo(() => {
        const list = yml?.front?.category || []
        list.forEach(m=>{
            state[m.name] = true
            m.menuList = yml?.entity && Object.keys(yml.entity).map(m=>{
                let r = yml.entity[m]
                r.name = m
                return r
            }).filter(f=>f.category == m.name && f.hidden !== true)
        })
        return list
    }, [yml]);

    const noCartegoryList = useMemo(() => {
        const list = yml?.entity && Object.keys(yml.entity).map(m=>{
            let r = yml.entity[m]
            r.name = m
            return r
        }).filter(f=>!f.category && f.hidden !== true)
        return list || [];
    }, [yml]);

    return (
        <Menu>
            {yml?.front?.dashboard && <Menu.DashboardItem />}

            {noCartegoryList.map(m => <Menu.ResourceItem key={m.name} name={m.name} />)}
            {categoryList.map(c => {
                return <SubMenu
                    key={c.name}
                    handleToggle={() => handleToggle(c.name)}
                    isOpen={state[c.name]}
                    name={c.name}
                    icon={<Icon icon={c.icon} />}
                    dense={true}
                >
                    {c.menuList.map(m => {
                        return <Menu.ResourceItem key={m.name} name={m.name} />
                    })}
                </SubMenu>
            })}

        </Menu>
    )
};

export default MyMenu;