window.FLOW = {
	_info: {
		author: 'openEA',
		version: '2.0'
	},
	_data: {},
	_base: {
		flowId: '', // 流程ID
		px: '', // 鼠标在画布中的横向坐标
		py: '', // 鼠标在画布中的纵向坐标
		allTimer: {}, // 所有的定时器对象
		isClear: true, // 是否清空画布
		nodeIdPool: {}, // 节点id池
		plumb: {}, // jsPlumb实例对象
		graph: new graphlib.Graph(), //图形对象
		selectedNodeList: [], // 被选中的节点列表
		selectedMultipleFlag: false, // 全选标识
		allowMultipleSelectedFlag: false, // 允许多选标识
		isSmallMove: false, // 是否产生微移标识
		undoStack: [], // 撤销栈
		redoStack: [], // 重做栈
		myclipboard: [], //剪贴板
		tempFlow: {}, // 微移临时的流程图对象
		tempFlag: true, // 微移临时的标识
		laneObjs: [], // 泳道数组
	},
	ready: function(f) { f(); },
	// 初始化流程设计器
	init: function() {
		let _info = FLOW._info;
		
		// 1、渲染流程设计器
		FLOW.render();
		
		// 2、初始化节点id池
		idPoolUtil.init();
		
		ZFSN.consoleLog([
			'成功初始化流程设计器!', 
			'当前版本：' + _info.version,
			'Powered by ' + _info.author,
			'码云：http://git.openea.net/component-element/component-element-FlowDesigner'
		]);
	},
	// 加载json数据到流程设计器
	loadJson: function(data) {
		let _base = FLOW._base;
		
		// 节点数组
		let nodeArr = data.nodeDataArray;
		// 连线数组
		let linkArr = data.linkDataArray;
		
		// 1、渲染节点到画布
		for (let i = 0, len = nodeArr.length; i < len; i++) {
			// 根据节点类型获取要渲染的节点对象
			let renderNode = FLOW.getRenderNodeFromType(nodeArr[i].nodeType);
			
			nodeArr[i].cla = renderNode.cla;
			nodeArr[i].icon = renderNode.icon;
			FLOW._createNewNode(nodeArr[i]);
		}
		
		// 2、渲染连线到画布
		for (let i = 0, len = linkArr.length; i < len; i++) {
			// 2.1、连线
			plumbUtil.connectNode(linkArr[i].from, linkArr[i].to, linkArr[i].routerId, linkArr[i].sourceAnchors, linkArr[i].targetAnchors);
			
			// 2.2、添加连线文本
			plumbUtil.setRouterLabel(linkArr[i].from, linkArr[i].to, linkArr[i].label);
		}
	},
	// 创建新节点
	createNewNode: function(nodeType, pos) {
		let _base = FLOW._base;
		
		// 1、创建前的检查
		let msg = graphUtil.checkGraphBeforeCreate(nodeType);
		if (msg != '0') {
			layer.msg(msg, { icon: 5, time: 2000 });
			return;
		}
		
		// 2、修改保存状态为未保存
		$("#saveStatus").css('display', '');
		
		// 3、将当前流程图push到撤销栈
		_base.undoStack.push(FLOW.getCurrentFlow());
		
		// 4、根据节点类型获取要渲染的节点对象
		let renderNode = FLOW.getRenderNodeFromType(nodeType);
		renderNode.locTop = pos.top;
		renderNode.locLeft = pos.left;
		
		// 5、创建节点
		FLOW._createNewNode(renderNode);
		
		// 6、切换为鼠标工具
		FLOW.mouseTool();
		
		return renderNode.id;
	},
	_createNewNode: function(renderNode) {
		let _base = FLOW._base;
		
		// 1、节点类型为泳道时特殊处理
		if (renderNode.nodeType == 'broadwiseLane' || renderNode.nodeType == 'directionLane') {
			FLOW._createLane(renderNode);
			return renderNode.key;
		}
		
		// 2、添加节点到画布
		$("#Container").append('<div id="' + renderNode.key + '" class="' + renderNode.cla + '" onClick="attrCfgUtil.setNodeAttr(\'' + renderNode.key + '\')">' + 
						   	   	   '<span class="nodeTextCla">' + renderNode.text + '</span>' + 
						   	        renderNode.icon + 
						   	   '</div>'
						      );
		
		// 3、设置节点位置
		$(ZFSN.getJQSel(renderNode.key)).offset({ top: renderNode.locTop, left: renderNode.locLeft });
		
		// 4、设置节点的样式
		$(ZFSN.getJQSel(renderNode.key)).css({
			'background': colorUtil.getNodeLinearBgFromHex(renderNode.bgColor),
			'height': renderNode.nodeHeight,
			'width': renderNode.nodeWidth,
			'line-height': renderNode.nodeHeight
		});
		
		// 5、设置节点的属性
		$(ZFSN.getJQSel(renderNode.key)).attr('bgColor-gradient', renderNode.bgColor);
		
		// 6、设置节点的右键菜单
		window.ContextMenu.bind(ZFSN.getJQSel(renderNode.key), nodeMenuJson);
		
		// 7、设置节点可以被移动
		plumbUtil.setNodeDraggable(renderNode.key);
		
		// 8、设置节点是否可以被缩放
		if (CONFIG.defaultConfig.resizableFlag) plumbUtil.nodeResizable(renderNode.key);
		
		// 9、监听节点
		FLOW.registerNodeEvent(renderNode.key);
		
		// 10、将节点添加到图对象
		_base.graph.setNode(renderNode.key, {
			text: renderNode.text,
			key: renderNode.key,
			nodeType: renderNode.nodeType,
			locTop: renderNode.locTop,
			locLeft: renderNode.locLeft,
			nodeHeight: $(ZFSN.getJQSel(renderNode.key)).css('height'),
			nodeWidth: $(ZFSN.getJQSel(renderNode.key)).css('width'),
			bgColor: renderNode.bgColor,
			isSelected: false
		});
		
		return renderNode;
	},
	_createLane: function(renderNode) {
		let _base = FLOW._base;
		
		// 添加到画板中
		let textArr = renderNode.text.split(''), i, tempText = '', a, b, c;
		if (renderNode.nodeType == 'broadwiseLane') {
			for (i = 0; i < textArr.length; i++) {
				tempText += '<span style="display: block;">' + textArr[i] + '</span>';
			}
			a = '50px';
			b = '247px';
		} else {
			tempText = '<span>' + renderNode.text + '</span>';
		}
		c = 'lane-' + ZFSN.getUUID();
		$("#Container").append('<div id="' + renderNode.key + '" class="' + renderNode.cla + '">' + 
									'<div id="' + c + '" class="laneLabelDivClass" style="width: ' + a + '; height: ' + b + ';">' + 
							    		tempText + 
							       '</div>' + 
							   '</div>'
		);
		
		// canvasId的相对位置
		let canvasX = $('#canvasId').offset().left;
		let canvasY = $('#canvasId').offset().top;
		
		// 设置节点位置
		let t = renderNode.nodeType == 'broadwiseLane' ? renderNode.locTop : canvasY;
		let l = renderNode.nodeType == 'broadwiseLane' ? canvasX : renderNode.locLeft;
		$(ZFSN.getJQSel(renderNode.key)).offset( { top: t, left: l } );
		
		// 设置节点的属性
		$(ZFSN.getJQSel(renderNode.key)).attr('bgColor-gradient', renderNode.bgColor);
		
		// 设置节点的样式
		if (renderNode.nodeType == 'broadwiseLane') {
			$(ZFSN.getJQSel(renderNode.key)).css({
				'line-height': ZFSN.getLaneLineHeight(renderNode.text, $(ZFSN.getJQSel(renderNode.key)).css('height'))
			});
		}
		
		// 设置右键菜单
		window.ContextMenu.bind(ZFSN.getJQSel(c), laneMenuJson);
		
		// 设置节点可拖拽
		$(ZFSN.getJQSel(renderNode.key)).draggable({
			containment: '#Container',
			handle: '.laneLabelDivClass',
			axis: renderNode.nodeType == 'broadwiseLane' ? 'y' : 'x',
			// 拖拽结束后更新图对象中存储的泳道位置
			stop: function(event) {
				// 更新泳道对象
				graphUtil.updateLaneObjs(event.target.id);
			}
		});
		
		// 设置泳道可被缩放
		plumbUtil.laneResizable(renderNode.key);
		
		/**
		 * 阻止事件的传播行为，防止点击节点时触发父节点绑定的click事件，以及在拖动泳道时会出现多选框
		 */
		$(ZFSN.getJQSel(c)).click(function(event) {
			event = document.all ? window.event : arguments[0] ? arguments[0] : event;
			event.stopPropagation();
			attrCfgUtil.setLaneAttr(renderNode.key, c);
		}).mousemove(function(event) {
			_base.px = '';
			_base.py = '';
		});
		$(ZFSN.getJQSel(renderNode.key)).click(function(event) {
			event = document.all ? window.event : arguments[0] ? arguments[0] : event;
			event.stopPropagation();
		}).mousemove(function(event) {
			_base.px = '';
			_base.py = '';
		});
		
		// 将泳道节点添加到泳道对象中
		let laneObj = {
			text: renderNode.text,
			key: renderNode.key,
			nodeType: renderNode.nodeType,
			locTop: renderNode.locTop,
			locLeft: renderNode.locLeft,
			nodeHeight: $(ZFSN.getJQSel(renderNode.key)).css('height'),
			nodeWidth: $(ZFSN.getJQSel(renderNode.key)).css('width'),
			bgColor: renderNode.bgColor
		};
		_base.laneObjs[renderNode.key] = laneObj;
	},
	// 根据节点类型获取要渲染的节点对象
	getRenderNodeFromType: function(type) {
		let renderNode;
		
		switch(type) {
			case 'start':
				renderNode = new graphUtil.Node(
					idPoolUtil.getNextNodeId('E'),
					'startNode moveLight',
					'start',
					'开始',
					'#78dc6b',
					'',
					'60px',
					'60px'
				);
				break;
			case 'end':
				renderNode = new graphUtil.Node(
					idPoolUtil.getNextNodeId('E'),
					'endNode moveLight',
					'end',
					'结束',
					'#dc6b6b',
					'',
					'60px',
					'60px'
				);
				break;
			case 'comm':
				renderNode = new graphUtil.Node(
					idPoolUtil.getNextNodeId('T'),
					'commNode moveLight',
					'comm',
					'人工活动',
					'#6babdc',
					'<i class="layui-icon layui-icon-username" style="font-size: 15px; color: #666666; position: absolute; right: 78px; margin-top: -15px;"></i>',
					'60px',
					'100px'
				);
				break;
			case 'freedom':
				renderNode = new graphUtil.Node(
					idPoolUtil.getNextNodeId('T'),
					'freedomNode moveLight',
					'freedom',
					'自由活动',
					'#6babdc',
					'<i class="layui-icon layui-icon-set-sm" style="font-size: 15px; color: #666666; position: absolute; right: 78px; margin-top: -15px;"></i>',
					'60px',
					'100px'
				);
				break;
			case 'gateWay':
				renderNode = new graphUtil.Node(
					idPoolUtil.getNextNodeId('G'),
					'gateWayNode moveLight',
					'gateWay',
					'网关',
					'#6babdc',
					'',
					'40px',
					'40px'
				);
				break;
			case 'event':
				renderNode = new graphUtil.Node(
					idPoolUtil.getNextNodeId('E'),
					'eventNode moveLight',
					'event',
					'事件',
					'#6babdc',
					'',
					'60px',
					'60px'
				);
				break;
			case 'innerChildFlow':
				renderNode = new graphUtil.Node(
					idPoolUtil.getNextNodeId('S'),
					'innerChildFlowNode moveLight',
					'innerChildFlow',
					'内部子流程',
					'#edef31',
					'',
					'60px',
					'100px'
				);
				break;
			case 'outerChildFlow':
				renderNode = new graphUtil.Node(
					idPoolUtil.getNextNodeId('S'),
					'outerChildFlowNode moveLight',
					'outerChildFlow',
					'外部子流程',
					'#edef31',
					'',
					'60px',
					'100px'
				);
				break;
			case 'broadwiseLane':
				renderNode = new graphUtil.Node(
					idPoolUtil.getNextNodeId('L'),
					'broadwiseLaneNodeOnContainer laneNode',
					'broadwiseLane',
					'横向泳道',
					'#edef31',
					'',
					'60px',
					'100px'
				);
				break;
			case 'directionLane':
				renderNode = new graphUtil.Node(
					idPoolUtil.getNextNodeId('L'),
					'directionLaneNodeOnContainer laneNode',
					'directionLane',
					'纵向泳道',
					'#edef31',
					'',
					'60px',
					'100px'
				);
				break;
			default:
				layer.msg(CONFIG.msg.chooseNodeObjErr, { icon: 5 });
				return;
		}
		return renderNode;
	},
	// 监听节点
	registerNodeEvent: function(tempId) {
		let selector = strUtil.isBlank(tempId) ? '.moveLight' : ZFSN.getJQSel(tempId);
		let $this = FLOW;
		let _base = $this._base;
		
		/**
		 * 当鼠标移动到节点上时将发光属性保存到临时的属性temp-box-shadow中
		 * 然后改变节点的发光样式，显示可拖拽区域
		 * 
		 * 当鼠标移出节点时将节点的发光样式还原为临时保存的属性temp-box-shadow，隐藏可拖拽区域
		 */
		$(selector).mouseover(function() {
			// 当节点选中标识为false，也就是未被选中时
			if (!_base.graph.node($(this).attr('id')).isSelected) {
				$(this).css('box-shadow', CONFIG.defaultStyle.selectedBoxShadow);
			}
		}).mouseout(function() {
			// 当节点选中标识为false，也就是未被选中时
			if (!_base.graph.node($(this).attr('id')).isSelected) {
				$(this).css('box-shadow', CONFIG.defaultStyle.noSelectedBoxShadow);
			}
			layer.close(layer.tips());
		});
		
		/**
		 * 单击选中事件
		 */
		$(selector).mousedown(function(event) {
			// 兼容浏览器写法
			event = document.all ? window.event : arguments[0] ? arguments[0] : event;
			
			// 当鼠标按钮不为左键时终止函数的执行，0是左键，1是滚轮键，2是右键
			// if (event.button != 0) return;
			
			$(this).css('box-shadow', '0 0 35px green');
			
			// 当没有多选时将其他被选中的节点改为未选中
			if (!_base.selectedMultipleFlag) {
				$this.changeToNoSelected($(this).attr('id'));
			}
		}).mouseup(function(event) {
			// 显示节点全名
			if (!_base.selectedMultipleFlag && !_base.allowMultipleSelectedFlag) {
				layer.tips(_base.graph.node($(this).attr('id')).text, ZFSN.getJQSel($(this).attr('id')), {
					tips: [3, '#23262e'],
					time: 2000
				});
			}
			
			// 兼容浏览器写法
			var event = document.all ? window.event : arguments[0] ? arguments[0] : event;
			
			// 当鼠标按钮不为左键时终止函数的执行，0是左键，1是滚轮键，2是右键
			// if (event.button != 0) return;
			
			$(this).css('box-shadow', CONFIG.defaultStyle.selectedBoxShadow);
			$this.clearAllTimer();
			
			// 当允许多选时
			if (_base.allowMultipleSelectedFlag) {
				FLOW.selectedNode($(this).attr('id'));
			}
			
			// 当没有多选时
			if (!_base.selectedMultipleFlag) {
				_base.selectedNodeList[0] = $(this).attr('id');
				_base.plumb.addToDragSelection($(this).attr('id'));
				_base.graph.node($(this).attr('id')).isSelected = true;
			}
		});
		
		/**
		 * 阻止事件的传播行为，防止点击节点时触发父节点绑定的click事件
		 */
		$(selector).click(function(event) {
			event = document.all ? window.event : arguments[0] ? arguments[0] : event;
			event.stopPropagation();
		});
	},
	// 保存流程图
	save: function() {
		// 1、检查流程图合法性
		let checkMsg = graphUtil.checkGraph();
		if (checkMsg != '0') {
			layer.msg(checkMsg, { icon: 2 });
			return;
		}
		
		// 2、获取当前流程图对象
		let obj = FLOW.getCurrentFlow();
		
		// 将流程图对象json数据持久化到数据库中
		// var res = saveObj(obj);
		
		// 3、保存状态为已保存
		$("#saveStatus").css('display', 'none');
		
		// 4、提示保存成功
		layer.msg(CONFIG.msg.saveSuccess, {
			icon: 1,
			time: 1000
		});
	},
	// 保存为图片
	save2Photo: function() {
		// 1、检查当前流程图是否可以保存为图片
		let checkMsg = graphUtil.checkGraphBySave2Photo();
		if (checkMsg != '0') {
			layer.msg(checkMsg, { icon: 2 });
			return;
		}
		
		// 2、计算生成图片的尺寸
		let positionObj = graphUtil.getCanvasSizeByNode();
		
		// 3、处理svg标签，这里只做对连接线的转换，端点暂不考虑
	    let removeArr = [];
	    let svgElem = $("#canvasId").find('svg[id]');
	    let i;
	    svgElem.each(function(index, node) {
	    	// 3.1、创建canvas标签，设置标签id并将id放入移除数组中，便于生成图片后移除canvas
	    	let canvas = document.createElement('canvas');
	    	let canvasId = 'canvas-' + ZFSN.getUUID();
	    	canvas.id = canvasId;
	    	removeArr.push(canvasId);
	    	
	    	// 3.2、svg标签内容
	    	let svg = node.outerHTML.trim();
	    	
	    	// 3.3、转换为canvas
	    	canvg(canvas, svg);
	    	
	    	// 3.4、设置位置
	    	if (node.style.position) {
	            canvas.style.position += node.style.position;
	            canvas.style.left += node.style.left;
	            canvas.style.top += node.style.top;
	        }
	    	$('#Container').append(canvas);
	    });
		
		// 4、将流程图转换为canvas，然后再转成base64编码
		html2canvas(document.getElementById('Container'), {
			width: positionObj.canvasLeft,
			height: positionObj.canvasTop,
			// 关闭日志
			logging: false
		}).then(function(canvas) {
			// 将canvas转成base64编码，然后再转成图片url
			let imgUri = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
			// 下载图片
			let alink = document.createElement('a');
			let alinkId = 'alink-' + ZFSN.getUUID();
			removeArr.push(alinkId);
			alink.id = alinkId;
			alink.href = imgUri;
			alink.download = '流程设计图_' + ZFSN.getUUID() + '.jpg';
			alink.click();
		});
		
		// 5、移除生成的canvas、alink，这里采用异步的方式是因为生成图片需要时间，若在生成图片时执行了清除代码则svg内容不会被转成图片
		setTimeout(function() {
			for (i = 0; i < removeArr.length; i++) {
				$(ZFSN.getJQSel(removeArr[i])).remove();
			}
		}, 1000);
	},
	// 获取当前的流程图对象
	getCurrentFlow: function() {
		let _base = FLOW._base;
		let flowDoc = {};
		let nodeDataArray = [];
		// 当前滚动条位置
		let scrollX = $('#canvasId').scrollLeft();
		let scrollY = $('#canvasId').scrollTop();
		
		// 节点
		$.each($('#Container').children('.moveLight'), function(index) {
			let tempObj = {};
			tempObj.text = _base.graph.node($(this).attr('id')).text;
			tempObj.key = $(this).attr('id');
			tempObj.nodeType = _base.graph.node($(this).attr('id')).nodeType;
			tempObj.locTop = $(this).offset().top + scrollY;
			tempObj.locLeft = $(this).offset().left + scrollX;
			tempObj.nodeHeight = $(this).css('height');
			tempObj.nodeWidth = $(this).css('width');
			tempObj.bgColor = $(this).attr('bgColor-gradient');
			nodeDataArray.push(tempObj);
		});
		
		// 泳道
		$.each($('#Container').children('.laneNode'), function(index) {
			let tempObj = {};
			tempObj.text = _base.laneObjs[$(this).attr('id')].text;
			tempObj.key = $(this).attr('id');
			tempObj.nodeType = _base.laneObjs[$(this).attr('id')].nodeType;
			tempObj.locTop = $(this).offset().top + scrollY;
			tempObj.locLeft = $(this).offset().left + scrollX;
			tempObj.nodeHeight = $(this).css('height');
			tempObj.nodeWidth = $(this).css('width');
			tempObj.bgColor = $(this).attr('bgColor-gradient');
			nodeDataArray.push(tempObj);
		});
		flowDoc.nodeDataArray = nodeDataArray;
		
		//连线
		let linkDataArray = [];
		$.each(_base.plumb.getAllConnections(), function() {
			let tempObj = {};
			tempObj.from = $(this)[0].sourceId;
			tempObj.to = $(this)[0].targetId;
			tempObj.routerId = _base.graph.edge($(this)[0].sourceId, $(this)[0].targetId).id;
			tempObj.label = plumbUtil.getRouterLabel($(this)[0].sourceId, $(this)[0].targetId);
			tempObj.sourceAnchors = _base.graph.edge($(this)[0].sourceId, $(this)[0].targetId).sourceAnchors;
			tempObj.targetAnchors = _base.graph.edge($(this)[0].sourceId, $(this)[0].targetId).targetAnchors;
			linkDataArray.push(tempObj);
		});
		flowDoc.linkDataArray = linkDataArray;
		
		//console.log(JSON.stringify(flowDoc));
		return flowDoc;
	},
	// 清除所有的定时器
	clearAllTimer: function() {
		let _base = FLOW._base;
		let allTimer = _base.allTimer;
		
		// 1、点击画布时清除所有的定时器
		for(let timerName in allTimer) {
			clearTimeout(allTimer[timerName]);
		}
	
		_base.allTimer = {};
	
		// 2、移除所有连接的 connectionAnimateClass 样式
		$.each(_base.plumb.getAllConnections('*'), function() {
			$(this)[0].removeClass('connectionAnimateClass');
		});
	},
	// 清除画布，重新绘制
	clearCanvas: function() {
		let _base = FLOW._base;
		
		layer.confirm(CONFIG.msg.clearConfirm, { icon: 7, title: '提示' }, function(index) {
			// 1、保存状态为未保存
			$("#saveStatus").css('display', '');
			// 2、将当前流程对象放入可撤销数组中
			_base.undoStack.push(FLOW.getCurrentFlow());
			
			FLOW.removeAll();
			layer.close(index);
		});
	},
	// 选中节点
	selectedNode: function(id) {
		let _base = FLOW._base;
		
		// 1、清除所有的定时器
		FLOW.clearAllTimer();
		
		if (_base.selectedNodeList.indexOf(id) == -1) {
			// 将节点的样式改为选中的样式
			$(ZFSN.getJQSel(id)).css('box-shadow', CONFIG.defaultStyle.selectedBoxShadow);
			// 将节点选中状态改为选中
			_base.graph.node(id).isSelected = true;
			// 添加到实例对象被选中列表中
			_base.plumb.addToDragSelection(id);
			// 添加到被选中节点列表中
			_base.selectedNodeList.push(id);
		}
		
		// 3、多选标识改为true
		_base.selectedMultipleFlag = true;
	},
	// 取消选中节点
	noSelectedNode: function(id) {
		let _base = FLOW._base;
		
		if (_base.selectedNodeList.indexOf(id) != -1) {
			// 将节点的样式改为非选中的样式
			$(ZFSN.getJQSel(id)).css('box-shadow', CONFIG.defaultStyle.noSelectedBoxShadow);
			// 将节点选中状态改为选中
			_base.graph.node(id).isSelected = false;
			// 从INSTANCE_JSPLUMB被选中列表中移除
			_base.plumb.removeFromDragSelection(id);
			// 从被选中节点列表中移除
			//deleteDataFromArr(SELECTED_NODE_LIST, id);
			_base.selectedNodeList.deleteOne(id);
		}
	},
	// 除了 id 之外的节点，将节点变为非选中状态，若不传id则表示将所有的节点变为非选中状态
	changeToNoSelected: function(id) {
		let selector;
		let _base = FLOW._base;
		
		// 清除所有jsplumb中的拖拽列表
		_base.plumb.clearDragSelection();
		
		// 清空被选中节点列表
		_base.selectedNodeList = [];
		
		if (id == undefined) {
			selector = '.moveLight';
		} else {
			selector = '.moveLight:not(#' + id + ')';
		}
		
		// 将节点变为非选中状态
		$.each($(selector), function() {
			$(this).css('box-shadow', CONFIG.defaultStyle.noSelectedBoxShadow);
			_base.graph.node($(this).attr('id')).isSelected = false;
		});
	},
	// 切换为鼠标工具
	mouseTool: function() {
		
		let _base = FLOW._base;
		
		// 切换显示
		$('#connectionToolsBtn').css('color', '#444444');
		$('#mouseToolsBtn').css('color', 'blue');
		
		// 修改鼠标样式
		$('#Container').css('cursor', 'default');
		
		// 鼠标工具可以使用多选框
		let $events = $._data($('#Container')[0], 'events');
		if (!$events || !$events['mousedown']) {
			$('#Container').bind('mousedown', function(event) {
				//在画布中按下鼠标获取鼠标位置
				_base.px = event.pageX;
				_base.py = event.pageY;
				_base.isClear = true;
			});
		}
		
		// 鼠标工具可以移动画布中的节点
		let nodeArr = _base.graph.nodes();
		$.each(nodeArr, function(index) {
			plumbUtil.ableDraggable(nodeArr[index]);
			// 修改鼠标样式
			$('#' + nodeArr[index]).css('cursor', 'move');
			_base.plumb.unmakeSource(nodeArr[index]);
			_base.plumb.unmakeTarget(nodeArr[index]);
		});
	},
	// 切换为连线工具
	connectionTool: function() {
		// 切换显示
		$('#mouseToolsBtn').css('color', '#444444');
		$('#connectionToolsBtn').css('color', 'blue');
		
		// 修改鼠标样式
		$('#Container').css('cursor', 'crosshair');
		
		// 连线工具无法使用多选框
		let $events = $._data($('#Container')[0], 'events');
		if ($events && $events['mousedown']) {
			$('#Container').unbind('mousedown');
		}
		
		// 连线工具可以连接画布中的节点
		let _base = FLOW._base;
		let nodeArr = _base.graph.nodes();
		$.each(nodeArr, function(index) {
			plumbUtil.unableDraggable(nodeArr[index]);
			//修改鼠标样式
			$('#' + nodeArr[index]).css('cursor', 'crosshair');
			_base.plumb.makeSource(nodeArr[index], {
	            filter: "a",
	            filterExclude: true,
	            maxConnections: -1,
	            endpoint: [ "Dot", { radius: 7 } ],
	            anchor: CONFIG.anchors.defaultAnchors
	        });
	        _base.plumb.makeTarget(nodeArr[index], {
	            filter: "a",
	            filterExclude: true,
	            maxConnections: -1,
	            endpoint: [ "Dot", { radius: 7 } ],
	            anchor: CONFIG.anchors.defaultAnchors
	        });
		});
	},
	// 移除实例中所有节点、端点、连线，清空画布，重置节点id对象、JsPlumb实例对象、图对象
	removeAll: function() {
		let _base = FLOW._base;
		
		// 1、移除实例中所有节点、端点、连线等，用JsPlumb提供的remove方法即可
		let nodeIds = _base.graph.nodes();
		for (let i = 0, len = nodeIds.length; i < len; i++) {
			_base.plumb.remove(nodeIds[i]);
		}
		
		// 2、清空画布
		$("#Container").empty();
		
		// 3、重置节点id对象
		idPoolUtil.init();
		
		// 4、重置图对象
		_base.graph = new graphlib.Graph();
	},
	// 显示/隐藏网格
	changeGrid: function() {
		if ($("#canvasId").css('background-image') == 'none') {
			// 更换中间绘制区域的背景图
			$("#canvasId").css('background-image', 'url(../images/grid.jpeg)');
			// 修改 eye 图标
			$("#showGridId").children(':first-child').attr('class', 'fa fa-eye fa-2x iconClass showItemTxt');
			// 修改span中的提示内容
			$("#showGridId").children(':last-child').text('隐藏网格');
		} else {
			$("#canvasId").css('background', 'none');
			$("#canvasId").css('background-color', '#f8f8f8');
			$("#showGridId").children(':first-child').attr('class', 'fa fa-eye-slash fa-2x iconClass showItemTxt');
			$("#showGridId").children(':last-child').text('显示网格');
		}
		// 点击后提示tips
		layer.tips($('#showGridId').children(':last-child').text(), '#showGridId', {
			tips: [3, '#23262e'],
			time: 2000
		});
	},
	// 撤销
	undo: function() {
		let _base = FLOW._base;
		
		if (_base.undoStack.length > 0) {
			// 1、修改保存状态为未保存
			$("#saveStatus").css('display', '');
			
			// 2、将当前流程图push到重做栈
			_base.redoStack.push(FLOW.getCurrentFlow());
			
			// 3、加载撤销栈中的流程图前需要清除和初始化各元素
			FLOW.removeAll();
			
			// 4、弹出撤销栈中的流程图并加载
			FLOW.loadJson(_base.undoStack.pop());
		}
	},
	// 重做
	redo: function() {
		let _base = FLOW._base;
		
		if (_base.redoStack.length > 0) {
			// 1、保存状态为未保存
			$("#saveStatus").css('display', '');
			
			// 2、将当前流程图push到撤销栈
			_base.undoStack.push(FLOW.getCurrentFlow());
			
			// 3、加载撤销栈中的流程图前需要清除和初始化各元素
			FLOW.removeAll();
			
			// 4、弹出重做栈中的流程图并加载
			FLOW.loadJson(_base.redoStack.pop());
		}
	},
	// 退出流程设计器
	exit: function() {
		let saveStatus = $('#saveStatus').css('display');
		if (saveStatus == 'block') {
			layer.confirm(CONFIG.msg.closeFrame, { icon: 7, title: '提示' }, function(index) {
				layer.close(index);
				parent.window.close();
			});
		} else {
			parent.window.close();
		}
	},
	// 全选
	selectedAll: function() {
		let _base = FLOW._base;
		
		$.each($('.moveLight'), function(index) {
			// 1、将所有节点的样式改为选中的样式
			$(this).css('box-shadow', CONFIG.defaultStyle.selectedBoxShadow);
			// 2、清除所有的定时器
			FLOW.clearAllTimer();
			// 3、将所有的节点选中状态改为选中
			_base.graph.node($(this).attr('id')).isSelected = true;
			// 4、添加到实例对象被选中列表中
			_base.plumb.addToDragSelection($(this).attr('id'));
			// 5、多选标识改为true
			_base.selectedMultipleFlag = true;
		});
		
		// 添加到被选中节点列表中，全选采用的是图对象中的被选中的节点 id 列表
		_base.selectedNodeList = _base.selectedNodeList.concat(graphUtil.getSelectedNodeIds());
	},
	// 删除连线
	deleteConnection: function(connId) {
		let _base = FLOW._base;
		
		layer.confirm(CONFIG.msg.deleteConn, { icon: 7, title: '提示' }, function(index) {
			// 1、修改保存状态为未保存
			$("#saveStatus").css('display', '');
			
			// 2、将当前流程对象放入可撤销数组中
			_base.undoStack.push(FLOW.getCurrentFlow());
			
			// 3、清除定时器，这里清除定时器的目的是防止显示后继路径动画时删除动画的连接会报错
			FLOW.clearAllTimer();
			
			// 4、移除端点以及线段
			let sourceId = $(connId).attr('sourceId');
			let targetId = $(connId).attr('targetId');
			let e = _base.graph.edge(sourceId, targetId);
			if (e.sourceEndPointId != undefined) {
				// 4.1、移除端点
				_base.plumb.deleteEndpoint(e.sourceEndPointId);
				_base.plumb.deleteEndpoint(e.targetEndPointId);
				// 4.2、移除线段
				_base.plumb.deleteConnection(_base.plumb.getConnections({
					source: sourceId,
					target: targetId
				})[0]);
			}
			
			// 5、移除图对象中的线段
			_base.graph.removeEdge(sourceId, targetId);
			
			// 6、从id池中移除该连线id
			idPoolUtil.removeNodeId(ZFSN.removeJQSel(connId));
			
			// 7、关闭提示窗口
			layer.close(index);
		});
	},
	// 复制
	copyNode: function(tempId) {
		let _base = FLOW._base;
		
		// 1、清空剪贴板
		_base.myclipboard.length = 0;
		
		// 2、获取选中的节点id数组
		let selectedNodeIdArr = graphUtil.getSelectedNodeIds();
		
		// 3、将选中的节点push到剪贴板
		for (let i = 0, len = selectedNodeIdArr.length; i < len; i++) {
			// 开始节点无法被复制
			if (_base.graph.node(selectedNodeIdArr[i]).nodeType != 'start') {
				_base.myclipboard.push(selectedNodeIdArr[i]);
			}
		}
	},
	// 粘贴
	pasteNode: function() {
		let _base = FLOW._base;
		
		// 0、剪贴板无数据直接return
		if (_base.myclipboard.length <= 0) return;
		
		// 1、修改保存状态为未保存，将当前流程对象放入可撤销数组中
		$("#saveStatus").css('display', '');
		_base.undoStack.push(FLOW.getCurrentFlow());
		
		// 2、获取鼠标位置
		let mousePos = ZFSN.getMousePos(event);
		let top = mousePos.y;
		let left = mousePos.x;
		let tempTop = top;
		let tempLeft = left;
		let copyNodeIdArr = []; // 粘贴生成的新节点的id数组
		
		// 3、粘贴节点
		$.each(_base.myclipboard, function(index) {
			let newNodeId = FLOW.createNewNode(_base.graph.node(_base.myclipboard[index]).nodeType, { 'top': top, 'left': left });
			copyNodeIdArr.push(newNodeId);
			if (index < _base.myclipboard.length - 1) {
				top = tempTop - (_base.graph.node(_base.myclipboard[0]).locTop - _base.graph.node(_base.myclipboard[index + 1]).locTop);
				left = tempLeft - (_base.graph.node(_base.myclipboard[0]).locLeft - _base.graph.node(_base.myclipboard[index + 1]).locLeft);
			}
		});
		
		// 4、粘贴连线
		let i, j;
		for (i = 0; i < _base.myclipboard.length; i++) {
			for (j = i + 1; j < _base.myclipboard.length; j++) {
				if (_base.graph.hasEdge(_base.myclipboard[i], _base.myclipboard[j])) {
					// 4.1、获取粘贴的新路由的id
					let connId = idPoolUtil.getNextNodeId('R');
					
					// 4.2、连线
					plumbUtil.connectNode(copyNodeIdArr[i], copyNodeIdArr[j], connId, CONFIG.anchors.defaultAnchors, CONFIG.anchors.defaultAnchors);
				}
			}
		}
	},
	// 删除节点
	deleteNode: function(tempId) {
		let _base = FLOW._base;
		
		// 1、获取被选中的节点id数组
		let selectedNodeIdArr = graphUtil.getSelectedNodeIds();
		if (selectedNodeIdArr.length == 0) return;
		
		layer.confirm('确定要删除吗？', { icon: 7, title: '提示' }, function(index) {
			// 2、修改保存状态为未保存，将当前流程对象放入可撤销数组中
			$("#saveStatus").css('display', '');
			_base.undoStack.push(FLOW.getCurrentFlow());
			
			// 3、清除剪贴板
			_base.myclipboard.length = 0;
			
			// 4、删除
			for (let i = 0, len = selectedNodeIdArr.length; i < len; i++) {
				// 4.1、删除节点的端点、连线
				graphUtil.removeNodeAndEdgesById(selectedNodeIdArr[i]);
				
				// 4.2、删除id池中的id
				idPoolUtil.removeNodeId(selectedNodeIdArr[i]);
				
				// 4.3、删除节点
				$(ZFSN.getJQSel(selectedNodeIdArr[i])).remove();
			}
			
			// 5、关闭提示窗口
			layer.close(index);
		});
	},
	// 闪烁显示连线路径
	showConnectionRoute: function(id, type) {
		id = ZFSN.removeJQSel(id);
		let _base = FLOW._base;
		let noRouteFlag = true;
		let conns, message;
		
		switch (type) {
			case 'front':
				conns = _base.plumb.getConnections( { target: id } );
				message = CONFIG.msg.noFrontRoute;
				break;
			case 'behind':
				conns = _base.plumb.getConnections( { source: id } );
				message = CONFIG.msg.noBehindRoute;
				break;
		}
		$.each(conns, function() {
			noRouteFlag = false;
			let o = $(this)[0];
			let timerName = ZFSN.getUUID();
			let changeFlag = true;
			_base.allTimer[timerName] = setInterval(function() {
				if (changeFlag) {
					o.addClass('connectionAnimateClass');
					changeFlag = false;
				} else {
					o.removeClass('connectionAnimateClass');
					changeFlag = true;
				}
			}, 400);
		});
		// 当无后继路径时用layer的tips层进行提示
		if (noRouteFlag) {
			layer.tips(message, ZFSN.getJQSel(id), {
				tips: [4, '#23262e']
			});
		}
	},
	// 微移
	smallMove: function(moveType) {
		let _base = FLOW._base;
		let t, l, movePX = CONFIG.defaultConfig.smallMovePX;
		
		// 记录在移动前的流程图
		if (_base.tempFlag) {
			_base.tempFlow = FLOW.getCurrentFlow();
			_base.tempFlag = false;
		}
		
		switch (moveType) {
			case 'up':
				t = -movePX;
				l = 0;
				break;
			case 'down':
				t = movePX;
				l = 0;
				break;
			case 'left':
				t = 0;
				l = -movePX;
				break;
			case 'right':
				t = 0;
				l = movePX;
				break;
		}
		
		// 获取被选中的节点id列表
		let selectedArr = graphUtil.getSelectedNodeIds();
		// 移动每一个被选中的元素
		for (let i = 0, len = selectedArr.length; i < len; i++) {
			let newTop = $(ZFSN.getJQSel(selectedArr[i])).offset().top + t;
			let newLeft = $(ZFSN.getJQSel(selectedArr[i])).offset().left + l;
			$(ZFSN.getJQSel(selectedArr[i])).offset({ top: newTop, left: newLeft });
			
			// 更新图对象
			_base.graph.node(selectedArr[i]).locTop = newTop;
			_base.graph.node(selectedArr[i]).locLeft = newLeft;
			
			// 产生了微移，将微移标识改为true
			_base.isSmallMove = true;
		}
		
		// 重绘
		_base.plumb.repaintEverything();
	},
	// 流程图产生微移后的处理
	smallMoveHandler: function() {
		let _base = FLOW._base;
		
		_base.tempFlag = true;
		
		if (_base.isSmallMove){
			// 修改保存状态为未保存，将当前流程对象放入可撤销数组中
			$("#saveStatus").css('display', '');
			_base.undoStack.push(_base.tempFlow);
			_base.isSmallMove = false;
		}
	},
	// 删除泳道
	deleteLane: function(tempId) {
		let _base = FLOW._base;
		let id = $(ZFSN.getJQSel(tempId)).parent().attr('id');
		
		// 删除泳道对象中的数据
		delete _base.laneObjs[id];
		
		$(ZFSN.getJQSel(id)).remove();
		
		layer.msg(CONFIG.msg.deleteLane, {
			icon: 1,
			time: 1000
		});
	}
}
