import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
    useRefresh,
} from 'react-admin';

import { useAdminContext } from '../AdminContext';
import Chart from "react-apexcharts";
import { Box, Skeleton } from '@mui/material';
import { fetcher } from '../common/axios';

const Chart2 = typeof Chart === 'object' ? Chart.default : Chart;

// Enhanced chart options for better styling
const getEnhancedOptions = (baseOptions, chartType) => {
    const enhancedOptions = {
        ...baseOptions,
        chart: {
            ...baseOptions?.chart,
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: false,
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                    reset: false,
                },
            },
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150,
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350,
                },
            },
            dropShadow: {
                enabled: false,
            },
        },
        grid: {
            ...baseOptions?.grid,
            borderColor: '#f0f0f0',
            strokeDashArray: 4,
            padding: {
                left: 10,
                right: 10,
            },
        },
        stroke: {
            ...baseOptions?.stroke,
            curve: chartType === 'line' ? 'smooth' : 'straight',
            width: chartType === 'line' ? 3 : 0,
        },
        fill: {
            ...baseOptions?.fill,
            type: chartType === 'line' ? 'gradient' : 'solid',
            gradient: chartType === 'line' ? {
                shadeIntensity: 0.3,
                opacityFrom: 0.5,
                opacityTo: 0.1,
                stops: [0, 90, 100],
            } : undefined,
        },
        dataLabels: {
            ...baseOptions?.dataLabels,
            enabled: chartType === 'bar',
            style: {
                fontSize: '11px',
                fontWeight: 600,
                colors: ['#fff'],
            },
            dropShadow: {
                enabled: false,
            },
        },
        plotOptions: {
            ...baseOptions?.plotOptions,
            bar: {
                ...baseOptions?.plotOptions?.bar,
                borderRadius: 6,
                columnWidth: '60%',
                dataLabels: {
                    position: 'top',
                },
            },
        },
        xaxis: {
            ...baseOptions?.xaxis,
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            labels: {
                ...baseOptions?.xaxis?.labels,
                style: {
                    colors: '#64748b',
                    fontSize: '12px',
                    fontWeight: 500,
                },
            },
        },
        yaxis: {
            ...baseOptions?.yaxis,
            labels: {
                ...baseOptions?.yaxis?.labels,
                style: {
                    colors: '#64748b',
                    fontSize: '12px',
                    fontWeight: 500,
                },
            },
        },
        legend: {
            ...baseOptions?.legend,
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '13px',
            fontWeight: 500,
            markers: {
                width: 10,
                height: 10,
                radius: 10,
            },
            itemMargin: {
                horizontal: 12,
                vertical: 8,
            },
        },
        tooltip: {
            ...baseOptions?.tooltip,
            theme: 'light',
            style: {
                fontSize: '13px',
            },
            y: {
                formatter: (val) => val?.toLocaleString(),
            },
        },
    };
    return enhancedOptions;
};

export const YAMLComponent = ({ component, custom, ...props }) => {
    const refresh = useRefresh();
    const yml = useAdminContext();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        let queryString = '';
        component.filter?.forEach(s => {
            if(s.value?.startsWith('$')) {
                let value = localStorage.getItem(s.value.substring(1));
                if(value) {
                    queryString += `${s.name}=${encodeURIComponent(value)}&`;
                }
            } else {
                queryString += `${s.name}=null&`;
            }
        });
        fetcher(`/api/chart/${component.id}?${queryString}`).then(res => {
            setData(res);
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });
    }, [component.id]);

    const enhancedOptions = useMemo(() => {
        if (!data?.options) return null;
        return getEnhancedOptions(data.options, component?.type);
    }, [data?.options, component?.type]);

    if (loading) {
        return (
            <Box sx={{ width: '100%', height: component.height || 300 }}>
                <Skeleton
                    variant="rectangular"
                    width="100%"
                    height="100%"
                    sx={{ borderRadius: 2, bgcolor: 'rgba(0,0,0,0.04)' }}
                />
            </Box>
        );
    }

    return (
        <Box sx={{
            width: '100%',
            '& .apexcharts-canvas': {
                margin: '0 auto',
            },
        }}>
            {data && component && enhancedOptions && (
                <Chart2
                    height={component.height || 300}
                    options={enhancedOptions}
                    series={data.series}
                    type={component?.type}
                />
            )}
        </Box>
    )
};


export default YAMLComponent;