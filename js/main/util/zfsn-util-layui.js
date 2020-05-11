var layuiUtil = {
	tempId: '',
	// 关闭子层
	closeFrame: function() {
		// 1、获取窗口索引
	    let index = parent.layer.getFrameIndex(window.name);
	    // 2、关闭弹出的子页面窗口
	    parent.layer.close(index);
	},
	// 帮助文档
	helpDoc: function() {
		let index = layer.open({
			type: 2,
			title: '帮助文档',
			content: '../helpDoc/docs.html',
			area: ['700px', '500px'],
			maxmin: true
		});
		// 打开既全屏
		layer.full(index);
	},
	// 快捷键大全
	shortcutKey: function() {
		layer.open({
			type: 1,
			title: "快捷键手册",
			area: ['950px', '730px'],
			shadeClose: true,
			shift: 2,
			skin: 'layui-layer-rim',
			closeBtn: 2,
			content:'<div class="layui-form">' + 
					 	'<table class="layui-table">' + 
					    	'<colgroup>' + 
							    '<col width="100">' + 
							    '<col width="100">' + 
							    '<col width="300">' + 
					    	'</colgroup>' + 
						    '<thead>' + 
						    	'<tr>' + 
							        '<th>快捷键</th>' + 
							        '<th>名称</th>' + 
							        '<th>作用</th>' + 
						    	'</tr>' + 
						    '</thead>' + 
						    '<tbody>' + 
						    	'<tr>' + 
							        '<td>Delete</td>' + 
							        '<td>删除节点</td>' + 
							        '<td>删除选中的节点，注意节点处于选中状态时才会被删除</td>' + 
						    	'</tr>' + 
						    	'<tr>' + 
							        '<td>Ctrl</td>' + 
							        '<td>多选模式</td>' + 
							        '<td>按住Ctrl键切换为多选模式，点击节点进行多选，松开表示取消多选模式</td>' + 
						    	'</tr>' + 
						    	'<tr>' + 
							        '<td>Ctrl + S</td>' + 
							        '<td>保存流程</td>' + 
							        '<td>保存当前流程图</td>' + 
						    	'</tr>' + 
						    	'<tr>' + 
							        '<td>Ctrl + P</td>' + 
							        '<td>保存为图片</td>' + 
							        '<td>保存当前流程图为图片格式</td>' + 
						    	'</tr>' + 
						    	'<tr>' + 
							        '<td>Ctrl + Z</td>' + 
							        '<td>撤销</td>' + 
							        '<td>回退到上一个步骤</td>' + 
						    	'</tr>' + 
						    	'<tr>' + 
							        '<td>Ctrl + Y</td>' + 
							        '<td>重做</td>' + 
							        '<td>前进到后一个步骤</td>' + 
						    	'</tr>' + 
						    	'<tr>' + 
							        '<td>Ctrl + D</td>' + 
							        '<td>重新绘制</td>' + 
							        '<td>将当前的画板清空</td>' + 
						    	'</tr>' + 
						    	'<tr>' + 
							        '<td>Ctrl + Q</td>' + 
							        '<td>显示/隐藏网格</td>' + 
							        '<td>若显示，则隐藏。若隐藏，则显示</td>' + 
						    	'</tr>' + 
						    	'<tr>' + 
							        '<td>Ctrl + A</td>' + 
							        '<td>全选</td>' + 
							        '<td>全选图中的节点</td>' + 
						    	'</tr>' + 
						    	'<tr>' + 
							        '<td>Ctrl + F</td>' + 
							        '<td>设置</td>' + 
							        '<td>打开设置窗口</td>' + 
						    	'</tr>' + 
						    	'<tr>' + 
							        '<td>Alt + Q</td>' + 
							        '<td>鼠标工具</td>' + 
							        '<td>切换为鼠标工具，可以移动当前画布中的节点</td>' + 
						    	'</tr>' + 
						    	'<tr>' + 
							        '<td>Alt + R</td>' + 
							        '<td>连线工具</td>' + 
							        '<td>切换为连线工具，可以连接当前画布中的节点</td>' + 
						    	'</tr>' + 
						    	'<tr>' + 
							        '<td>↑</td>' + 
							        '<td>上</td>' + 
							        '<td>向上微移选中的节点</td>' + 
						    	'</tr>' + 
						    	'<tr>' + 
							        '<td>↓</td>' + 
							        '<td>下</td>' + 
							        '<td>向下微移选中的节点</td>' + 
						    	'</tr>' + 
						    	'<tr>' + 
							        '<td>←</td>' + 
							        '<td>左</td>' + 
							        '<td>向左微移选中的节点</td>' + 
						    	'</tr>' + 
						    	'<tr>' + 
							        '<td>→</td>' + 
							        '<td>右</td>' + 
							        '<td>向右微移选中的节点</td>' + 
						    	'</tr>' + 
						    '</tbody>' + 
						'</table>' + 
					'</div>'
		});
	},
	// 设置
	setting: function() {
		// 防止用户无限快捷键打开设置窗口
		layer.closeAll();
		
		layer.open({
			type: 2,
			title: "设置",
			area: ['500px', '420px'],
			shadeClose: true,
			shift: 1,
			skin: 'layui-layer-rim',
			closeBtn: 2,
			content: ['Setting.html']
		});
	},
	// 编辑连线属性
	/*connectionAttr: function(connId) {
		layuiUtil.tempId = connId;
		
		layer.open({
			type: 2,
			title: "属性编辑",
			area: ['600px', '400px'],
			shadeClose: true,
			shift: 2,
			skin: 'layui-layer-rim',
			closeBtn: 2,
			content: ['EditRouterAttribute.html']
		});
	},*/
	// 编辑节点属性
	/*editNodeAttribute: function(tempId) {
		layuiUtil.tempId = tempId;
		
		layer.open({
			type: 2,
			title: "属性编辑",
			area: ['950px', '700px'],
			shadeClose: true,
			shift: 2,
			skin: 'layui-layer-rim',
			closeBtn: 2,
			content: ['EditNodeAttribute.html']
		});
	},*/
	// 设置节点样式
	setNodeStyle: function(tempId) {
		layuiUtil.tempId = tempId;
		
		layer.open({
			type: 2,
			title: "节点样式",
			area: ['600px', '400px'],
			shadeClose: true,
			shift: 2,
			skin: 'layui-layer-rim',
			closeBtn: 2,
			content: ['SetNodeStyle.html'],
			end: function() {
				// 更新图对象
				// updateGraphNode(eleId);
			}
		});
	},
	// 编辑泳道属性
	/*laneAttr: function(tempId) {
		layuiUtil.tempId = tempId;
		
		layer.open({
			type: 2,
			title: "泳道属性编辑",
			area: ['950px', '700px'],
			shadeClose: true,
			shift: 2,
			skin: 'layui-layer-rim',
			closeBtn: 2,
			content: ['EditLaneAttribute.html']
		});
	},*/
	// 测试窗口
	test: function() {
		let pwd = prompt('请输入密码：');
		if (pwd == CONFIG.defaultConfig.testPwd) {
			layer.open({
				type: 2,
				title: "测试",
				area: ['950px', '700px'],
				shadeClose: true,
				shift: 2,
				closeBtn: 2,
				content: ['test.html']
			});
		} else if (pwd.trim() != '') {
			layer.alert('密码错误');
		}
	}
}
