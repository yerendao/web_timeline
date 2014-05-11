/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2014-05-03 11:25:27
 * @version $Id$
 */

var ruler = (function () {

	function eachGrid (ids, D) {
		var str = '';
		var i, l = ids.length - 1, len, dlen, A, B;
		var width = D.width;
		var start = D.start;
		var node = D.node;

		for (i = 0; i < l; i++) {
			A = ids[i + 1];
			B = ids[i];
			len = A - B;
			dlen = len / node.s;
			var b, tm;
			b = node.b ? timeStr(B * 1000, node.b) : '';
			str += '<div class="TL_ladder A' + B + '" style="width:'+(len/node.o)+'px; left:'+((B - start) / node.o + width / 2)+'px;">';
			str += '<span class="ce">' + b + '</span>';
			for(var g = 0; g < node.s; g++){
				tm = node.i ? timeStr((B + dlen * g) * 1000, node.i) : '';
				str += '<div class="TL_cell TL_t" style="left:'+(dlen * g / node.o)+'px;width:'+ (dlen / node.o) +'px;"><span>' + tm + '</span></div>'; 
			}
			str += '</div>';
		}
		return str;
	}

	var rl = function (box, D) {
		this.box = box;
		this.D = D;
	}

	//设定缩放，删除多余的时间格子
	rl.prototype.removeGrid = function (ids) {
		if(jQuery.isArray(ids)){
			for (var i=0; i < ids.length; i++) {
				this.box.find('.A' + ids[i]).remove();
			}
		}
	}

	//增加格子
	rl.prototype.addGrid = function (arr) {
		if (arr) {
			this.box.append(eachGrid(arr, this.D));
		}
	}

	//更新格子
	rl.prototype.upGrid = function () {
		this.box.html(eachGrid(this.D.gridIds, this.D));
	}
	return rl;
})();