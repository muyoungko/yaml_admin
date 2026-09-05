import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
    useRefresh,
} from 'react-admin';

import { useAdminContext } from '../AdminContext';
import Chart from "react-apexcharts";
import { Box, Skeleton } from '@mui/material';
import { fetcher } from '../common/axios';
import { filterToQueryString } from './YAMLFilterUtil';

const Chart2 = typeof Chart === 'object' ? Chart.default : Chart;

const commonChart = (baseOptions) => ({
    ...baseOptions?.chart,
    toolbar: {
        show: true,
        tools: { download: true, selection: false, zoom: false, zoomin: false, zoomout: false, pan: false, reset: false },
    },
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: { enabled: true, delay: 150 },
        dynamicAnimation: { enabled: true, speed: 350 },
    },
    dropShadow: { enabled: false },
});

const commonLegend = (baseOptions) => ({
    ...baseOptions?.legend,
    position: 'bottom',
    horizontalAlign: 'center',
    fontSize: '13px',
    fontWeight: 500,
    markers: { width: 10, height: 10, radius: 10 },
    itemMargin: { horizontal: 12, vertical: 8 },
});

// Enhanced chart options for better styling
const getEnhancedOptions = (baseOptions, chartType, yOptions, xOptions) => {
    const isPie = chartType === 'pie' || chartType === 'donut';

    // x.values 에 color → pie 슬라이스 / distributed bar 개별 색상
    const valueColors = xOptions?.values?.map(v => v.color).filter(Boolean);
    // y.series 에 color → if 조건부 시리즈별 색상
    const seriesColors = yOptions?.series?.map(s => s.color).filter(Boolean);
    const colors = valueColors?.length ? valueColors : seriesColors?.length ? seriesColors : undefined;

    if (isPie) {
        return {
            ...baseOptions,
            ...(colors ? { colors } : {}),
            chart: { ...commonChart(baseOptions), toolbar: { show: false } },
            legend: commonLegend(baseOptions),
            dataLabels: {
                enabled: true,
                formatter: (val) => `${Math.round(val)}%`,
                style: { fontSize: '12px', fontWeight: 600 },
                dropShadow: { enabled: false },
            },
            plotOptions: {
                pie: {
                    expandOnClick: true,
                    dataLabels: { offset: -10, minAngleToShowLabel: 10 },
                },
            },
            tooltip: {
                theme: 'light',
                style: { fontSize: '13px' },
                y: { formatter: (val) => val?.toLocaleString() },
            },
            stroke: { width: 2, colors: ['#fff'] },
        };
    }

    const distributed = chartType === 'bar' && !!valueColors?.length;

    return {
        ...baseOptions,
        ...(colors ? { colors } : {}),
        chart: commonChart(baseOptions),
        grid: {
            ...baseOptions?.grid,
            borderColor: '#f0f0f0',
            strokeDashArray: 4,
            padding: { left: 10, right: 10 },
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
                shadeIntensity: 0.3, opacityFrom: 1.0, opacityTo: 1.0, stops: [0, 90, 100],
            } : undefined,
        },
        dataLabels: {
            ...baseOptions?.dataLabels,
            enabled: chartType === 'bar',
            style: { fontSize: '11px', fontWeight: 600, colors: ['#fff'] },
            dropShadow: { enabled: false },
        },
        plotOptions: {
            ...baseOptions?.plotOptions,
            bar: {
                ...baseOptions?.plotOptions?.bar,
                borderRadius: 6,
                columnWidth: '60%',
                distributed,
                dataLabels: { position: 'top' },
            },
        },
        xaxis: {
            ...baseOptions?.xaxis,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                ...baseOptions?.xaxis?.labels,
                style: { colors: '#64748b', fontSize: '12px', fontWeight: 500 },
            },
        },
        yaxis: {
            ...baseOptions?.yaxis,
            max: yOptions?.max,
            forceNiceScale: yOptions?.type === 'integer',
            decimalsInFloat: yOptions?.type === 'integer' ? 0 : undefined,
            labels: {
                ...baseOptions?.yaxis?.labels,
                formatter: (val) => {
                    if (yOptions?.value_text) {
                        for (const item of yOptions.value_text) {
                            try {
                                const check = new Function('value', `return ${item.if}`);
                                if (check(val)) return item.text;
                            } catch (e) {
                                console.warn('Failed to evaluate value_text condition:', item.if, e);
                            }
                        }
                    }
                    return yOptions?.type === 'integer' ? Math.floor(val).toString() : val;
                },
                style: { colors: '#64748b', fontSize: '12px', fontWeight: 500 },
            },
        },
        legend: commonLegend(baseOptions),
        tooltip: {
            ...baseOptions?.tooltip,
            theme: 'light',
            style: { fontSize: '13px' },
            y: { formatter: (val) => val?.toLocaleString() },
        },
    };
};

export const YAMLComponentChart = ({ component, custom, ...props }) => {
    const refresh = useRefresh();
    const yml = useAdminContext();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const queryString = filterToQueryString(component.filter);
        const apiUrl = component.api || `/api/chart/${component.id}`;
        fetcher(`${apiUrl}?${queryString}`).then(res => {
            setData(res);
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });
    }, [component.id]);

    const enhancedOptions = useMemo(() => {
        if (!data?.options) return null;
        return getEnhancedOptions(data.options, component?.type, component?.y, component?.x);
    }, [data?.options, component?.type, component?.y]);

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


export default YAMLComponentChart;