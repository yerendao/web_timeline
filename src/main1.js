/*
 
 @authors ZhouLichen <zxzjob@126.com>
          ZhouLichen
*/

/*
 * 鼠标滚轮缩放、异步加载、时间点
 * 参数设置：
 * 基础属性：宽度,高度，最小时间，最小像素间隔，行高，数据
 * 事件：
 * 数据：
 * 分段信息，
*/

/**
 * Fram 页面框架类 生成页面元素，绑定事件
 *
 *
 */

function timeStr(d,format,ty){ //将时间对象格式化成字符串
	//d时间对象，format：格式对象，ty：是否补全，如05\06等
	var type = 'Y-M-D H:I:S';
	var t = new Date();
	if(d instanceof Date){ t = d;}
	if(typeof(d) == 'number'){ t = new Date(d); }
	if(typeof(d) == 'string'){ type = d; }
	if(typeof(format) == 'string'){ type = format; }
	type = type.replace(/Y/g, t.getFullYear());
	type = type.replace(/M/g,function(a){
		var ms = t.getMonth()+1;
		if( ms < 10 && ty){ return '0'+ms; }
		return ms;
	});
	type = type.replace(/D/g,function(){
		var ms = t.getDate();
		if( ms < 10 && ty){ return '0'+ms; }
		return ms;
	});
	//type = type.replace(/M/g, t.getMonth()+1)
	//type = type.replace(/D/g, t.getDate())
	type = type.replace(/H/g, t.getHours());
	type = type.replace(/I/g, t.getMinutes());
	type = type.replace(/S/g, t.getSeconds());
	return  type;
}

//时间去掉时分秒
function creAB(t,fn){
	var d = new Date(t*1000);
	var d1 = new Date(t*1000);
	fn(d,d1);
	d.setHours(0,0,0,0);
	d1.setHours(0,0,0,0);
	return {A:d.getTime()/1000,B:d1.getTime()/1000};
}

//数据类
var Data = function(da,obj,call){
	//缩放级别
	//b:大框提示，i:小框提示, s:分段数，l:长度(秒数)
	var ladder = [
		{b:'H:I',i:false,s:10,l:600}, //10分钟级别
		{b:'H:I',i:'I',s:6,l:function(t){
			//计算当前小时毫秒数
			var d = new Date(t*1000);
			d.setMinutes(0,0,0);
			var s = d.getTime()/1000;
			return {A:s+3600,B:s};
		}}, //1小时级别
		//{b:'Y-M-D',i:'H',s:24,l:86400}, //天级别
		{b:'Y-M-D',i:'H',s:24,l:function(t){
			//计算当天毫秒数
			var d = new Date(t*1000);
			d.setHours(0,0,0,0);
			var s = d.getTime()/1000;
			return {A:s+86400,B:s};
		}}, //天级别
		{b:'Y-M',i:'D',s:function(t){
			//返回当月的天数（分段数）
			var d = new Date(t*1000);
			d.setMonth(d.getMonth()+1);
			d.setDate(0);
			return d.getDate();
		},l:function(t,fn){
			//计算当前月份的毫秒数
			//var s = (t-t%86400)*1000; //去掉时分秒			
			return creAB(t,function(d,d1){
				d.setMonth(d.getMonth()+1,1);
				d1.setDate(1)
			});
		}}, //月级别
		{b:'Y年',i:'M月',s:12,l:function(t,fn){
			//var s = (t-t%86400)*1000; //去掉时分秒			
			return creAB(t,function(d,d1){
				d.setFullYear(d.getFullYear()+1,0,1);
				d1.setMonth(0,1);
			});
		}}, //年级别
		{b:'Y',i:false,s:10,l:function(t,fn){
			//整数的10年里面的毫秒数
			//var s = (t-t%86400)*1000; //去掉时分秒
			return creAB(t,function(d,d1){
				var y = d.getFullYear();
				d.setFullYear((y-y%10)+10,0,1);
				d1.setFullYear((y-y%10),0,1)
			});
		}}, //10年级别
		{b:'Y',i:false,s:10,l:function(t,fn){
			//整数的10年里面的毫秒数
			//var s = (t-t%86400)*1000; //去掉时分秒			
			return creAB(t,function(d,d1){
				var y = d.getFullYear();
				d.setFullYear((y-y%100)+100,0,1);
				d1.setFullYear((y-y%100),0,1);
			});
		}}, //100年级别
		{b:'Y',i:false,s:10,l:function(t,fn){
			//整数的10年里面的毫秒数
			//var s = (t-t%86400)*1000; //去掉时分秒
			return creAB(t,function(d,d1){
				var y = d.getFullYear();
				d.setFullYear((y-y%1000)+1000,0,1);
				d1.setFullYear((y-y%1000),0,1);
			});
		}}, //1000年级别
	]

	//缩放等级数据
	//o:每像素代表的毫秒数， m:对应的级别
	var zoom = [
		{o:2.5,m:0,i:'I'},{o:3.3,m:0},{o:5,m:0},{o:6,m:0}, //10分钟
		{o:7.5,m:1},{o:15,m:1},{o:25,m:1},{o:33,m:1,i:false},{o:50,m:1,i:false},{o:60,m:1,i:false}, //1小时
		{o:75,m:2,i:'H:I'},{o:150,m:2,i:'H'},{o:200,m:2,i:'H'},{o:300,m:2,i:false},{o:360,m:2,i:false}, //1天
		{o:480,m:3},{o:864,m:3},{o:1800,m:3},{o:3600,m:3},{o:4800,m:3},{o:7200,m:3,i:false},{o:8640,m:3,i:false}, //1月
		{o:12960,m:4},{o:21600,m:4},{o:37028,m:4},{o:54000,m:4},{o:108000,m:4,i:'M'},{o:144000,m:4,i:'M'},{o:216000,m:4,i:false},{o:259200,m:4,i:false},//一年

		{o:394200,m:5,i:'Y'},{o:657000,m:5},{o:1314000,m:5},{o:1752000,m:5},{o:2628000,m:5},{o:3153600,m:5},//10年
		{o:5256000,m:6,i:'Y'},{o:8760000,m:6,i:'Y'},{o:13140000,m:6},{o:17520000,m:6},{o:26280000,m:6},{o:31536000,m:6},//一世纪
		{o:52560000,m:7,i:'Y'},{o:87600000,m:7,i:'Y'},{o:131400000,m:7},{o:175200000,m:7},{o:262800000,m:7},{o:315360000,m:7},//一千年
		{o:525600000,m:8,i:'Y'},{o:876000000,m:8,i:'Y'}//一万年
	]
	//获取节点
	function node(z){
		var dz = zoom[z];
		return jQuery.extend({}, ladder[dz.m],dz);
	}

	//初始化字段名
	var filet = jQuery.extend({},{ start:'start', end:'end'},(obj || {}));

	//得到最大和最小时间
	var max,min;
	jQuery.each(da,function(i,n){
		var nn = n[filet.end];
		var ns = n[filet.start];
		if(typeof(nn) == 'string' ){ nn = parseInt(nn); }
		if(typeof(ns) == 'string' ){ ns = parseInt(ns); }
		max = typeof(max) == 'undefined' ?  nn : Math.max(max,nn);
		min =  typeof(min) == 'undefined'  ? ns : Math.min(min,ns);
	})
	//计算指针时间(精确到秒)
	var now = parseInt(new Date().getTime()/1000); //当前时间
	var tonow= Math.max(min,Math.min(max,now));
	var tonode = node(8);
	var callBack =  call || function(){}
	
	console.log(node(8))

	var D = function (){
		this.start = min; //开始时间
		this.end = max;   //结束时间
		this.hand = tonow;  //指针时间
		this.zoom = 8;
		this.min_zoom = 0;
		this.max_zoom = 50;
		this.node = tonode;
	}
	//监听函数
	D.prototype.listen = function(fn){ callBack = fn; }

	//根据容器宽度获取滚动层长度和位移
	D.prototype.getOff = function(w){		
		return {len:(this.end-this.start)/this.node.o+w,off:0-(this.hand-this.start)/this.node.o}
	}
	//根据长度获取滚动层对应的开始时间和结束时间
	D.prototype.getSE = function(w){
		var b = (w/2)*this.node.o;
		return {start:this.start-b,end:this.end+b};
	}
	//调整缩放比例
	D.prototype.setZoom = function(z){
		if(z < this.min_zoom || z > this.max_zoom){ return; }
		var dz = zoom[z];
		this.zoom = z;
		this.node =  node(z);
		//输出主体区域的宽度
		//输出左侧的缩进量
		//重绘标尺数据
		callBack({node:this.node});
	}
	//设定最小缩放比
	D.prototype.setMinZoom = function(z){
		if(z < 0 || z > this.max_zoom){ return; }
		this.min_zoom = z;
		if(z > this.zoom){
			this.setZoom(z);
		}
	}
	//接收来自Fram的缩放值(滚轮加减)，转化成缩放比
	D.prototype.accuZoom = function(z){
		if(this.zoom <= this.min_zoom && z < 0){ return; }
		if(this.zoom >= this.max_zoom && z > 0){ return; }
		this.setZoom(this.zoom+z);
	}
	//设置最大缩放比，必须小于50
	D.prototype.setMaxZoom = function(z){
		if(z < this.min_zoom || z>50){ return; }
		this.max_zoom = z;
		if(z < this.zoom){
			this.setZoom(z);
		}
	}
	//改变指针，用户拖拽
	D.prototype.setHand = function(h){
		if(h > this.end || h < this.start){ return; }
		this.hand = h;
		//console.log(timeStr(h*1000))
		callBack({hand:this.hand});
	}
	return new D();
}

//框架类
var Fram = function(elm,obj,fun){
	//this.elm = elm;  //外部容器元素
	var def = {
		width:elm.width() || 300, //容器宽度
		M_height:200,  //中心区高度
		T_height:30,   //头部高度
		F_height:30,   //底部高度
		H_width:3,      //中心线宽度
		offset:0,       //滚动层偏移量
		L_width:0       //滚动层宽度
	}

	if(obj){ jQuery.extend(def,obj); }
	//创建元素
	var box = {
		shell:jQuery('<div class="TML_main_box"></div>'),//外壳
		main:jQuery('<div class="TML_main"></div>'),  //主体
		title:jQuery('<div class="TML_title"></div>'),//头部
		foot:jQuery('<div class="TML_foot"></div>'),  //底部
		list:jQuery('<div class="TML_list"></div>'),  //列表
		line:jQuery('<div class="TML_line"></div>'),  //时间线
		hand:jQuery('<div class="TML_hand"></div>'),  //手柄
		handT:jQuery('<div class="TML_handT"></div>') //时间线显示
	}
	box.hand.append(box.handT);
	box.main.append(box.list).append(box.line);
	box.shell.append(box.hand).append(box.title).append(box.main).append(box.foot);
	elm.append(box.shell);

	function reposition(obj){
		if(obj.len){
			def.L_width = obj.len;
			box.list.css({width:obj.len});
			box.title.css({width:obj.len});
			box.foot.css({width:obj.len});
		}
		if(obj.off){
			def.offset = obj.off;
			box.list.css({left:obj.off});
			box.title.css({left:obj.off});
			box.foot.css({left:obj.off});
		}
	}

	function resize(obj){
		if(obj.width){
			def.width = obj.width;
			box.shell.width(obj.width);
		}
		if(obj.H_width){
			def.H_width = obj.H_width;
			box.hand.width(obj.H_width);
		}
		if(obj.H_width || obj.width){
			box.hand.css('left',(obj.width-def.H_width)/2);
		}
		if(obj.M_height){
			def.M_height = obj.M_height;
			box.main.height(obj.M_height);
			box.list.height(obj.M_height);
			box.hand.height(obj.M_height);
		}
		if(obj.T_height){
			def.T_height = obj.T_height;
			box.title.height(obj.T_height);
			box.hand.css('top',obj.T_height);
		}
		if(obj.F_height){
			def.F_height = obj.F_height;
			box.foot.height(obj.F_height);
		}
	}

	var offset = 0;
	var length = 0;
	var events = {
		'startDrag':function(){},
		'drag':function(){},
		'endDrag':function(){},
		'zoom':function(){},
		'reSize':function(){}
	}
	box.shell.drag('start',function(ev,dd){
		dd.Dv = 0 - (def.L_width-def.width); //左侧移动的最大间距
		dd.Sv = 0 + def.offset; //移动的postion初值
		dd.Vv =  0 + def.offset; //初始默认为初值
		events.startDrag(ev,dd);
	}).drag(function(ev,dd){
		var v = dd.Sv+dd.deltaX;
		if(v < dd.Dv || v > 0){ return; }
		dd.Vv = v;
		def.offset = v;
		//reposition({off:dd.Vv});
		events.drag(ev,dd);
	}).drag('end',function(ev,dd){
		def.offset = dd.Vv;
		events.endDrag(ev,dd);
	})

	box.shell.bind('mousewheel',function(i,n){
		events.zoom(n);
	});

	var F = function(){
		this.box = box;
		this.shell = box.shell;
		this.main = box.main;
		this.title = box.title;
		this.foot = box.foot;
		this.line = box.line;
		this.list = box.list;
		this.hand = box.hand;
	}
	//输出基础数据
	F.prototype.getSize = function(){ return def; } 
	//绑定事件
	F.prototype.bind = function(evn,fn){
		if(events[evn] && typeof(fn) == 'function'){ events[evn] = fn; }
		return this;
	}
	//显示
	F.prototype.show = function(){ this.shell.show(); }
	//隐藏
	F.prototype.hide = function(){ this.shell.hide(); }
	//修改窗体大小尺寸
	F.prototype.reSize = function(obj) {
		if(!obj){ return; }
		resize(obj);
		events.reSize(obj);
		return this;
	};
	F.prototype.showHand = function(x){
		box.handT.html(timeStr(x*1000,'Y-M-D H:I'));
	}
	//实现拖拽层位置变化{off:位置偏移,len:图拽层长度}
	F.prototype.rePosition = function(obj){
		reposition(obj);
	}
	//移动标尺
	//add [] //需要添加的数据
	//remove [] //需要删除的对象
	F.prototype.moveRuler = function(html,ids){
		if(html){
			this.box.title.append(html);
		}
		if(jQuery.isArray(ids)){
			for(var i=0; i<remove.length; i++){
				this.box.title.find('#A'+remove[i]).romove(); //删除多余
			}
		}
	}
	//更新标尺
	F.prototype.reRuler = function(html){
		if(html){ this.box.title.html(html); }
		//[{t:'时间',l:'偏移',w:'长度',t:'文字',son:[]}]
	}
	//更新列表
	F.prototype.reList = function(html){
		if(html){ this.box.list.html(html); }
	}

	var rF = new F();
	rF.reSize(def);
	return rF;
}

var TimeLine = function(da,w,cal){

	var def = {
		start: da.hand - w/2*da.node.o,
		end: da.hand + w/2*da.node.o,
		hand:da.hand,
		node:da.node,              //节点数据
		width:w,                   //外部宽度
		list:[]
	}

	var call = cal || function(){}
	//获取当前时间的时间段
	function getL(t){
		var reO;
		if(typeof(def.node.l)  == 'function'){
			reO = def.node.l(t);
		}else{
			var pin = t-t%def.node.l;
			reO = {A:pin+def.node.l,B:pin}
		}
		return reO;
	} //获取格子宽度(秒)
	function getS(t){
		return typeof(def.node.s) == 'function' ? def.node.s(t) : def.node.s;
	} //获取格子分段数
	
	var tem = getL(def.hand);

	console.log(def.node)

	var list = []; //列表
	var Jlist = []; //简化列表
	var temL = tem.B; //临时左侧
	var temR = tem.B; //临时右侧

	function each(a,b,fn){
		var lis = [];
		var Jlis = [];
		var ra,rb;
		var jjj = 0;
		//console.log('------------------------------------');
		//console.log(def.node);
		//console.log('开始时间:'+timeStr(def.start*1000));
		//console.log('结束时间:'+timeStr(def.end*1000));
		//console.log('hand时间:'+timeStr(def.hand*1000));
		function ea(l,r){
			//console.log('-----------------------------------');
			var ll ,rr;
			if(l){
				var ab = getL(temL-60);				
				//console.log('l:'+timeStr(ab.B*1000));
				ab.s = getS(temL-60);
				ab.b = def.node.b;
				ab.i = def.node.i;
				ab.o = def.node.o;
				temL = ab.B;
				lis.push(ab);
				Jlis.push(temL);
				if(temL > def.start){ ll = true; }
			}
			if(r){
				var ab = getL(temR + 60);
				//console.log('r:'+timeStr(ab.B*1000));
				ab.s = getS(temR+60);
				ab.b = def.node.b;
				ab.i = def.node.i;
				ab.o = def.node.o;
				temR = ab.A;
				lis.push(ab);
				Jlis.push(temR);
				if(ab.A < def.end){ rr = true; }
			}
			//console.log('gl:'+ll)
			//console.log('gr:'+rr)
			jjj += 1;
			if(ll || rr){
				ea(ll,rr);
			}
		}
		ea(a,b);
		if(lis.length > 0){ ra = lis; }
		if(Jlis.length > 0){ rb = Jlis; }
		fn(ra,rb);
	}

	//解析标尺数据 s,代表子级别
	function ruler(arr){
		//{t:'时间',l:'偏移',w:长度,t:'文字',son:[]}
		var str = '';
		jQuery.each(arr,function(i,n){
			var len = n.A-n.B;
			var dlen = len/n.s;
			var b,i;			
			b = n.b ? timeStr(n.B*1000,n.b) : '';
			//console.log(def.width/2);
			str += '<div class="TML_ladder" id="A'+n.B+'" style="width:'+(len/n.o)+'px; left:'+((n.B-da.start)/n.o+def.width/2)+'px;">';
			str += '<span class="ce">'+b+'</span>'
			for(var g=0; g<n.s; g++){
				i = n.i ? timeStr((n.B+dlen*g)*1000,n.i) : '';
				str += '<div class="TML_cell TML_t" style="left:'+(dlen*g/n.o)+'px;width:'+(dlen/n.o)+'px;"><span>'+i+'</span></div>'; 
			}
			//if(n.son){ str += ruler(n.son,true); }
			str += '</div>';
		})
		return str;
	}

	//创建数组
	function creList(fn){
		var ab = getL(def.hand); //偏移
		temL = ab.B; //临时左侧
		temR = ab.B; //临时右侧

		list = []; //重置list
		Jlist = [];
		each(true,true,function(Ra,Rb){
			if(Rb){ Jlist = Rb; }
			if(Ra){
				list = Ra;
				fn(ruler(list));
			}
		});
	}
	function reList(fn){
		var ll,rr;
		if(temL > def.start){ ll = true; }
		if(temR < def.end){ rr = true; }
		//循环
		each(ll,rr,function(Ra,Rb){
			if(Rb){ Jlist = jQuery.merge(Jlist,Rb); }
			if(Ra){
				list = jQuery.merge(list,Ra);
				fn(ruler(Ra));
			}
		});
	}
	creList(function(html){
		if(html){ call(html); }
	}); //重绘

	//标尺
	var L = function(){
		this.list = []
	}

	//监听
	L.prototype.listen = function(fn){
		call = fn;
	}

	//重置原点(x:时间)
	L.prototype.setHand = function(x){
		//console.log('改变hand时间到：'+timeStr(x*1000));
		def.hand = x;
		var lw = def.width/2*def.node.o; //一半
		def.start = def.hand - lw;
		def.end = def.hand + lw;
		reList(function(html){
			if(html){ call(null,html); }
		})
		//位移
	}

	//重置宽度(宽度)(重绘)
	L.prototype.setWidth = function(w){
		def.width = w;
		var lw = def.width/2*def.node.o; //一半
		def.start = def.hand - lw;
		def.end = def.hand + lw;
		creList(function(html){
			if(html){ call(html); }
		})
		//删减
		return this;
	}

	//重置节点数据（重绘）
	L.prototype.setNode = function(n){

		def.node = n;
		var lw = def.width/2*def.node.o; //一半
		def.start = def.hand - lw;
		def.end = def.hand + lw;

		creList(function(html){
			if(html){ call(html); }
			//if(b){ Jlist = b; }
			//this.jist = Jlist;
		}); //重绘

		return this;
	}
	return new L();
}

var List = function(da){

	var Allheight = 50; //总高度

	function LI(da){
		this.data = da; //数据列表
		this.height = 20;//单条数据高度
		this.start=0;  //开始时间
		this.end=0;    //结束时间
		this.space=5;  //间隔
	}

	LI.prototype.reList = function(obj){
		Allheight = 0;
		if(obj.height){ this.height = obj.height; }
		if(obj.start){ this.start = obj.start; }
		if(obj.end){ this.end = obj.end; }
		if(obj.data){ this.data = obj.data; }
		if(obj.space){ this.space = obj.space; }

		var _this = this;
		var len = this.end-this.start;
		var html='';
		jQuery.each(this.data,function(i,n){
			Allheight += (_this.height+_this.space);
			var w = (n.end-n.start)/len*100+'%';
			var l = (n.start-_this.start)/len*100+'%';
			html += '<div class="node" style="width:'+w+'; height:'+_this.height+'px;left:'+l+';top:'+(i*(_this.height+_this.space))+'px;"></div>';
		})
		return html;
	}

	LI.prototype.getHeight = function(){
		return Allheight;
	}

	//增加一条数据
	LI.prototype.add = function(){

	}
	//删除一条数据
	LI.prototype.del = function(){

	}
	return new LI(da);
}


jQuery(function(){
	
	var Ele = jQuery('#timeline_box'); //外容器
	var w = Ele.width();

	var da = Data(taskdata); //初始化数据
	var fr = Fram(Ele); //初始化框架
	//初始化时间线
	var lin = TimeLine(da,w,function(CRE,UP){
		if(CRE){
			fr.reRuler(CRE); //重新渲染标尺（缩放）
		}
		if(UP){
			fr.moveRuler(UP); //移动标尺（拖拽）
		}
	});
	var lis = List(taskdata); //初始化列表
	
	//var dw = da.end-da.start;  //数据秒数
	//var ww = w*da.node.o;      //宽度代表的秒数
	//console.log((dw+ww)/da.node.o);
	//console.log((da.hand-da.start)/da.node.o-w);
	//fr.rePosition(dw/da.node.o+w,0-(da.hand-da.start)/da.node.o) //初始化宽度

	fr.rePosition(da.getOff(w)); //初始化点，设定长度和偏移值
	fr.showHand(da.hand); //初始化手柄

	//写入列表数据
	fr.reList(lis.reList(da.getSE(w)));    //设定列表内容，生成列表
	fr.reSize({M_height:lis.getHeight()}); //设定列表区高度


	//时间线变化监听
	/*lin.listen(function(CRE,UP){

		console.log(CRE);
		console.log(UP);
	})*/

	//数据变化监听
	da.listen(function(re){
		//设定缩放比
		if(re.node){
			fr.rePosition(da.getOff(w));
			lin.setNode(re.node);
			fr.reList(lis.reList(da.getSE(w))); 
		}
		//设定位移
		if(re.hand){
			fr.rePosition(da.getOff(w));
			lin.setHand(re.hand);
			fr.showHand(re.hand);
		}
	})

	//框架事件绑定
	var temHand = 0;
	fr.bind('startDrag',function(ev,dd){
		temHand = 0 + da.hand;
	}).bind('drag',function(ev,dd){
		//这里改变标尺位置
		da.setHand(temHand + (0-dd.deltaX*da.node.o));
	}).bind('endDrag',function(ev,dd){
		da.setHand(temHand + (0-dd.deltaX*da.node.o));
	}).bind('zoom',function(n){
		da.accuZoom(n); //数据累加执行
	}).bind('reSize',function(obj){
		if(obj.width){
			w = obj.width;
			fr.rePosition(da.getOff(obj.width)); //初始化点，设定长度和偏移值
			fr.reList(lis.reList(da.getSE(obj.width)));    //设定列表内容，生成列表
			lin.setWidth(obj.width);
		}
	})

	//缩放浏览器
	jQuery(window).resize(function(){
		var rew = Ele.width();
		if(rew == fr.width){ return; }
		fr.reSize({width:rew});
	})

})
