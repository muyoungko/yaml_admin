import React, { useMemo, useState, useEffect } from 'react';
import { useAdminContext } from '../AdminContext';
import Chart from 'react-apexcharts';
import { Box, Skeleton, Typography } from '@mui/material';
import { fetcher } from '../common/axios';
import { filterToQueryString } from './YAMLFilterUtil';

const Chart2 = typeof Chart === 'object' ? Chart.default : Chart;

const COLORS = [
    '#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#ef4444',
    '#8b5cf6', '#06b6d4', '#f97316', '#84cc16', '#ec4899',
];

export const YAMLComponentChartPieDonut = ({ component, custom, ...props }) => {
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

    const { chartOptions, labels, series, colors } = useMemo(() => {
        if (!data) return {};

        const rawSeries = Array.isArray(data.series) ? data.series : [];
        const rawLabels = data.options?.labels || [];
        const valueColors = component?.x?.values?.map(v => v.color).filter(Boolean);
        const resolvedColors = valueColors?.length ? valueColors : COLORS;

        const isDonut = component?.type === 'donut';

        const options = {
            chart: {
                type: component?.type || 'pie',
                toolbar: { show: false },
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 800,
                },
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            },
            colors: resolvedColors,
            labels: rawLabels,
            dataLabels: {
                enabled: false,
            },
            plotOptions: {
                pie: {
                    expandOnClick: true,
                    donut: {
                        size: '60%',
                        labels: {
                            show: isDonut,
                            name: {
                                show: true,
                                fontSize: '11px',
                                fontWeight: 400,
                                color: '#94a3b8',
                                offsetY: -14,
                            },
                            total: {
                                show: true,
                                label: '합계',
                                fontSize: '11px',
                                fontWeight: 400,
                                color: '#94a3b8',
                                offsetY: -14,
                                formatter: (w) =>
                                    w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString(),
                            },
                            value: {
                                fontSize: '24px',
                                fontWeight: 700,
                                color: '#1e293b',
                                offsetY: 0,
                                formatter: (val) => Number(val).toLocaleString(),
                            },
                        },
                    },
                },
            },
            legend: { show: false },
            stroke: { width: 2, colors: ['#fff'] },
            tooltip: {
                theme: 'light',
                style: { fontSize: '13px' },
                y: { formatter: (val) => val?.toLocaleString() },
            },
            ...(data.options || {}),
            // override options that must not be overridden by raw data
            dataLabels: { enabled: false },
            legend: { show: false },
        };

        return {
            chartOptions: options,
            labels: rawLabels,
            series: rawSeries,
            colors: resolvedColors,
        };
    }, [data, component?.type, component?.x]);

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

    if (!data || !series) return null;

    const total = series.reduce((a, b) => a + b, 0);

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
            {/* Chart */}
            <Box sx={{ flexShrink: 0 }}>
                <Chart2
                    height={component.height || 280}
                    width={component.height || 280}
                    options={chartOptions}
                    series={series}
                    type={component?.type || 'pie'}
                />
            </Box>

            {/* Legend */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1 }}>
                {labels.map((label, i) => {
                    const value = series[i] ?? 0;
                    const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                    const color = colors[i % colors.length];
                    return (
                        <Box
                            key={label}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.2,
                                px: 1.5,
                                py: 1,
                                borderRadius: 2,
                                bgcolor: 'rgba(0,0,0,0.025)',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    bgcolor: color,
                                    flexShrink: 0,
                                }}
                            />
                            <Typography
                                sx={{
                                    fontSize: '13px',
                                    color: '#475569',
                                    fontWeight: 500,
                                    flexGrow: 1,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {label}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: '13px',
                                    color: '#1e293b',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                }}
                            >
                                {value.toLocaleString()}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: '11px',
                                    color: '#94a3b8',
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                    minWidth: 40,
                                    textAlign: 'right',
                                }}
                            >
                                {pct}%
                            </Typography>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};

export default YAMLComponentChartPieDonut;
