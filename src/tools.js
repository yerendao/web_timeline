/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2014-05-03 11:32:47
 * @version $Id$
 */

//----------------工具------------------//
//时间格式化
function timeStr(d, format, ty) { //将时间对象格式化成字符串
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