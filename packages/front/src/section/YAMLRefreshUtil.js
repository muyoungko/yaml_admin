import { useEffect } from 'react';

/**
 * 직접 fetch를 사용하는 컴포넌트용 폴링 훅 (Chart, ChartPieDonut, Count 등)
 * fn(isInitial): 첫 호출은 true, 이후 폴링 호출은 false
 * deps: useEffect dependency array
 * refresh: 폴링 주기 (초 단위). falsy면 폴링 안 함
 */
export function usePollingEffect(fn, deps, refresh) {
    useEffect(() => {
        fn(true);
        if (!refresh) return;
        const interval = setInterval(() => fn(false), refresh * 1000);
        return () => clearInterval(interval);
    }, deps);
}

/**
 * useGetList를 사용하는 컴포넌트용 옵션 빌더 (Table, List 등)
 * refresh: 폴링 주기 (초 단위). falsy면 refetchInterval 추가 안 함
 */
export function withRefetchInterval(options, refresh) {
    if (!refresh) return options;
    return { ...options, refetchInterval: refresh * 1000 };
}
