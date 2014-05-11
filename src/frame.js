/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2014-04-23 16:52:46
 * @version $Id$
 * 时间线元素：标尺，中心点、绘制区、状态栏，左侧栏
 * 时间线事件：拖动、缩放、修改中心点、标记位置，制造选区
 * 可以显示状态（加载中，加载完毕，锁定、只显示、）
 */
//--------------框架类--------------//
//生成html元素，并且绑定框架的滚轮和拖拽动作

var frame = function (box, opt) {
	var self = this;

	opt = opt || {};

	var def = {
		left: {width:0},	//左侧默认参数
		right: {width:0}, 	//右侧默认参数
		zoom: {max:50, min:0, active: 10},	//缩放参数
		title: {height:32},
		foot: {height:32}
	};

	var leftStyle = jQuery.extend({}, def.left, opt.left || {});
	var rightStyle = jQuery.extend({}, def.right, opt.right || {});
	var titleStyle = jQuery.extend({}, def.title, opt.title || {});
	var footStyle = jQuery.extend({}, def.title, opt.foot || {});
	var zoom = jQuery.extend({}, def.zoom, opt.zoom || {});

	/*
	var html = '<div class="TL_body"><div class="TL_left" style="width: 0px;"></div><div class="TL_main">';
	html += '<div class="TL_hand"><div class="TL_hand_msg"></div></div>';
	html += '<div class="TL_title"><div class="TL_ruler"></div></div>';
	html += '<div class="TL_content"><div class="TL_list"></div><div class="TL_axis"></div><div class="TL_backdrop"></div></div>';
	html += '<div class="TL_foot"></div>';
    html += '</div><div class="TL_right" style="width: 0px;"></div></div>'
    box.html(html);
    */
	//box宽度
	//var width = box.width();
	//主体宽度
	//var mainWidth = width - leftStyle.width - rightStyle.width;

	//var ev = new events();
	var elms = {
		body: jQuery('<div class="TL_body"></div>').css({"padding-left":leftStyle.width, "padding-right": rightStyle.width}),//
		main: jQuery('<div class="TL_main"></div>'),//外壳

		content: jQuery('<div class="TL_content"></div>'),  //主体
		left: jQuery('<div class="TL_left"></div>').css(leftStyle),//左侧
		right: jQuery('<div class="TL_right"></div>').css(rightStyle),//右侧

		list: jQuery('<div class="TL_list"></div>'),  //列表
		backDrop: jQuery('<div class="TL_backdrop"></div>'),  //背景
		axis: jQuery('<div class="TL_axis"></div>'),  //时间线

		title: jQuery('<div class="TL_title"></div>'),//头部
		ruler: jQuery('<div class="TL_ruler"></div>'),
		foot: jQuery('<div class="TL_foot"></div>'),  //底部
		
		hand: jQuery('<div class="TL_hand"></div>'),  //手柄
		handMsg: jQuery('<div class="TL_hand_msg"></div>') //时间线显示
	}

	elms.title.append(elms.ruler);
	elms.hand.append(elms.handMsg);
	elms.content.append(elms.list).append(elms.axis).append(elms.backDrop);
	elms.main.append(elms.hand).append(elms.title).append(elms.content).append(elms.foot);
	elms.body.append(elms.left).append(elms.main).append(elms.right);
	box.append(elms.body);

	//绑定鼠标滚动
	elms.main.bind('mousewheel',function(i, n){
		if ((n < 0 && zoom.active <= zoom.min) || (n > 0 && zoom.active >= zoom.max)) {
			return;
		}
		zoom.active += n;
		self.events.emit('onZoom', zoom.active);
	});

	//拖拽
	elms.content.drag('start',function(ev,dd){
		dd.Dv = 0 - (def.L_width-def.width); //左侧移动的最大间距
		dd.Sv = 0 + def.offset; //移动的postion初值
		dd.Vv =  0 + def.offset; //初始默认为初值
		self.events.emit('onStartDrag', dd);
		//events.startDrag(ev,dd);
	}).drag(function(ev,dd){
		var v = dd.Sv+dd.deltaX;
		if(v < dd.Dv || v > 0){ return; }
		dd.Vv = v;
		def.offset = v;
		//reposition({off:dd.Vv});
		self.events.emit('onDrag', dd);
		//events.drag(ev,dd);
	}).drag('end',function(ev,dd){
		def.offset = dd.Vv;
		self.events.emit('onEndDrag', dd);
		//events.endDrag(ev,dd);
	})

	this.elms = elms;
	this.events = new events();
}

frame.prototype = {
	setHandMsg: function (time) {
		this.elms.handMsg.html(timeStr(time*1000,'Y-M-D H:I'));
	},
	setSize: function (width) {
		//设置滚动宽高
		this.elms.list.width(width);
		this.elms.ruler.width(width);
		//this.title.width(width);
		//this.elms.foot.width(width);
	},
	setOff: function(left) {
		//设置偏移
		this.elms.list.css({left:left});
		this.elms.ruler.css({left:left})
		//this.elms.title.css({left:left});
		//this.elms.foot.css({left:left});
	},
}
