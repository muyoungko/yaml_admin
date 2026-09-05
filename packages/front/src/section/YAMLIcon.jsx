import React from 'react';
import { Box } from '@mui/material';
import { Icon } from '@iconify/react';
import { useTheme, alpha } from '@mui/material/styles';

export const YAMLIcon = ({ icon, size = 44, color, background, sx }) => {
    const theme = useTheme();
    if (!icon) return null;

    const iconSize = Math.round(size * 0.5);

    // background가 명시된 경우(YAML gradient 등): 그대로 사용하고 아이콘은 흰색
    // color가 있는 경우: 아이콘은 해당 색, 배경은 그 색의 반투명
    // 둘 다 없으면: theme primary 기본값
    const resolvedBg = background || alpha(color || theme.palette.primary.main, 0.12);
    const resolvedIconColor = background ? '#fff' : (color || theme.palette.primary.main);

    return (
        <Box
            sx={{
                width: size,
                height: size,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: resolvedBg,
                flexShrink: 0,
                ...sx,
            }}
        >
            <Icon icon={icon} width={iconSize} height={iconSize} style={{ color: resolvedIconColor }} />
        </Box>
    );
};

export default YAMLIcon;
