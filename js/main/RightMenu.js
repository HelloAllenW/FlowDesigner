// 节点右击菜单
var nodeMenuJson = [
	/*{
		name: "节点属性",
		id: "nodeAttr",
		callback: function(tempId) {
			layuiUtil.editNodeAttribute(tempId);
		}
	},*/
	{
		name: "复制节点",
		id: "copyNode",
		callback: function(tempId) {
			FLOW.copyNode(tempId);
		}
	},
	{
		name: "删除节点",
		id: "deleteNode",
		callback: function(tempId) {
			FLOW.deleteNode(tempId);
		}
	},
	{
		name: "显示节点前继路径",
		id: "connRouteFront",
		callback: function(tempId) {
			FLOW.showConnectionRoute(tempId, 'front');
		}
	},
	{
		name: "显示节点后续路径",
		id: "connRouteBehind",
		callback: function(tempId) {
			FLOW.showConnectionRoute(tempId, 'behind');
		}
	},
	{
		name: "节点样式",
		id: "nodeStyle",
		callback: function(tempId) {
			layuiUtil.setNodeStyle(tempId);
		}
	}
];

// 连接线右击菜单
var connectionMenuJson = [
	/*{
		name: "连线属性",
		id: "connectionAttr",
		callback: function(tempId) {
			// 编辑路由属性
			layuiUtil.connectionAttr(tempId);
		}
	},*/
	{
		name: "删除连线",
		id: "deleteConnection",
		callback: function(tempId) {
			FLOW.deleteConnection(tempId);
		}
	}
];

//泳道右击菜单
var laneMenuJson = [
	/*{
		name: "属性编辑",
		id: "laneAttr",
		callback: function(tempId) {
			// 编辑泳道属性
			layuiUtil.laneAttr(tempId);
		}
	},*/
	{
		name: "删除泳道",
		id: "deleteLane",
		callback: function(tempId) {
			FLOW.deleteLane(tempId);
		}
	}
];

// 画布右击菜单
var canvasMenuJson = [
	{
		name: "流程图信息",
		id: "flowChartInfo",
		callback: function(tempId) {
			alert("预留功能。。。。。");
		}
	},
	{
		name: "粘贴",
		id: "pasteNode",
		callback: function(tempId) {
			FLOW.pasteNode();
		}
	},
	{
		name: "全选",
		id: "selectAll",
		callback: function(tempId) {
			FLOW.selectedAll();
		}
	},
	{
		name: "保存流程",
		id: "saveFlowChart",
		callback: function(tempId) {
			FLOW.save();
		}
	},
	{
		name: "快捷工具",
		id: "shortcutTools"
	},
	{
		name: "对齐方式",
		id: "alignWay"
	},
	
	//快捷工具子菜单
	{
		name: "移除连接线",
		id: "removeAllConnection",
		parent: "shortcutTools",
		callback: function(tempId) {
			alert("预留功能。。。。。");
		}
	},
	
	//对齐方式子菜单
	{
		name: "左对齐",
		id: "leftAlign",
		parent: "alignWay",
		callback: function(tempId) {
			let selectedNodeIdArr = plumbUtil.alignWayCheck();
			if (selectedNodeIdArr != null) {
				plumbUtil.leftAlign(selectedNodeIdArr);
				setTimeout(function(){
					plumbUtil.leftAlign(selectedNodeIdArr);
					// 更新所有图对象中保存的节点位置
					graphUtil.updateAllNode();
				}, CONFIG.alignParam.alignDuration + 100);
			}
		}
	},
	{
		name: "垂直居中",
		id: "verticalCenter",
		parent: "alignWay",
		callback: function(tempId) {
			let selectedNodeIdArr = plumbUtil.alignWayCheck();
			if (selectedNodeIdArr != null) {
				plumbUtil.verticalCenter(selectedNodeIdArr);
				setTimeout(function(){
					plumbUtil.verticalCenter(selectedNodeIdArr);
					// 更新所有图对象中保存的节点位置
					graphUtil.updateAllNode();
				}, CONFIG.alignParam.alignDuration + 100);
			}
		}
	},
	{
		name: "右对齐",
		id: "rightAlign",
		parent: "alignWay",
		callback: function(tempId) {
			var selectedNodeIdArr = plumbUtil.alignWayCheck();
			if (selectedNodeIdArr != null) {
				plumbUtil.rightAlign(selectedNodeIdArr);
				setTimeout(function(){
					plumbUtil.rightAlign(selectedNodeIdArr);
					// 更新所有图对象中保存的节点位置
					graphUtil.updateAllNode();
				}, CONFIG.alignParam.alignDuration + 100);
			}
		}
	},
	{
		name: "上对齐",
		id: "upAlign",
		parent: "alignWay",
		callback: function(tempId) {
			var selectedNodeIdArr = plumbUtil.alignWayCheck();
			if (selectedNodeIdArr != null) {
				plumbUtil.upAlign(selectedNodeIdArr);
				setTimeout(function(){
					plumbUtil.upAlign(selectedNodeIdArr);
					// 更新所有图对象中保存的节点位置
					graphUtil.updateAllNode();
				}, CONFIG.alignParam.alignDuration + 100);
			}
		}
	},
	{
		name: "水平居中",
		id: "levelAlign",
		parent: "alignWay",
		callback: function(tempId) {
			var selectedNodeIdArr = plumbUtil.alignWayCheck();
			if (selectedNodeIdArr != null) {
				plumbUtil.levelAlign(selectedNodeIdArr);
				setTimeout(function(){
					plumbUtil.levelAlign(selectedNodeIdArr);
					// 更新所有图对象中保存的节点位置
					graphUtil.updateAllNode();
				}, CONFIG.alignParam.alignDuration + 100);
			}
		}
	},
	{
		name: "下对齐",
		id: "downAlign",
		parent: "alignWay",
		callback: function(tempId) {
			var selectedNodeIdArr = plumbUtil.alignWayCheck();
			if (selectedNodeIdArr != null) {
				plumbUtil.downAlign(selectedNodeIdArr);
				setTimeout(function(){
					plumbUtil.downAlign(selectedNodeIdArr);
					// 更新所有图对象中保存的节点位置
					graphUtil.updateAllNode();
				}, CONFIG.alignParam.alignDuration + 100);
			}
		}
	}
];
