var colorUtil = {
	// 根据十六进制颜色获取节点渐变背景样式
	getNodeLinearBgFromHex: function(hex) {
		let nodeBg = 'linear-gradient(to right, ' + hex + 'e6, ' + hex + 'cc, ' + hex + 'e6)';
		return nodeBg;
	}
}
