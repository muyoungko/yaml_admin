import React, { useMemo, useState, useEffect } from 'react';
import {
    useGetList,
    ListContextProvider,
    Datagrid,
    ResourceContextProvider,
    useListController,
    Loading,
    Pagination
} from 'react-admin';

import { useAdminContext } from '../AdminContext';
import { Box, Skeleton, Typography } from '@mui/material';
import { getFieldShow } from '../common/field';
import { filterToObject } from './YAMLFilterUtil';

export const YAMLComponentTable = ({ component, custom, ...props }) => {
    const { yml } = useAdminContext();
    const [filter, setFilter] = useState({});
    const sort = useMemo(() => {
        const firstSort = Array.isArray(component.sort) ? component.sort[0] : null;
        if (!firstSort?.name) {
            return { field: 'id', order: 'DESC' };
        }

        return {
            field: firstSort.name,
            order: firstSort.desc ? 'DESC' : 'ASC',
        };
    }, [component.sort]);

    useEffect(() => {
        setFilter(filterToObject(component.filter));
    }, [component.filter]);

    const { data, total, isLoading, error } = useGetList(
        component.entity,
        { 
            pagination: { page: 1, perPage: component.limit || 10 },
            sort,
            filter: filter
        },
        { enabled: Object.keys(filter).length > 0 || !component.filter }
    );

    const listContext = useMemo(() => ({
        data,
        isLoading,
        total,
        page: 1,
        perPage: component.limit || 10,
        sort,
        filterValues: filter,
        setSort: () => {},
        setPage: () => {},
        setPerPage: () => {},
        setFilters: () => {},
        resource: component.entity,
        selectedIds: [],
        onSelect: () => {},
        onToggleItem: () => {},
        onUnselectItems: () => {},
    }), [data, isLoading, total, sort, filter, component.entity, component.limit]);

    if (isLoading) {
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

    if (error) {
        return <Typography color="error">Error loading data</Typography>;
    }

    if (!data || !yml?.entity?.[component.entity]) {
        return null;
    }

    const entityDef = yml.entity[component.entity];

    return (
        <ResourceContextProvider value={component.entity}>
            <ListContextProvider value={listContext}>
                <Box sx={{ width: '100%', overflow: 'auto', ...(component.height ? { minHeight: component.height } : {}) }}>
                    <Datagrid bulkActionButtons={false} rowClick={false} empty={<Box sx={{ p: 2, color: 'text.secondary' }}>{component.none ?? 'No data'}</Box>}>
                        {component.fields.map((fieldConf, index) => {
                            const fieldName = typeof fieldConf === 'string' ? fieldConf : fieldConf.name;
                            // Find field definition in entity
                            const fieldDef = entityDef.fields.find(f => f.name === fieldName);
                            
                            if (!fieldDef) return null;

                            return getFieldShow({
                                field: fieldDef,
                                isList: true,
                                crud_field: typeof fieldConf === 'object' ? fieldConf : { name: fieldName }
                            });
                        })}
                    </Datagrid>
                </Box>
            </ListContextProvider>
        </ResourceContextProvider>
    );
};

export default YAMLComponentTable;
