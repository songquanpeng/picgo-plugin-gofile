const axios = require('axios');

module.exports = (ctx) => {
  const register = () => {
    ctx.helper.uploader.register('go-file', {
      handle,
      name: 'Go File',
      config: configFunc,
      requiredFields: ['apiUrl', 'token'],
    });
  };

  const configFunc = (ctx) => {
    const config = ctx.getConfig('picBed.go-file');
    return [
      {
        name: 'apiUrl',
        type: 'input',
        default: config.apiUrl || '',
        required: true,
        message: 'Enter the Go File API URL',
      },
      {
        name: 'token',
        type: 'input',
        default: config.token || '',
        required: true,
        message: 'Enter the Go File API Token',
      },
    ];
  };

  const handle = async (ctx) => {
    const { apiUrl, token } = ctx.getConfig('picBed.go-file');
    const { imgList } = ctx;
    const promises = [];

    for (const img of imgList) {
      const formData = new FormData();
      formData.append('image', img.buffer);

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      };

      const options = {
        method: 'POST',
        url: apiUrl + "/api/image",
        headers,
        data: formData,
      };

      const promise = axios(options)
        .then((response) => {
          const data = response.data;
          if (data.success) {
            return data.url;
          } else {
            throw new Error(`Failed to upload image: ${data.message}`);
          }
        })
        .catch((error) => {
          throw new Error(`Failed to upload image: ${error.message}`);
        });

      promises.push(promise);
    }

    const results = await Promise.all(promises);

    ctx.emit('notification', {
      title: 'Upload Complete',
      body: 'Images have been successfully uploaded to Go File',
    });

    return results;
  };

  register();
};
