/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2014-05-03 11:34:45
 * @version $Id$
 */

//-----------------------全局配置数据---------------//
//缩放级别
//b:大框提示，
//i:小框提示, 
//s:分段数，
//l:长度(秒数)，当前时间段的AB值
//h:背景分段
var globalLadder = [
	
	{b:'H:I',i:false,s:10,l:600}, //10分钟级别, 共分10段
	
	{b:'H:I',i:'I',s:6,l:function(t){
		//计算当前小时毫秒数
		var d = new Date(t*1000);
		d.setMinutes(0, 0, 0);
		var s = d.getTime() / 1000;
		return {A: s + 3600, B: s};
	}}, //1小时级别， 共分6段
	//{b:'Y-M-D',i:'H',s:24,l:86400}, 
	{b:'Y-M-D',i:'H',s:24,l:function(t){
		//计算当天毫秒数
		var d = new Date(t*1000);
		d.setHours(0,0,0,0);
		var s = d.getTime()/1000;
		return {A:s+86400, B:s};
	}}, //天级别，共分24段
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
	}}, //月级别，分段根据当月核算
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
];

//缩放等级数据
// o:每像素代表的毫秒数，
// m:对应的级别
// i:小框提示
// b:大框提示
var globalZoom = [
	{o:2.5,m:0,i:'I'},
	{o:3.3,m:0},{o:5,m:0},
	{o:6,m:0},
	//10分钟
	{o:7.5,m:1},
	{o:15,m:1},
	{o:25,m:1},
	{o:33,m:1,i:false},
	{o:50,m:1,i:false},
	{o:60,m:1,i:false},
	//1小时
	{o:75,m:2,i:'H:I'},
	{o:150,m:2,i:'H'},
	{o:200,m:2,i:'H'},
	{o:300,m:2,i:false},
	{o:360,m:2,i:false},
	//1天
	{o:480,m:3},
	{o:864,m:3},
	{o:1800,m:3},
	{o:3600,m:3},
	{o:4800,m:3},
	{o:7200,m:3,i:false},
	{o:8640,m:3,i:false},
	//1月
	{o:12960,m:4},{o:21600,m:4},
	{o:37028,m:4},{o:54000,m:4},
	{o:108000,m:4,i:'M'},
	{o:144000,m:4,i:'M'},
	{o:216000,m:4,i:false},
	{o:259200,m:4,i:false},
	//一年

	{o:394200,m:5,i:'Y'},
	{o:657000,m:5},
	{o:1314000,m:5},
	{o:1752000,m:5},
	{o:2628000,m:5},
	{o:3153600,m:5},
	//10年
	{o:5256000,m:6,i:'Y'},
	{o:8760000,m:6,i:'Y'},
	{o:13140000,m:6},
	{o:17520000,m:6},
	{o:26280000,m:6},
	{o:31536000,m:6},
	//一世纪
	{o:52560000,m:7,i:'Y'},
	{o:87600000,m:7,i:'Y'},
	{o:131400000,m:7},
	{o:175200000,m:7},
	{o:262800000,m:7},
	{o:315360000,m:7},
	//一千年
	{o:525600000,m:8,i:'Y'},
	{o:876000000,m:8,i:'Y'}
	//一万年
];

//根据缩放比获取对应配置数据
function node(z){
	var dz = globalZoom[z];
	return jQuery.extend({}, globalLadder[dz.m], dz);
}