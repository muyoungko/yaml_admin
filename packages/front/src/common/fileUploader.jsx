import { uploadFile as axiosUploadFile } from '../common/axios'

/**
 * react-admin v5 uses a method-based dataProvider (getList/getOne/create/update/...).
 * This wrapper intercepts create/update to upload any fields containing `rawFile`,
 * replaces them with `{ src, title }`, and then delegates to the original provider.
 */
const fileUploader = (provider) => {
    const isPlainObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

    const replaceFileField = async (value) => {
        if (value && value.rawFile && value.title) {
            const key = await axiosUploadFile(value.rawFile, value.title);
            if (key) {
                const next = { ...value };
                next.src = key;
                delete next.rawFile;
                return next;
            }
        }
        return value;
    };

    const deepProcessData = async (data) => {
        console.log('data', data);
        if (Array.isArray(data)) {
            const processed = await Promise.all(data.map(item => deepProcessData(item)));
            return processed;
        }
        if (!isPlainObject(data)) return data;

        const entries = await Promise.all(Object.entries(data).map(async ([key, val]) => {
            console.log('key', key, val);
            if (val && val.rawFile) {
                const replaced = await replaceFileField(val);
                return [key, replaced];
            }
            if (Array.isArray(val) || isPlainObject(val)) {
                const nested = await deepProcessData(val);
                return [key, nested];
            }
            return [key, val];
        }));

        return Object.fromEntries(entries);
    };

    return {
        ...provider,
        async create(resource, params) {
            const nextData = await deepProcessData(params?.data ?? {});
            return provider.create(resource, { ...params, data: nextData });
        },
        async update(resource, params) {
            const nextData = await deepProcessData(params?.data ?? {});
            return provider.update(resource, { ...params, data: nextData });
        },
    };
};

export default fileUploader;