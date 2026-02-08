import * as React from 'react';
import {
  Box,
  MenuItem,
  ListItemIcon,
  Typography,
  Collapse,
  Tooltip,
} from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useTranslate, useSidebarState } from 'react-admin';

const SubMenu = ({ handleToggle, isOpen, name, icon, children, dense }) => {
  const translate = useTranslate();
  const [sidebarIsOpen] = useSidebarState();

  const header = (
    <MenuItem
      dense={dense}
      onClick={handleToggle}
      sx={{
        mx: 1,
        borderRadius: 2,
        mb: 0.5,
        minWidth:230,
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
        '& .MuiListItemIcon-root': {
          minWidth: 36,
          color: 'text.secondary',
          transition: 'color 0.2s ease',
        },
      }}
    >
      <ListItemIcon>
        {icon}
      </ListItemIcon>
      <Typography
        variant="body2"
        sx={{
          flex: 1,
          fontWeight: 500,
          color: 'text.secondary',
          transition: 'all 0.2s ease',
        }}
      >
        {translate(name, { _: name })}
      </Typography>
      <ExpandMore
        sx={{
          color: 'text.disabled',
          fontSize: 20,
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
        }}
      />
    </MenuItem>
  );

  return (
    <Box sx={{ mb: 0.5 }}>
      {sidebarIsOpen || isOpen ? (
        header
      ) : (
        <Tooltip title={translate(name, { _: name })} placement="right">
          {header}
        </Tooltip>
      )}
      <Collapse in={isOpen} timeout={300} unmountOnExit>
        <Box
          sx={{
            ml: 2,
            pl: 1,
            borderLeft: '2px solid',
            borderColor: 'divider',
            '& .MuiMenuItem-root': {
              borderRadius: 2,
              mx: 1,
              mb: 0.5,
            },
          }}
        >
          {children}
        </Box>
      </Collapse>
    </Box>
  );
};

export default SubMenu;