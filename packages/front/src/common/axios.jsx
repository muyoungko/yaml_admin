import axios from 'axios';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({});

export const updateToken = async (query) => {
  if (query && query.token) {
    sessionStorage.setItem('token', query.token);
    localStorage.setItem('token', query.token);
    axiosInstance.defaults.headers.common['x-access-token'] = `${query.token}`;
  }
};

export const setApiHost = (host) => {
  let base = host ?? import.meta.env.VITE_HOST_API ?? 'http://localhost:6911';
  if (base && !base.startsWith('http')) {
    base = `http://${base}`;
  }
  axiosInstance.defaults.baseURL = base;
};

// initialize with defaults so it's usable before YAML is loaded
setApiHost();

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

// ----------------------------------------------------------------------


export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

export const postFetcher = async (url, config, param) => {

  const res = await axiosInstance.post(url, param, { ...config });

  return res.data;
};


export const uploadFile = (blob_path, file_name) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsArrayBuffer(blob_path);
  reader.onload = async () => {
    const ext = file_name.substring(file_name.lastIndexOf('.') + 1, file_name.length);
    const res = await fetcher(`/api/media/url/put/${ext}`)
    fetch(res.upload_url, {
      method: "PUT",
      headers: {
        'Content-Type': res.contentType
      },
      body: reader.result
    })
      .then(res2 => {
        resolve(res.key)
      });
  };
  reader.onerror = reject;
});

export const uploadFileSecure = (blob_path, file_name) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsArrayBuffer(blob_path);
  reader.onload = async () => {
    const ext = file_name.substring(file_name.lastIndexOf('.') + 1, file_name.length);
    const res = await fetcher(`/api/media/url/secure/put/${ext}`)
    fetch(res.upload_url, {
      method: "PUT",
      headers: {
        'Content-Type': res.contentType
      },
      body: reader.result
    }).then(res2 => {
      resolve(res.key)
    });
  };
  reader.onerror = reject;
});

export const uploadFileSecureProgress = async (file, onProgress) => {
  const CHUNK_SIZE = 50 * 1024 * 1024; // 진행상황 업데이트 위해 분할크기 축소
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  let uploadedSize = 0;

  const ext = file.name.split('.').pop();

  // uploadId
  let initRes
  try {
    initRes = await fetcher(`/api/media/url/secure/init/${ext}`);
  } catch (e) {
    throw new Error("업로드 초기화 실패");
  }
  const { uploadId, key } = initRes;

  try {
    const partRequests = Array.from({ length: totalChunks }, (_, i) =>
      postFetcher(`/api/media/url/secure/part`, {}, { key, uploadId, partNumber: i + 1 })
    );

    // part uploadUrl
    const partResponses = await Promise.all(partRequests);

    /*
     * uploadedParts = { PartNumber: chunk index, ETag: ETag }
     */
    const uploadedParts = [];

    // 분할 업로드 진행상황 표시를 위해 순차 업로드
    for (let partIndex = 0; partIndex < partResponses.length; partIndex++) {
      const start = partIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      // eslint-disable-next-line no-await-in-loop
      const uploadResponse = await fetchWithRetry(partResponses[partIndex].uploadUrl, { method: "PUT", body: chunk });
      uploadedSize += chunk.size;
      // 퍼센트 업데이트
      onProgress(Math.round((uploadedSize / file.size) * 100));

      const eTag = uploadResponse.headers.get("ETag");
      uploadedParts.push({ PartNumber: partIndex + 1, ETag: eTag.replace(/"/g, '') });
    }

    // 분할 업로드 완료, 파일 병합 요청
    await postFetcher(`/api/media/url/secure/complete`, {}, { key, uploadId, parts: uploadedParts })

    return key;
  } catch (e) {
    const abort = await postFetcher(`/api/media/url/secure/abort`, {}, { key, uploadId });
    if (abort && abort.r) {
      throw new Error("파일 업로드 실패");
    }
    else {
      throw new Error(`업로드 실패 key: ${key}`);
    }
  }
};

export const uploadFileWithBase64String = (base64string, file_name) => new Promise((resolve, reject) => {
  const ext = file_name.substring(file_name.lastIndexOf('.') + 1, file_name.length);
  fetcher(`/api/media/url/put/${ext}`).then(res => {
    let byteString = base64string;
    if (base64string.startsWith('data:'))
      byteString = atob(base64string.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    fetch(res.upload_url, {
      method: "PUT",
      headers: {
        'Content-Type': res.contentType
      },
      body: ab
    })
      .then(res2 => {
        resolve(res.key)
      });
  })
});

export const useGetFetcher = (path) => {
  const url = path
  const { data, isLoading, error, isValidating } = useSWR(url, fetcher);

  const memoizedValue = useMemo(
    () => ({
      data,
      isLoading,
      error,
      isValidating
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

async function fetchWithRetry(url, options = {}, retries = 0) {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (retries < 3) {
      console.log(`요청 실패. 재시도${retries + 1}회 : ${url}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries + 1);
    } else {
      throw new Error("파일 업로드 실패");
    }
  }
}
export const uploadFileLocal = (blob_path, file_name) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsArrayBuffer(blob_path);
  reader.onload = async () => {
    const ext = file_name.substring(file_name.lastIndexOf('.') + 1, file_name.length);
    const url = `/api/local/media/upload?ext=${ext}&name=${encodeURIComponent(file_name)}`
    const res = await axiosInstance.put(url, reader.result, {
      headers: { 'Content-Type': 'application/octet-stream' },
      transformRequest: [(data) => data]
    });
    resolve(res.data.key)
  };
  reader.onerror = reject;
});

export const uploadFileLocalSecure = (blob_path, file_name) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsArrayBuffer(blob_path);
  reader.onload = async () => {
    const ext = file_name.substring(file_name.lastIndexOf('.') + 1, file_name.length);
    const url = `/api/local/media/upload/secure?ext=${ext}&name=${encodeURIComponent(file_name)}`
    const res = await axiosInstance.put(url, reader.result, {
      headers: { 'Content-Type': 'application/octet-stream' },
      transformRequest: [(data) => data]
    });
    resolve(res.data.key)
  };
  reader.onerror = reject;
});