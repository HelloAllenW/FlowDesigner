FLOW.ready(function() {
	if(window.location.href.substring(0, 4) == 'file') {
		FLOW.init();
		FLOW.loadJson(data);
	} else {
		// 获取数据
		ZFSN.loadJsonFromUrl('/FlowDesigner/json/demoData.json', 'GET', function(err, text) {
			if (!err) {
				let data = JSON.parse(text);
				// 初始化流程设计器
				FLOW.init();
				// 初始化加载josn数据到流程设计器
				FLOW.loadJson(data);
			}
		});
	}
});
