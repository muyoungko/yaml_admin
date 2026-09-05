import React from 'react';
import { Box } from '@mui/material';
import { Icon } from '@iconify/react';
import { useTheme, alpha } from '@mui/material/styles';

export const YAMLIcon = ({ icon, size = 44, background, color, sx }) => {
    const theme = useTheme();
    if (!icon) return null;

    const iconSize = Math.round(size * 0.5);
    const bg = background || alpha(theme.palette.primary.main, 0.12);
    const iconColor = color || theme.palette.primary.main;

    return (
        <Box
            sx={{
                width: size,
                height: size,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: bg,
                flexShrink: 0,
                ...sx,
            }}
        >
            <Icon icon={icon} width={iconSize} height={iconSize} style={{ color: iconColor }} />
        </Box>
    );
};

export default YAMLIcon;
