module.exports = (ctx) => {
  const register = () => {
    ctx.helper.uploader.register('go-file', {
      handle,
      name: 'Go File',
      config: config
    })
  }

  const handle = async function (ctx) {
    let userConfig = ctx.getConfig('picBed.go-file')
    if (!userConfig) {
      throw new Error('找不到上传配置')
    }
    let url = userConfig.url
    if (url.endsWith('/')) {
      url = url.substring(0, url.length - 1)
    }
    const token = userConfig.token

    try {
      let imgList = ctx.output
      for (let i in imgList) {
        let image = imgList[i].buffer
        if (!image && imgList[i].base64Image) {
          image = Buffer.from(imgList[i].base64Image, 'base64')
        }

        const postConfig = {
          method: 'POST',
          url: url,
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'PicGo'
          },
          formData: {
            image: {
              value: image,
              options: {
                filename: imgList[i].fileName
              }
            }
          }
        }

        let body = await ctx.Request.request(postConfig)

        delete imgList[i].base64Image
        delete imgList[i].buffer

        imgList[i]['imgUrl'] = body
      }
    } catch (err) {
      ctx.emit('notification', {
        title: '上传失败',
        body: JSON.stringify(err)
      })
    }
  }

  const config = ctx => {
    let userConfig = ctx.getConfig('picBed.go-file')
    if (!userConfig) {
      userConfig = {}
    }
    return [
      {
        name: 'url',
        type: 'input',
        default: userConfig.url,
        required: true,
        message: 'API地址',
        alias: 'API地址'
      },
      {
        name: 'token',
        type: 'input',
        default: userConfig.token,
        required: true,
        message: 'Bear Token',
        alias: 'Bear Token'
      }
    ]
  }

  return {
    uploader: 'go-file',
    register
  }
}