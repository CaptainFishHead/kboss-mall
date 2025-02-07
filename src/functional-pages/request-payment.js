// functional-pages/request-payment.js
export function beforeRequestPayment (paymentArgs, callback) {
    var customArgument = paymentArgs.customArgument;
    wx.login({
        success: function (data) {
            wx.request({
                url: customArgument.payUrl,
                data: {
                    'orderId': customArgument.orderId ,
                    'wxCode' : data.code,
                    'channelInner': customArgument.channelInner,
                    'payType': customArgument.payType,
                    'payFormType':customArgument.payFormType,
                    'mobile':customArgument.mobile,
                    'userId': customArgument.userId
                },
                method: 'POST',
                success: function (res) {
                  console.log('unified order success, response is:', res);
                  var payargs = res.data.payargs;
                  var error = null;
                  var requestPaymentArgs = {
                    timeStamp: payargs.timestamp,
                    nonceStr: payargs.noncestr,
                    package: payargs.prepayid,
                    signType: payargs.signType,
                    paySign: payargs.sign
                  };
                  callback(error, requestPaymentArgs);
                }
              });
        }
    })
  }