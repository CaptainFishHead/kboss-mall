import env from "../config/env";

/**
 * 将图片上传到服务器端 （可多张图片上传）
 */
function uploadTask ({ url, file, data }, key, result, resolve){
  if(!file || !file.length) return;
  wx.showLoading({
    title: '正在上传...',
  });
  wx.uploadFile({
    url: env.BASE_API + url, // 上传图片的接口地址
    filePath: file[key].tempFilePath, // 图片文件路径
    name: 'file',
    formData: { ...data },
    success({data:res}) {
      const {code, msg, data: fileUrl} = JSON.parse(res) || {};
      if (code === 200) {
        result['success'][key] = fileUrl;
      } else {
        result['error'][key] = msg;
      }
    },
    fail(err) {
      result['error'][key] = err;
    },
    complete(){
      key++;
      if(key === file.length) {
        const {success, error} = result;
        if (Object.keys(error).length) {
          wx.showToast({
            title: `上传失败${Object.keys(error).length}张`,
            icon: 'success'
          })
        }
        wx.hideLoading();
        resolve(result);
      } else {
        // 递归调用，上传下一张
        uploadTask({url, file, data}, key, result, resolve);
      }
    }
  })
}

export const uploadFileMulti = ({
  url, // 服务端接口地址
  file, // file文件数组
  data, // 参数
},callback) => {
  return new Promise((resolve, reject) => {
    let key = 0;
    let result = { success: {}, error: {} };
    uploadTask({ url, file, data }, key, result, resolve)
  })
}