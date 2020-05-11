var idPoolUtil = {
	// 初始化节点id池
	init: function() {
		FLOW._base.nodeIdPool = {
			'T': [], //人工节点、自动节点
			'E': [], //开始、结束、事件节点
			'G': [], //网关节点
			'S': [], //子流程节点
			'R': [], //路由线
			'L': []  //泳道
		}
	},
	// 记录节点id到池中
	recordNodeId: function(nodeId) {
		let _base = FLOW._base;
		let prefix = nodeId.substring(0, 1);
		let v = parseInt(nodeId.substring(1));
		
		// 判断池中是否已经存在该id，不存在时再记录
		if (_base.nodeIdPool[prefix].indexOf(v) == -1) {
			_base.nodeIdPool[prefix].push(v);
			_base.nodeIdPool[prefix].sort(function(a, b) {
				return a - b;
			});
		}
	},
	// 从池中移除节点id
	removeNodeId: function(nodeId) {
		let prefix = nodeId.substring(0, 1);
		let index = parseInt(nodeId.substring(1));
		let arr = FLOW._base.nodeIdPool[prefix], i;
		for (i = index - 1; i < arr.length - 1; i++) {
			arr[i] = arr[i + 1];
		}
		FLOW._base.nodeIdPool[prefix].pop();
	},
	// 获取下一个指定类型的节点id
	getNextNodeId: function(prefix) {
		let $this = this;
		let pool = FLOW._base.nodeIdPool;
		let arr = pool[prefix], i;
		for (i = 1; i <= arr.length; i++) {
			if (i != arr[i - 1]) {
				break;
			}
		}
		let nextId = prefix + $this.addLeftZero(i);
		arr.push(i);
		arr.sort(function(a, b) {
			return a - b;
		});
		return nextId;
	},
	// 左补零
	addLeftZero: function(i) {
		let numStr = i.toString();
		let c = numStr.length - 5;
		let r = '';
		while (c < 0) {
			r += '0';
			c++;
		}
		r += numStr;
		return r;
	}
}
