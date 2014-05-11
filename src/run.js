/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2014-05-03 11:39:08
 * @version $Id$
 */

/** 参数说明
data: {
	data: 数据
	filet: {start, end} //字段
}
*/
$.fn.timeLine = function (data, opt) {
	if (!data) {
		return;
	}

	var def_data = {
		data: null,
		filet: {start:'start', end:'end'}
	}

	if ($.isArray(data)) {
		def_data.data = data;
	} else {
		$.extend(def_data, data);
	}

	opt = opt || {};
	data = data || {data:{}};

	if (!def_data.data) {
		return;
	}

	var box = $(this);

	//opt部分
	var def = {
		left: {width:0},	//左侧默认参数
		right: {width:0}, 	//右侧默认参数
		zoom: {max:50, min:0, active: 10},	//缩放参数
		title: {height:32},
		foot: {height:32}
	}

	jQuery.extend(def.left, opt.left || {});
	jQuery.extend(def.right, opt.right || {});

	//缩放必须在0-50之间
	var zoom = opt.zoom || {}
	zoom.max = zoom.max ? Math.min(zoom.max, def.zoom.max) : def.zoom.max;
	zoom.min = zoom.min ? Math.max(zoom.min, def.zoom.min) : def.zoom.min;
	if (zoom.max < zoom.min) {
		zoom.min = zoom.max;
	}
	zoom.active = typeof zoom.active !== 'undefined' ? Math.max(Math.min(def.zoom.max, zoom.active), def.zoom.min)  : def.zoom.active;
	jQuery.extend(def.zoom, zoom);

	//数据部分
	var filet = def_data.filet;
	var max,min;
	jQuery.each(def_data.data, function (i, n) {
		var nn = n[filet.end];
		var ns = n[filet.start];
		if(typeof(nn) == 'string' ){ nn = parseInt(nn); }
		if(typeof(ns) == 'string' ){ ns = parseInt(ns); }
		max = typeof(max) == 'undefined' ?  nn : Math.max(max,nn);
		min =  typeof(min) == 'undefined'  ? ns : Math.min(min,ns);
	});

	var now = parseInt(new Date().getTime()/1000); //当前时间
	var initData = {
		start: min,
		end: max,
		active: def.zoom.active, //默认缩放级别8
		now: Math.max(min, Math.min(max, now)) //当最大和最小事件超出指针范围时候
	}

	//申明显示对象
	var F = new frame(box, def);
	//申明数据模型对象
	var D = new model(initData);
	//标尺
	var R = new ruler(F.elms.ruler, D);

	//事件的绑定
	D.events.on('onZoom', function (obj) {
		F.setSize(obj.size);
		F.setOff(obj.off);
		R.upGrid();
	});
	D.events.on('onSize', function (obj) {
		F.setSize(obj.size);
		F.setOff(obj.off);
		R.upGrid();
		F.setHandMsg(D.hand);
	});
	D.events.on('onHand', function (obj) {
		F.setOff(obj.off);
		F.setHandMsg(D.hand);
		if (obj.grid) {
			R.addGrid(obj.grid);
		}
		if (obj.del) {
			R.removeGrid(obj.del);
		}
	});

	F.events.on('onZoom', function (active) {
		D.setZoom(active);
	});

	var temHand = 0;
	//var temTime = 0;
	F.events.on('onStartDrag', function (dd) {
		//temTime = new Date().getTime();
		temHand = 0 + D.hand;
	});
	F.events.on('onDrag', function (dd) {
		D.setHand(temHand + (0-dd.deltaX*D.node.o));
	});
	F.events.on('onEndDrag', function (dd) {
		D.setHand(temHand + (0-dd.deltaX*D.node.o), true);
		//var timeLen = new Date().getTime() - temTime;
	});

	//初始化
	D.setSize(box.width());
}

jQuery(function () {
	jQuery('#timeline_box').timeLine(taskdata, {
		zoom:{active:0}
	});
});
