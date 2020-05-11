/**
 * 原型增强
 */
// 1、删除数组中的一个元素
Array.prototype.deleteOne = function(data) {
	let i;
	let $this = this;
	let index = $this.indexOf(data);
	if (index != -1) {
		for (i = index; i < $this.length - 1; i++) {
			$this[i] = $this[i + 1];
		}
		$this.pop();
	}
}

// 工具助手
var ZFSN = {
	// 控制台输出
	consoleLog: function(strArr) {
		let log = '';
		for (let i = 0, len = strArr.length; i < len; i++) {
			log += strArr[i] + '\n';
		}
		console.log('%c' + log, 'color: red; font-weight: bold;');
	},
	// 获取鼠标位置(相对于浏览器窗口)
	getMousePos: function(event) {
		event = document.all ? window.event : arguments[0] ? arguments[0] : event;
		return {
			'x': event.pageX,
			'y': event.pageY
		};
	},
	// 加载json文件
	loadJsonFromUrl: function(url, method, callback, noCache) {
		if (noCache === undefined) noCache = true;
		var xmlhttp;
		if (!method) {
			method = 'GET';
		}
		try {
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		} catch (e) {
			try {
				xmlhttp = new XMLHttpRequest();
			} catch (e) {
				return null;
			}
		}
		xmlhttp.open(method, url);
		if (noCache) {
			xmlhttp.setRequestHeader('Cache-Control', 'max-age=0');
		}
		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState === 4) {
				if (xmlhttp.status === 200) {
					callback(null, xmlhttp.responseText);
				} else {
					callback(xmlhttp.status, xmlhttp.responseText);
				}
			}
		};
		try {
			xmlhttp.send(null);
		} catch (e) {
			callback(e, '');
		}
	},
	// 通过id获取jQuery选择器
	getJQSel: function(id) {
		if (id.indexOf('#') != 0) {
			id = '#' + id;
		}
		return id;
	},
	// 获取移除了jQuery选择器前缀的id
	removeJQSel: function(id) {
		if (id.indexOf('#') == 0) {
			id = id.substring(1);
		}
		return id;
	},
	// 使程序睡眠d毫秒
	sleep: function(d) {
		for(let t = Date.now(); Date.now() - t <= d;);
	},
	// 延时30ms执行
	lazyExecute: function(f) {
		setTimeout(function() {
			f();
		}, 30);
	},
	// 获取uuid
	getUUID: function() {
		let s = [];
		let hexDigits = "0123456789abcdef";
		for(let i = 0; i < 36; i++) {
			s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
		}
		s[14] = "4";
		s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
		s[8] = s[13] = s[18] = s[23] = "-";
	
		let uuid = s.join("");
		return uuid.replace(/-/g, '');
	},
	// 获取节点四个角坐标
	getNodeCoordinate: function(nodeId) {
		nodeId = ZFSN.getJQSel(nodeId);
		var x11 = $(nodeId).offset().left;
		var y11 = $(nodeId).offset().top;
		var x22 = x11 + parseInt($(nodeId).css('width'));
		var y22 = y11;
		var x33 = x11 + parseInt($(nodeId).css('width'));
		var y33 = y11 + parseInt($(nodeId).css('height'));
		var x44 = x11;
		var y44 = y11 + parseInt($(nodeId).css('height'));
		
		return {
			x11: x11,
			y11: y11,
			x22: x22,
			y22: y22,
			x33: x33,
			y33: y33,
			x44: x44,
			y44: y44
		};
	},
	// 获取全局配置
	getConfig: function() {
		return CONFIG;
	},
	// 根据div的高度算出字行距实现竖排字自动排版
	getLaneLineHeight: function(text, height) {
		let textArr = text.split(''), i = textArr.length, h = parseInt(height);
		return h / (i * 15);
	}
}
