import { uploadFile, uploadFileLocal, uploadFileLocalSecure, uploadFileSecure } from '../common/axios'

/**
 * react-admin v5 uses a method-based dataProvider (getList/getOne/create/update/...).
 * This wrapper intercepts create/update to upload any fields containing `rawFile`,
 * replaces them with `{ src, title }`, and then delegates to the original provider.
 */
const fileUploader = (provider, isLocal = false, privateEntityMap = {}) => {
    const isPlainObject = (value) => value && typeof value === 'object' && !Array.isArray(value);
    const replaceFileField = async (entity_name, filed_name, value) => {
        if (value && value.rawFile && value.title) {
            let key
            let isSecure = false
            if(privateEntityMap[entity_name] && privateEntityMap[entity_name][filed_name]) {
                isSecure = true
            }

            if(isLocal) {
                if(isSecure) {
                    key = await uploadFileLocalSecure(value.rawFile, value.title);
                } else {
                    key = await uploadFileLocal(value.rawFile, value.title);
                }
            } else {
                if(isSecure) {
                    key = await uploadFileSecure(value.rawFile, value.title);
                } else {
                    key = await uploadFile(value.rawFile, value.title);
                }
            }
            
            if (key) {
                const next = { ...value };
                next.src = key;
                delete next.rawFile;
                return next;
            }
        }
        return value;
    };

    const deepProcessData = async (entity_name, data) => {
        if (Array.isArray(data)) {
            const processed = await Promise.all(data.map(item => deepProcessData(entity_name, item)));
            return processed;
        }
        if (!isPlainObject(data)) return data;

        const entries = await Promise.all(Object.entries(data).map(async ([key, val]) => {
            if (val && val.rawFile) {
                const replaced = await replaceFileField(entity_name, key, val);
                return [key, replaced];
            }
            if (Array.isArray(val) || isPlainObject(val)) {
                const nested = await deepProcessData(entity_name, val);
                return [key, nested];
            }
            return [key, val];
        }));

        return Object.fromEntries(entries);
    };

    return {
        ...provider,
        async create(resource, params) {
            const nextData = await deepProcessData(resource, params?.data ?? {});
            return provider.create(resource, { ...params, data: nextData });
        },
        async update(resource, params) {
            try {
                const nextData = await deepProcessData(resource, params?.data ?? {});            
                return provider.update(resource, { ...params, data: nextData });
            } catch (e) {
                console.error('update error', e)
            }
        },
    };
};

export default fileUploader;