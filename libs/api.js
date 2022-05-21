const CLIENT_ID = 'abc';
const CLIENT_SECRET = 'abc';
const accessTokenKey = 'access_token';
const refresTokenKey = 'refresh_token';
const baseURL = `http://localhost:3001/`;

export function api() {
  const axiosApi = axios.create({
    baseURL: baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  function storeToken(token) {
    localStorage.setItem(accessTokenKey, token.access_token);
    localStorage.setItem(refresTokenKey, token.refresh_token);
  }

  function getAccessToken() {
    return localStorage.getItem(accessTokenKey);
  }

  function getRefreshToken() {
    return localStorage.getItem(refresTokenKey);
  }

  const refreshToken = async () => {
    const token = getRefreshToken();
    if (token === 'undefined') return;
    let formData = makeFormData({
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: token,
    });

    const options = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    const response = await postApi(
      '/auth/realms/eventx/protocol/openid-connect/token',
      formData,
      options,
    );
    storeToken(response);
    return (response).access_token;
  };

  this.postApi = async function (
    path,
    payload,
    config,
  ) {
    const response = await axiosApi.post(path, payload, config);
    return response.data;

  }

  async function patchApi(
    path,
    payload,

    config,
  ) {
    const response = await axiosApi.patch(path, payload, config);
    return response.data;

  }

  async function putApi(
    path,
    payload,
    config,
  ) {
    const response = await axiosApi.put(path, payload, config);
    return response.data;

  }

  this.deleteApi = async (path) => {
    const response = await axiosApi.delete(path);
    return response.data;

  }

  this.getApi = async (path) => {
    const response = await axiosApi.get(path);
    return response.data;

  }

  async function uploadFile(url, uploadInfo, method) {
    const options = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    const formData = makeUploadFormData(uploadInfo);
    let response;

    if (method === 'put') response = putApi < any, TResponse > (url, formData, options);
    else if (method === 'patch') response = patchApi < any, TResponse > (url, formData, options);
    else response = postApi < any, TResponse > (url, formData, options);
    return response;
  }

  async function postUploadFile(url, uploadInfo) {
    return uploadFile(url, uploadInfo);
  }

  async function putUploadFile(url, uploadInfo) {
    return uploadFile(url, uploadInfo, 'put');
  }

  async function patchUploadFile(url, uploadInfo) {
    return uploadFile(url, uploadInfo, 'patch');
  }

  async function postUploadFiles(url, uploadInfos) {
    return uploadFiles(url, uploadInfos);
  }

  async function putUploadFiles(url, uploadInfos) {
    return uploadFiles(url, uploadInfos, 'put');
  }

  async function patchUploadFiles(url, uploadInfos) {
    return uploadFiles(url, uploadInfos, 'patch');
  }

  async function uploadFiles(url, uploadInfos, method) {
    const options = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    const formData = makeUploadInfosFormData(uploadInfos);
    let response;

    if (method === 'put') response = putApi < any, TResponse > (url, formData, options);
    else if (method === 'patch') response = patchApi < any, TResponse > (url, formData, options);
    else response = postApi < any, TResponse > (url, formData, options);
    return response;
  }

  function makeUploadFormData(uploadInfo) {
    let formData = new FormData();
    if (uploadInfo.isMultple) {
      for (let i = 0; i < uploadInfo.files.length; i++) {
        formData.append(`${uploadInfo.name}[${i}]`, uploadInfo.files[i]);
      }
    } else {
      formData.append(uploadInfo.name, uploadInfo.files[0]);
    }
    return formData;
  }

  function makeUploadInfosFormData(uploadInfos) {
    let formData = new FormData();
    for (let i = 0; i < uploadInfos.length; i++) {
      const uploadInfo = uploadInfos[i];
      if (uploadInfo.isMultple) {
        for (let j = 0; j < uploadInfo.files.length; j++) {
          formData.append(uploadInfo.name, uploadInfo.files[j]);
        }
      } else {
        formData.append(uploadInfo.name, uploadInfo.files[0]);
      }
    }

    return formData;
  }

  function makeFormData(details) {
    let formBody = [];
    for (let property in details) {
      let encodedKey = encodeURIComponent(property);
      let encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    return formBody.join('&');
  }
}

// window.api = new api()