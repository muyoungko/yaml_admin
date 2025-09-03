import axios from 'axios';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({});

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

export const putFetcher = async (url, config, param) => {
  const res = await axiosInstance.put(url, param, { ...config });

  return res.data;
};

export const uploadFile = (blob_path, file_name) => new Promise((resolve, reject) => {
  if(blob_path){
      const reader = new FileReader();
      reader.readAsArrayBuffer(blob_path);
      reader.onload = async () => {
          const ext = file_name.substring(file_name.lastIndexOf('.')+1, file_name.length);
          const res = await fetcher(`/api/media/url/put/${ext}`)
          fetch(res.upload_url, { method: "PUT", 
            headers: {
              'Content-Type': res.contentType
            },
            body:reader.result })
          .then(res2=>{
              resolve(res.key)
          });
      };
      reader.onerror = reject;
  } else  {
      resolve(null);
  }
});

export const convertFileToBase64 = file => new Promise((resolve, reject) => {
  if(file){
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
  } else  {
      reject(new Error('no file'))
  }
});
