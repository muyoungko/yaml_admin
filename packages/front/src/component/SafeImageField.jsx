import React, { useEffect, useMemo, useState } from 'react';
import { useRecordContext } from 'react-admin';

const getValueByPath = (record, path) => {
    if (!record || !path) return undefined;
    const keys = String(path).split('.');
    let current = record;
    for (const key of keys) {
        if (current == null) return undefined;
        current = current[key];
    }
    return current;
};

const SafeImageField = ({ source = 'src', title = 'title', style }) => {
    const record = useRecordContext();
    const [errored, setErrored] = useState(false);
    const [usePreview, setUsePreview] = useState(false);
    const [useRawBlob, setUseRawBlob] = useState(false);

    const isNewUpload = useMemo(() => {
        return !!(record && typeof record === 'object' && record.rawFile);
    }, [record]);

    const primarySrc = useMemo(() => {
        if (!record) return undefined;
        const value = getValueByPath(record, source);
        if (value && typeof value === 'object' && value.src) return value.src;
        return value;
    }, [record, source]);

    const previewSrc = useMemo(() => {
        if (!record) return undefined;
        if (record && typeof record === 'object') {
            if (record.image_preview) return record.image_preview;
            if (record.preview) return record.preview;
            if (record.url) return record.url;
        }
        return undefined;
    }, [record]);

    const rawBlobSrc = useMemo(() => {
        if (record && record.rawFile instanceof File) {
            try {
                return URL.createObjectURL(record.rawFile);
            } catch (e) {
                return undefined;
            }
        }
        return undefined;
    }, [record]);

    useEffect(() => {
        return () => {
            if (rawBlobSrc) {
                URL.revokeObjectURL(rawBlobSrc);
            }
        };
    }, [rawBlobSrc]);

    const src = useMemo(() => {
        if (useRawBlob && rawBlobSrc) return rawBlobSrc;
        if (usePreview && previewSrc) return previewSrc;
        return primarySrc;
    }, [useRawBlob, rawBlobSrc, usePreview, previewSrc, primarySrc]);

    const alt = useMemo(() => {
        if (!record) return '';
        const value = getValueByPath(record, title);
        if (typeof value === 'string') return value;
        return '';
    }, [record, title]);

    if (!record) return null;
    if (errored || !src) return null;

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            {alt && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    background: 'rgba(0,0,0,0.5)',
                    color: '#fff',
                    padding: '2px 6px',
                    fontSize: '0.75rem',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {alt}
                </div>
            )}
            <img
                src={src}
                alt={alt}
                onError={() => {
                    if (isNewUpload && !useRawBlob && rawBlobSrc && src !== rawBlobSrc) {
                        setUseRawBlob(true);
                    } else if (!usePreview && previewSrc && src !== previewSrc) {
                        setUsePreview(true);
                    } else {
                        setErrored(true);
                    }
                }}
                style={{ maxHeight: '10rem', objectFit: 'contain', display: 'block', ...style }}
            />
        </div>
    );
};

export default SafeImageField;


