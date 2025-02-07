import Cos from 'cos-wx-sdk-v5'
import env from '@config/env'
import { wxFuncToPromise } from '@utils/wxUtils'
import { hideToast, showToast } from '@components/toast/index'
import { TOAST_TYPE, STORAGE_USER_FOR_KEY } from '@const/index'
import { track, TrackEventName } from '@utils/sa'
import { cosUploadTempSecret } from '@models/commonModels'
import { uploadHealthReport } from '@models/healthArchivesModel'

Component({
  properties: {},
  data: {
    visible: false,
    isUpload: false,
    stepList: [
      {
        text: '01.上传健康报告',
        imgUrl: 'https://static.tojoyshop.com/images/wxapp-boss/healthInfo/archives/icon-step1.png'
      },
      {
        text: '02.分析健康数据',
        imgUrl: 'https://static.tojoyshop.com/images/wxapp-boss/healthInfo/archives/icon-step2.png'
      },
      {
        text: '03.完成报告解读',
        imgUrl: 'https://static.tojoyshop.com/images/wxapp-boss/healthInfo/archives/icon-step3.png'
      }
    ],
    filePath: ''
  },
	options: {
		multipleSlots: true,
		styleIsolation: 'apply-shared'
	},
  methods: {
    showUpload() {
      this.setData({
        visible: true
      })
    },
    close() {
      this.setData({
        visible: false,
        isUpload: false
      })
    },
    // 上传报告图片
    async handleUpload() {
      // 初始化实例
      const cos = new Cos({
        SimpleUploadMethod: 'postObject',
        async getAuthorization(options, callback) {
          const { result } = await cosUploadTempSecret({
            dir: 'image'
          })
          callback({
            TmpSecretId: result.secretId,
            TmpSecretKey: result.secretKey,
            SecurityToken: result.token,
            StartTime: result.startTime, // 时间戳，单位秒，如：1580000000
            ExpiredTime: result.endTime // 时间戳，单位秒，如：1580000900
          })
        },
        Domain: env.VITE_DOMAIN,
        Protocol: env.VITE_PROTOCOL
      })

      wxFuncToPromise(`chooseMedia`, {
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        camera: 'back'
      }).then(res => {
        let { tempFilePath, fileType } = res.tempFiles[0]
        cos.postObject(
          {
            Bucket: env.VITE_BUCKET,
            /* 必须 */
            Region: env.VITE_REGION,
            /* 存储桶所在地域，必须字段 */
            Key: `/${fileType}/${tempFilePath.substr(tempFilePath.lastIndexOf('.') + 1)}/${tempFilePath.substr(
              tempFilePath.lastIndexOf('/') + 1
            )}`,
            FilePath: tempFilePath,
            onProgress(info) {}
          },
          (err, data) => {
            if (err) {
              showToast({ title: '上传失败', type: TOAST_TYPE.ERROR })
              return
            }
            let imgUrl = `https://${data.Location || ''}`
            uploadHealthReport({ str: imgUrl })
              .then(({ result }) => {
                this.setData({ isUpload: true })
                track(TrackEventName.Boss_Health_uploading)
              })
              .catch(err => {
                console.log(err)
              })
          }
        )
      })
    },
    //联系客服
    contactAdvisor() {
      wx.navigateTo({
        url: '/pages/healthArchives/healthWaiter/index'
      })
    },
    touchMove() {
      return // 解决蒙层下页面滚动问题
    },
    // 查看历史报告
    toggleHistory() {
      wx.navigateTo({
        url: '/pages/healthArchives/uploadHistory/index'
      })
    },

  }
})
