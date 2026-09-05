import React from 'react';
import { Box, Typography } from '@mui/material';
import YAMLIcon from './YAMLIcon';

export const YAMLComponentWelcome = ({ component }) => {
    const {
        text1,
        text2,
        text3,
        icon,
        height = 180,
        background = 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2d2d2d 100%)',
        text1_color = '#ffffff',
        text2_color = 'rgba(255,255,255,0.55)',
        text3_color = 'rgba(255,255,255,0.40)',
        icon_background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    } = component;

    return (
        <Box
            sx={{
                position: 'relative',
                borderRadius: 4,
                overflow: 'hidden',
                height: { xs: 140, md: height },
                display: 'flex',
                alignItems: 'center',
                px: { xs: 3, md: 5 },
                background,
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            }}
        >
            {/* Background decoration circles */}
            <Box sx={{
                position: 'absolute', right: -40, top: -40,
                width: 240, height: 240, borderRadius: '50%',
                background: 'rgba(255,255,255,0.03)',
                pointerEvents: 'none',
            }} />
            <Box sx={{
                position: 'absolute', right: 60, bottom: -60,
                width: 160, height: 160, borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                pointerEvents: 'none',
            }} />

            {/* Icon */}
            <YAMLIcon
                icon={icon}
                size={44}
                background={icon_background}
                color="#fff"
                sx={{ mr: { xs: 2.5, md: 4 } }}
            />

            {/* Text */}
            <Box>
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 800,
                        color: text1_color,
                        letterSpacing: '-0.5px',
                        lineHeight: 1.2,
                        mb: 1,
                        fontSize: { xs: '1.1rem', md: '1.5rem' },
                    }}
                >
                    {text1}
                </Typography>
                {text2 && (
                    <Typography
                        variant="body1"
                        sx={{
                            color: text2_color,
                            fontWeight: 400,
                            fontSize: { xs: '0.85rem', md: '0.95rem' },
                        }}
                    >
                        {text2}
                    </Typography>
                )}
                {text3 && (
                    <Typography
                        variant="body1"
                        sx={{
                            color: text3_color,
                            fontWeight: 400,
                            fontSize: { xs: '0.8rem', md: '0.9rem' },
                            mt: 0.5,
                        }}
                    >
                        {text3}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default YAMLComponentWelcome;
