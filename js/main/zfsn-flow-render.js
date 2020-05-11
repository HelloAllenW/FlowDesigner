// 渲染流程设计器
FLOW.render = function() {
	
	// 1、加载语言环境
	if(!window.location.href.substring(0, 4) == 'file') {
		ZFSN.loadJsonFromUrl('/FlowDesigner/json/lang/' + CONFIG.defaultConfig.language + '.json', 'GET', function(err, text) {
			if (!err) {
				let data = JSON.parse(text);
				CONFIG.msg = data;
			}
		});
	}
	
	// 2、JsPlumb初始化
	jsPlumb.ready(function() {
		// 2.1、监听流程设计器
		FLOW.registerBaseEvent();
		
		// 2.2、实例化jsPlumb
		plumbUtil.getInstance();
		
		// 2.3、选择初始工具：鼠标工具
		FLOW.mouseTool();
		
		// 2.4、随机生成流程id
		FLOW._base.flowId = ZFSN.getUUID();
		attrCfgUtil.setCanvasAttr();
	});
};

// 注册流程设计器监听
FLOW.registerBaseEvent = function() {
	
	let _base = FLOW._base;
	
	// 监听画布右键
	window.ContextMenu.bind("#canvasId", canvasMenuJson);
	
	// 监听节点的拖拽
	$(".controler").draggable({
		//透明度
		opacity: CONFIG.defaultStyle.dragOpacity,
		//拖拽模式为克隆
		helper: 'clone',
		//标识
		scope: 'node',
		//设置拖拽时鼠标位于节点中心
		cursorAt: {
			top: 27,
			left: 94
		},
		//拖拽未放置到指定区域时动画还原到原位置
		revert: 'invalid',
		//对齐到网格
		//grid: [10, 10]
		start: function(event, ui) {
			event.target.style.fontWeight = 'bolder';
		},
		stop: function(event, ui) {
			event.target.style.fontWeight = 'normal';
		}
	});
	
	// 监听左侧节点颜色变化
	$(".controler").mouseover(function() {
		$(this).css('background-color', '#e2d8d8');
	}).mouseout(function() {
		$(this).css('background-color', '#eee');
	});
	
	// 监听节点的放置
	$("#Container").droppable({
		//标识
		scope: 'node',
		//放置触发函数
		drop: function(event, ui) {
			FLOW.createNewNode(ui.draggable.context.firstElementChild.id, ui.offset);
		}
	});
	
	// 监听画布的点击、画多选框
	$('#Container').click(function(event) {
		FLOW.clearAllTimer();
		if (_base.isClear) {
			FLOW.changeToNoSelected();
			// 全选标识改为 false
			_base.selectedMultipleFlag = false;
		}
		attrCfgUtil.setCanvasAttr();
	}).mousemove(function(event) {
		// 未按下鼠标时结束方法
		if (_base.px == '' || _base.py == '') {
			return;
		}
		
		// 移动一次获取一次矩形宽高
		let pxx = event.pageX;
		let pyy = event.pageY;
		let h = pyy - _base.py;
		let w = pxx - _base.px;
		// canvasId的相对位置
		let canvasX = $('#canvasId').offset().left;
		let canvasY = $('#canvasId').offset().top;
		
		// 滚动条的位置
		let scrollX = $('#canvasId').scrollLeft();
		let scrollY = $('#canvasId').scrollTop();
		
		// 创建矩形div，只创建一次
		if ($('#multipleSelectedRectangle').attr('id') == undefined) {
			$('#Container').append('<div id="multipleSelectedRectangle" style="background-color:#31676f;"></div>');
		}
		
		// 画出矩形
		if (h < 0 && w >= 0) {
            $("#multipleSelectedRectangle").css({ "height": (-h) + "px", "width": w + "px", "position": "absolute", "left": _base.px - canvasX + scrollX + "px", "top": pyy - canvasY + scrollY + "px", "opacity": "0.2", "border": "1px dashed #000" });
        }
        else if (h >= 0 && w < 0) {
            $("#multipleSelectedRectangle").css({ "height": h + "px", "width": (-w) + "px", "position": "absolute", "left": pxx - canvasX + scrollX + "px", "top": _base.py - canvasY + scrollY + "px", "opacity": "0.2", "border": "1px dashed #000" });
        }
        else if (h < 0 && w < 0) {
            $("#multipleSelectedRectangle").css({ "height": (-h) + "px", "width": (-w) + "px", "position": "absolute", "left": pxx - canvasX + scrollX + "px", "top": pyy - canvasY + scrollY + "px", "opacity": "0.2", "border": "1px dashed #000" });
        }
        else {
            $("#multipleSelectedRectangle").css({ "height": h + "px", "width": w + "px", "position": "absolute", "left": _base.px - canvasX + scrollX + "px", "top": _base.py - canvasY + scrollY + "px", "opacity": "0.2", "border": "1px dashed #000" });
        }
        if (w < 0) {
            w = 0 - w;
        }
        if (h < 0) {
            h = 0 - h;
        }
        
        //获取矩形四个点的坐标
        let x1 = $("#multipleSelectedRectangle").offset().left;
        let y1 = $("#multipleSelectedRectangle").offset().top;
        let x2 = x1 + w;
        let y2 = y1;
        let x3 = x1 + w;
        let y3 = y1 + h;
        let x4 = x1;
        let y4 = y1 + h;
        
        //取出所有的节点，判断每一个节点是否在多选框中，若在多选框中将其状态改为选中
        let nodeArr = _base.graph.nodes(), i;
        for (i = 0; i < nodeArr.length; i++) {
        	let coordinate = ZFSN.getNodeCoordinate(nodeArr[i]);
        	let flag = false;
        	
        	if ((coordinate.x11 > x1 && coordinate.y11 > y1) && (coordinate.x11 < x2 && coordinate.y11 > y2) && (coordinate.x11 < x3 && coordinate.y11 < y3) && (coordinate.x11 > x4 && coordinate.y11 < y4)) {
                flag = true;
            }
            else if ((coordinate.x22 > x1 && coordinate.y22 > y1) && (coordinate.x22 < x2 && coordinate.y22 > y2) && (coordinate.x22 < x3 && coordinate.y22 < y3) && (coordinate.x22 > x4 && coordinate.y22 < y4)) {
                flag = true;
            }
            else if ((coordinate.x33 > x1 && coordinate.y33 > y1) && (coordinate.x33 < x2 && coordinate.y33 > y2) && (coordinate.x33 < x3 && coordinate.y33 < y3) && (coordinate.x33 > x4 && coordinate.y33 < y4)) {
                flag = true;
            }
            else if ((coordinate.x44 > x1 && coordinate.y44 > y1) && (coordinate.x44 < x2 && coordinate.y44 > y2) && (coordinate.x44 < x3 && coordinate.y44 < y3) && (coordinate.x44 > x4 && coordinate.y44 < y4)) {
                flag = true;
            }
                //反向
            else if ((x1 > coordinate.x11 && y1 > coordinate.y11) && (x1 < coordinate.x22 && y1 > coordinate.y22) && (x1 < coordinate.x33 && y1 < coordinate.y33) && (x1 > coordinate.x44 && y1 < coordinate.y44)) {
                flag = true;
            }
            else if ((x2 > coordinate.x11 && y2 > coordinate.y11) && (x2 < coordinate.x22 && y2 > coordinate.y22) && (x2 < coordinate.x33 && y2 < coordinate.y33) && (x2 > coordinate.x44 && y2 < coordinate.y44)) {
                flag = true;
            }
            else if ((x3 > coordinate.x11 && y3 > coordinate.y11) && (x3 < coordinate.x22 && y3 > coordinate.y22) && (x3 < coordinate.x33 && y3 < coordinate.y33) && (x3 > coordinate.x44 && y3 < coordinate.y44)) {
                flag = true;
            }
            else if ((x4 > coordinate.x11 && y4 > coordinate.y11) && (x4 < coordinate.x22 && y4 > coordinate.y22) && (x4 < coordinate.x33 && y4 < coordinate.y33) && (x4 > coordinate.x44 && y4 < coordinate.y44)) {
                flag = true;
            }
                //中间横
            else if ((x1 > coordinate.x11 && y1< coordinate.y11) && (x2 < coordinate.x22 && y2 < coordinate.y22) && (x3 < coordinate.x33 && y3 > coordinate.y33) && (x4 > coordinate.x44 && y4 > coordinate.y44)) {
                flag = true;
            }
                //中间竖
            else if ((coordinate.x11 > x1 && coordinate.y11 < y1) && (coordinate.x22 < x2 && coordinate.y22 < y2) && (coordinate.x33 < x3 && coordinate.y33 > y3) && (coordinate.x44 > x4 && coordinate.y44 > y4)) {
                flag = true;
            }
        	
        	if (flag) {
        		_base.isClear = false;
        		FLOW.selectedNode(nodeArr[i]);
        	} else {
        		FLOW.noSelectedNode(nodeArr[i]);
        	}
        }
        
        if (_base.selectedNodeList.length > 0) {
			_base.selectedNodeList.length = 0;
			_base.selectedNodeList = _base.selectedNodeList.concat(graphUtil.getSelectedNodeIds());
		}
        
	}).mouseup(function() {
		//松开鼠标初始化，移除多选框
		_base.px = '';
		_base.py = '';
		$("#multipleSelectedRectangle").remove();
	});
	
	// 监听导航条
	let tempIndex;
	$('.showItemTxt').mouseover(function(event) {
		tempIndex = layer.tips($(this).next().text(), $(this).parent(), {
			tips: [$(this).attr('type'), '#23262e'],
			time: 60000,
			tipsMore: true
		});
	}).mouseout(function(event) {
		layer.close(tempIndex);
	});
	
	// 监听键盘，设置快捷键
	$(document).keydown(function(event) {
		// 单键快捷键
		switch (event.which) {
			case CONFIG.keyboardParam.multipleSelectedKey: // ctrl 键
				if (!_base.allowMultipleSelectedFlag){
					_base.allowMultipleSelectedFlag = true;
				}
				break;
			case CONFIG.keyboardParam.deleteKey: // delete 键
				FLOW.deleteNode();
				break;
			case CONFIG.keyboardParam.upKey: // 上
				event.preventDefault();
				FLOW.smallMove('up');
				break;
			case CONFIG.keyboardParam.downKey: // 下
				event.preventDefault();
				FLOW.smallMove('down');
				break;
			case CONFIG.keyboardParam.leftKey: // 左
				event.preventDefault();
				FLOW.smallMove('left');
				break;
			case CONFIG.keyboardParam.rightKey: // 右
				event.preventDefault();
				FLOW.smallMove('right');
				break;
		}
		
		// Ctrl + ... 快捷键
		if (event.ctrlKey == true) {
			if (event.which == CONFIG.keyboardParam.undoKey) {
				// 撤销ctrl + Z
				FLOW.undo();
			} else if (event.which == CONFIG.keyboardParam.redoKey) {
				//重做ctrl + Y
				FLOW.redo();
			} else if (event.which == CONFIG.keyboardParam.selectedAllKey) {
				// 全选ctrl + A
				event.preventDefault(); // 禁用浏览器的全选
				FLOW.selectedAll();
			} else if (event.which == CONFIG.keyboardParam.saveKey) {
				// 保存ctrl + S
				event.preventDefault();
				FLOW.save();
			} else if (event.which == CONFIG.keyboardParam.save2PhotoKey) {
				// 保存为图片ctrl + P
				event.preventDefault();
				FLOW.save2Photo();
			} else if (event.which == CONFIG.keyboardParam.clearKey) {
				// 重新绘制ctrl + D
				event.preventDefault();
				FLOW.clearCanvas();
			} else if (event.which == CONFIG.keyboardParam.showGridKey) {
				// 显示、隐藏网格ctrl + Q
				event.preventDefault();
				FLOW.changeGrid();
			} else if (event.which == 82) {
				// 禁用浏览器ctrl + R刷新功能
				event.preventDefault();
			} else if (event.which == CONFIG.keyboardParam.settingKey) {
				// 打开设置窗口ctrl + F
				event.preventDefault();
				layuiUtil.setting();
			} else if (event.which == 67) {
				// 复制ctrl + C
				event.preventDefault();
			} else if (event.which == 86) {
				// 粘贴ctrl + V
				event.preventDefault();
			} else if (event.which == 76) {
				// 直接加载json数据为流程图(测试)ctrl + L
				layuiUtil.test();
			}
		}
		
		// Alt + ... 快捷键
		if (event.altKey == true) {
			if (event.which == CONFIG.keyboardParam.mouseToolKey) {
				// 鼠标工具Alt + Q
				event.preventDefault();
				FLOW.mouseTool();
			} else if (event.which == CONFIG.keyboardParam.connectionToolKey) {
				// 连线工具Alt + R
				event.preventDefault();
				FLOW.connectionTool();
			}
		}
	}).keyup(function(event) {
		switch (event.which) {
			case CONFIG.keyboardParam.multipleSelectedKey: //ctrl 键
				_base.allowMultipleSelectedFlag = false;
				break;
			case CONFIG.keyboardParam.upKey: // 上
				FLOW.smallMoveHandler();
				break;
			case CONFIG.keyboardParam.downKey: // 下
				FLOW.smallMoveHandler();
				break;
			case CONFIG.keyboardParam.leftKey: // 左
				FLOW.smallMoveHandler();
				break;
			case CONFIG.keyboardParam.rightKey: // 右
				FLOW.smallMoveHandler();
				break;
		}
	});
	
	// 监听连线工具
	jsPlumb.on($('#enableDraggableDiv'), 'click', function(e) {
		FLOW.connectionTool();
	});
	
	// 监听鼠标工具
	jsPlumb.on($('#unableDraggableDiv'), 'click', function(e) {
		FLOW.mouseTool();
	});
}
