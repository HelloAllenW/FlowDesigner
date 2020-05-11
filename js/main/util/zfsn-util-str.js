var strUtil = {
	isNotBlank: function(str) {
		return !strUtil.isBlank(str);
	},
	// 判断字符串是否为undefined或空字符串或空格
	isBlank: function(str) {
		return (strUtil.isEmpty(str)) || (str.trim().length == 0);
	},
	isEmpty: function(str) {
		return (str == undefined) || (str == 'undefined') || (str.length == 0);
	}
}
