var graphUtil = {
	// 节点的构造函数
	Node: function(id, cla, nodeType, text, bgColor, icon, height, width) {
		this.key = id;
		this.cla = cla;
		this.nodeType = nodeType;
		this.text = text;
		this.bgColor = bgColor;
		this.icon = icon;
		this.nodeHeight = height;
		this.nodeWidth = width;
	},
	// 连线的构造函数
	Edge: function (routerId, sourceEndPointId, targetEndPointId, sourceAnchors, targetAnchors) {
		this.routerId = routerId;
		this.sourceEndPointId = sourceEndPointId;
		this.targetEndPointId = targetEndPointId;
		this.sourceAnchors = sourceAnchors;
		this.targetAnchors = targetAnchors;
	},
	// 添加连线到图对象
	addEdge: function(sourceId, targetId, edge) {
		let _base = FLOW._base;
		
		_base.graph.setEdge(sourceId, targetId, { // 源节点和目标节点的id
			id: edge.routerId, // 连线id
			sourceEndPointId: edge.sourceEndPointId, // 源节点端点的id
			targetEndPointId: edge.targetEndPointId, // 目标节点端点的id
			sourceAnchors: edge.sourceAnchors, // 源节点的锚点
			targetAnchors: edge.targetAnchors // 目标节点的锚点
		});
	},
	// 获取图对象中被标记为选中的节点的id数组
	getSelectedNodeIds: function() {
		let _base = FLOW._base;
		let nodeIds = _base.graph.nodes();
		let selectedNodeIds = [];
		
		for (let i = 0, len = nodeIds.length; i < len; i++) {
			if (_base.graph.node(nodeIds[i]).isSelected) {
				selectedNodeIds.push(nodeIds[i]);
			}
		}
		return selectedNodeIds;
	},
	// 更新图对象中的节点
	updateNode: function(id) {
		let _base = FLOW._base;
		let $this = $(ZFSN.getJQSel(id));
		let graphNode = _base.graph.node(ZFSN.removeJQSel(id));
		
		//由于超过五个字节点上不再显示，所有这里不能用节点的text去更新图对象
		//graphNode.text = $this.children(':first-child').text();
		
		graphNode.locTop = $this.offset().top;
		graphNode.locLeft = $this.offset().left;
		graphNode.nodeHeight = $this.css('height');
		graphNode.nodeWidth = $this.css('width');
		graphNode.bgColor = $this.attr('bgColor-gradient');
	},
	// 更新图对象中的所有节点
	updateAllNode: function() {
		let _base = FLOW._base;
		let nodeArr = _base.graph.nodes();
		
		for (let i = 0, len = nodeArr.length; i < len; i++) {
			graphUtil.updateNode(nodeArr[i]);
		}
	},
	// 检查流程图合法性
	checkGraph: function() {
		let _base = FLOW._base;
		
		// 克隆graph对象
		let copyGraph = $.extend(true, {}, _base.graph);
		let msg = '0';
		let componentLen = graphlib.alg.components(copyGraph).length;
		
		if (componentLen == 0) {
			msg = CONFIG.msg.noNode; // 无节点
		} else if (componentLen > 1) {
			msg = CONFIG.msg.noConn; // 存在节点没有连接
		} /*else if (!graphlib.alg.isAcyclic(copyGraph)) {
			msg = CONFIG.msg.hasAcyclic; // 存在循环
		}*/
		return msg;
	},
	// 保存为图片之前检查是否合法
	checkGraphBySave2Photo: function() {
		let _base = FLOW._base;
		let msg = '0';
		let nodeArr = _base.graph.nodes();
		
		if (nodeArr.length <= 0) {
			msg = CONFIG.msg.noNodeBySave2Photo;
		}
		return msg;
	},
	// 放置、粘贴新节点时检查图对象
	checkGraphBeforeCreate: function(nodeType) {
		let _base = FLOW._base;
		let msg = '0';
		
		// 1、只允许有一个开始节点
		if (nodeType == 'start') {
			let nodeIds = _base.graph.nodes();
			for (let i = 0, len = nodeIds.length; i < len; i++) {
				if (_base.graph.node(nodeIds[i]).nodeType == 'start') {
					msg = CONFIG.msg.repeatStartNode;
					return msg;
				}
			}
		}
		return msg;
	},
	// 根据画布中的节点获取canvas的尺寸
	getCanvasSizeByNode: function() {
		let _base = FLOW._base;
		let nodeArr = _base.graph.nodes();
		let firstNodeTop = _base.graph.node(nodeArr[0]).locTop;
		let firstNodeLeft = _base.graph.node(nodeArr[0]).locLeft;
		let maxTop = firstNodeTop;
		let minTop = firstNodeTop;
		let maxLeft = firstNodeLeft;
		let minLeft = firstNodeLeft;
		
		for (let i = 0, len = nodeArr.length; i < len; i++) {
			let t = _base.graph.node(nodeArr[i]).locTop;
			let l = _base.graph.node(nodeArr[i]).locLeft;
			
			if (t > maxTop) {
				maxTop = t;
			}
			if (t < minTop) {
				minTop = t;
			}
			if (l > maxLeft) {
				maxLeft = l;
			}
			if (l < minLeft) {
				minLeft = l;
			}
		}
		
		return {
			canvasTop: maxTop + minTop,
			canvasLeft: maxLeft + minLeft
		};
	},
	// 根据id移除节点以及关于节点的所有连线、端点，返回删除的路由线id数组
	removeNodeAndEdgesById: function(id) {
		let _base = FLOW._base;
		let deleteRouterIdArr = [];
		
		$.each(_base.graph.nodeEdges(id), function() {
			let v = $(this)[0].v;
			let w = $(this)[0].w;
			let e = _base.graph.edge(v, w);
			deleteRouterIdArr.push(e.id);
			if (e.sourceEndPointId != undefined) {
				_base.plumb.deleteEndpoint(e.sourceEndPointId);
				_base.plumb.deleteEndpoint(e.targetEndPointId);
			}
			_base.graph.removeEdge($(this)[0].v, $(this)[0].w);
		});
		_base.graph.removeNode(id);
		_base.plumb.remove(id);
		return deleteRouterIdArr;
	},
	// 更新泳道对象
	updateLaneObjs: function(id) {
		let _base = FLOW._base;
		let $this = $(ZFSN.getJQSel(id));
		let laneObj = _base.laneObjs[ZFSN.removeJQSel(id)];
		
		laneObj.locTop = $this.offset().top;
		laneObj.locLeft = $this.offset().left;
		laneObj.nodeHeight = $this.css('height');
		laneObj.nodeWidth = $this.css('width');
		laneObj.bgColor = $this.attr('bgColor-gradient');
	}
}
