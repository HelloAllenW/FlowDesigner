// 属性、样式设置工具类
var attrCfgUtil = {
	// 设置流程属性
	setCanvasAttr: function() {
		$('#attrForm').my('remove');
		var fd = FLOW._base.flowId;
		var d = { flowId: fd };
		var manifest = {
			data: { flowId: '' },
			init: function ($node, runtime) {
				$node.html(
			    	'<div class="layui-form-item">' + 
						'<label class="layui-form-label">流程ID：</label>' + 
						'<div class="layui-input-block">' + 
							'<input id="flowId" type="text" name="title" lay-verify="title" autocomplete="off" class="layui-input">' + 
						'</div>' + 
					'</div>'
				);
			},
			ui: {
				'#flowId': {
					bind: function(data, value, $control) {
						var t = data.flowId;
						if (value != undefined) {
							t = value;
							FLOW._base.flowId = t;
						}
						return t;
					}
				}
			}
		};
		$('#attrForm').my( manifest, d );
	},
	// 设置节点属性、样式
	setNodeAttr: function(nodeId) {
		$('#attrForm').my('remove');
		var d = { textId: $('#' + nodeId).children(':first-child').text() };
		var manifest = {
			data: { textId: '' },
			init: function ($node, runtime) {
				$node.html(
			    	'<div class="layui-form-item">' + 
						'<label class="layui-form-label">名称：</label>' + 
						'<div class="layui-input-block">' + 
							'<input id="textId" type="text" name="title" lay-verify="title" autocomplete="off" placeholder="请输入文本信息" class="layui-input">' + 
						'</div>' + 
					'</div>'
				);
			},
			ui: {
				'#textId': {
					bind: function(data, value, $control) {
						var t = data.textId;
						if (value != undefined) {
							t = value;
							FLOW._base.graph.node(nodeId).text = t;
							$('#' + nodeId).children(':first-child').text(t);
						}
						return t;
					}
				}
			}
		};
		$('#attrForm').my( manifest, d );
	},
	// 设置连接线属性、样式
	setConnAttr: function(sourceId, targetId) {
		$('#attrForm').my('remove');
		var d = { connTextId: plumbUtil.getRouterLabel(sourceId, targetId)};
		var manifest = {
			data: { connTextId: '' },
			init: function ($node, runtime) {
				$node.html(
			    	'<div class="layui-form-item">' + 
						'<label class="layui-form-label">连线名称：</label>' + 
						'<div class="layui-input-block">' + 
							'<input id="connTextId" type="text" name="title" lay-verify="title" autocomplete="off" class="layui-input">' + 
						'</div>' + 
					'</div>'
				);
			},
			ui: {
				'#connTextId': {
					bind: function(data, value, $control) {
						var t = data.connTextId;
						if (value != undefined) {
							t = value;
							// 修改保存状态为未保存，将当前流程对象放入可撤销数组中
							$("#saveStatus").css('display', '');
							FLOW._base.undoStack.push(FLOW.getCurrentFlow());
							
							// 设置新文本
							plumbUtil.setRouterLabel(sourceId, targetId, t);
						}
						return t;
					}
				}
			}
		};
		$('#attrForm').my( manifest, d );
	},
	// 设置泳道属性、样式
	setLaneAttr: function(laneId, c) {
		$('#attrForm').my('remove');
		var laneObj = FLOW._base.laneObjs[laneId];
		var d = { laneNameId: laneObj.text };
		var manifest = {
			data: { laneNameId: '' },
			init: function ($node, runtime) {
				$node.html(
			    	'<div class="layui-form-item">' + 
						'<label class="layui-form-label">泳道名称：</label>' + 
						'<div class="layui-input-block">' + 
							'<input id="laneNameId" type="text" name="title" lay-verify="title" autocomplete="off" class="layui-input">' + 
						'</div>' + 
					'</div>'
				);
			},
			ui: {
				'#laneNameId': {
					bind: function(data, value, $control) {
						var t = data.laneNameId;
						if (value != undefined) {
							t = value;
							// 更新泳道对象
							laneObj.text = t;
							
							// 更新节点
							if (laneObj.nodeType == 'broadwiseLane') {
								let tempText = '', textArr = t.split('');
								for (i = 0; i < textArr.length; i++) {
									tempText += '<span style="display: block;">' + textArr[i] + '</span>';
								}
								$('#' + c).html(tempText);
								$('#' + c).css('line-height', ZFSN.getLaneLineHeight(t, $('#' + c).css('height')));
							} else {
								$('#' + c).html('<span>' + t + '</span>');
							}
						}
						return t;
					}
				}
			}
		};
		$('#attrForm').my( manifest, d );
	}
}
