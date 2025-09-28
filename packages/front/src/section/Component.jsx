import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
    useRefresh,
} from 'react-admin';

import { useNavigate } from 'react-router-dom';
import { useAdminContext } from '../AdminContext';
import Chart from "react-apexcharts";
import { fetcher } from '../common/axios';

export const ComponentLayout = ({ component, custom, ...props }) => {
    const navigate = useNavigate()
    const refresh = useRefresh();
    const yml = useAdminContext();
    const [data, setData] = useState(null);

    useEffect(() => {
        fetcher(`/api/chart/${component.id}`).then(res => {
            setData(res);
        });
    }, [component.id]);

    return (
        <div>
            {data && <Chart
                height={component.height || 300}
                options={data.options}
                series={data.series}
                type={component?.type}
            />}
        </div>
    )
};


export default ComponentLayout;