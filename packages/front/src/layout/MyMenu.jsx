import { useState, useMemo, useEffect } from 'react';
import { useTranslate, useRedirect, useSidebarState } from 'react-admin';
import { List, MenuItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import SubMenu from './SubMenu';
import { useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAdminContext } from '../AdminContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { parseQuery } from '../common/format';

const MyMenuItem = ({ to, icon, label, dense }) => {
    const navigate = useRedirect();
    const location = useLocation();
    const [sidebarIsOpen] = useSidebarState();

    // useLocation은 HashRouter에서도 올바른 pathname 반환
    const isActive = useMemo(() => {
        const path = location.pathname || '/'
        return path === to || path.startsWith(to + '/')
    }, [to, location.pathname]);

    return (
        <MenuItem
            selected={isActive}
            onClick={() => navigate(to)}
            sx={{
                mx: 1,
                borderRadius: 2,
                mb: 0.5,
                minWidth: sidebarIsOpen ? 200 : 0,
                maxWidth: sidebarIsOpen ? 200 : 40,
                position: 'relative',
                transition: 'all 0.2s ease',
                backgroundColor: isActive ? 'primary.main' : 'transparent',
                color: isActive ? 'primary.contrastText' : 'text.secondary',
                '&:hover': {
                    backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                },
                '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                        backgroundColor: 'primary.dark',
                    },
                },
                '& .MuiListItemIcon-root': {
                    marginLeft: sidebarIsOpen? 0 : -0.7,
                    minWidth: 36,
                    color: isActive ? 'primary.contrastText' : 'text.secondary',
                    transition: 'color 0.2s ease',
                },
            }}
        >
            {icon && (
                <ListItemIcon>
                    {icon}
                </ListItemIcon>
            )}
            <ListItemText
                primary={label}
                primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: isActive ? 600 : 500,
                }}
            />
        </MenuItem>
    );
};

const MyMenu = () => {
    const context = useAdminContext();
    const yml = context?.yml || context;
    const translate = useTranslate();
    const [state, setState] = useState({});
    const [sidebarIsOpen] = useSidebarState();
    
    const handleToggle = (menu) => {
        setState(state => ({ ...state, [menu]: !state[menu] }));
    };

    const categoryList = useMemo(() => {
        const list = yml?.front?.category || [];
        list.forEach(m => {
            if (state[m.name] === undefined) {
                state[m.name] = true;
            }
            m.menuList = yml?.entity && Object.keys(yml.entity).map(key => {
                let r = yml.entity[key];
                r.name = key;
                return r;
            }).filter(f => f.category === m.name && f.hidden !== true);
        });
        return list;
    }, [yml, state]);

    const noCategoryList = useMemo(() => {
        const list = yml?.entity && Object.keys(yml.entity).map(key => {
            let r = yml.entity[key];
            r.name = key;
            return r;
        }).filter(f => !f.category && f.hidden !== true);
        return list || [];
    }, [yml]);

    return (
        <Box sx={{ pt: 2, pb: 2 }}>
            <List component="nav" dense sx={{ px: 0 }}>
                {yml?.front?.dashboard && (
                    <MyMenuItem
                        to="/"
                        icon={<DashboardIcon/>}
                        label={sidebarIsOpen && translate('ra.page.dashboard', { _: 'Dashboard' })}
                        dense
                    />
                )}

                {noCategoryList.map(m => (
                    <MyMenuItem
                        key={m.name}
                        to={`/${m.name}`}
                        icon={m.icon ? <Icon icon={m.icon} /> : null}
                        label={translate(`resources.${m.name}.name`, { _: m.label || m.name })}
                        dense
                    />
                ))}

                {sidebarIsOpen &&categoryList.map(c => (
                    <SubMenu
                        key={c.name}
                        handleToggle={() => handleToggle(c.name)}
                        isOpen={state[c.name]}
                        name={c.name}
                        icon={<Icon icon={c.icon} />}
                        dense
                    >
                        {c.menuList?.map(m => (
                            <MyMenuItem
                                key={m.name}
                                to={`/${m.name}`}
                                icon={m.icon ? <Icon icon={m.icon} /> : null}
                                label={translate(`resources.${m.name}.name`, { _: m.label || m.name })}
                                dense
                            />
                        ))}
                    </SubMenu>
                ))}

                {!sidebarIsOpen && categoryList.map(c=>c.menuList).flat().map(m => (
                    <MyMenuItem
                        key={m.name}
                        to={`/${m.name}`}
                        icon={m.icon ? <Icon icon={m.icon} /> : null}
                        dense
                    />
                ))}
            </List>
        </Box>
    );
};

export default MyMenu;