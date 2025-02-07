Page({
	data: {
		src_url: ''
	},
	onLoad: function (options) {
    let t=new Date().getTime()
		switch (options.type) {
			case '1':
				wx.setNavigationBarTitle({ title: '氧吧酒店用户端服务协议' })
				this.setData({ src_url: `https://static.tojoyshop.com/html/wxapp-obh/agreement_protocol.html?t=${t}` })
				break
    }
	}
})
