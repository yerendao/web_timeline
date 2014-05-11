/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2014-05-03 11:36:51
 * @version $Id$
 */


//--------------数据模型类-------------//
//数据模型依赖容器的宽度，根据
var model = (function () {

	//格式化可见区域数据,得到可见区域的开始和结束时间
	function vis(obj) {
		var lw = obj.width / 2 * obj.node.o; //一半
		obj.visStart = obj.hand - lw;
		obj.visEnd = obj.hand + lw;
	}

	//传递一个时间，获取该时间的AB点
	function getAB(node, t){
		return typeof(node.l)  == 'function' ? node.l(t) :
			(function () {
				var pin = t - t % node.l;
				return {A: pin + node.l, B: pin};
			})();
	}

	//获取格子分段数, 如，一个月的周数，一周的天数
	function getS(node, t){
		return typeof(node.s) == 'function' ? node.s(t) : node.s;
	}

	//向左侧循环
	//start:开始时间, end结束时间, dir循环方向(0左1右)
	function eachL(node, start, end) {
		var list = [];
		//i < 100 避免死循环，最多100个格子
		var i, ab, tem = start;
		for (i = 0; i < 100; i++) {
			ab = getAB(node, tem - 60);
			tem = ab['B'];
			list.push(tem);
			if (tem < end) { break; }
		}
		return list.sort();
	}

	//向右侧循环
	function eachR(node, start, end) {
		var list = [];
		//i < 100 避免死循环，最多100个格子	
		//list.push(start);
		var i, ab, tem = start;
		for (i = 0; i < 100; i++) {
			ab = getAB(node, tem + 60);
			tem = ab['A'];
			list.push(tem);
			if (tem > end) { break; }
		}
		return list;
	}

	//格式化开始和结束时间
	var MD = function (da) {
		this.start = da.start; //开始时间
		this.end = da.end;   //结束时间
		this.hand = da.now;  //指针时间
		this.zoom = da.active; //缩放比例
		this.node = node(da.active); //缩放模型
		this.events = new events(); //时间
		this.width = 0; //容器宽度
		this.visStart = 0; //可见区开始时间
		this.visEnd = 0; //可见区结束时间
		this.gridIds = [];
	}

	MD.prototype = {
		getOff:　function(){
			//根据容器宽度获取滚动层长度和位移
			return 0 - (this.hand - this.start) / this.node.o;
		},
		getSize: function () {
			return (this.end - this.start) / this.node.o + this.width;
		},
		getGrid: function (dir) {
			//dir，方向 ‘L’ 左循环，“R” 右循环
			var tem, arr;
			if (dir === 'L') {
				tem = this.gridIds[0];
				arr = eachL(this.node, tem, this.visStart);
				this.gridIds = arr.concat(this.gridIds);
				arr.push(tem);
				return arr;
			}

			if (dir === 'R') {
				tem = this.gridIds[this.gridIds.length-1];
				arr = eachR(this.node, tem, this.visEnd);
				this.gridIds = this.gridIds.concat(arr);
				return [tem].concat(arr);
			}

			tem = getAB(this.node, this.visStart); //取最左侧格子
			this.gridIds = eachR(this.node, tem.B, this.visEnd);
			this.gridIds.unshift(tem.B);
			return this.gridIds;
		},
		getSE: function (width) {
			//根据长度获取滚动层对应的开始时间和结束时间
			var b = (this.width/2)*this.node.o;
			return {
				start: this.start - b,
				end: this.end + b
			};
		},
		setSize: function (width) {
			//改变容器宽度
			if (!width) { return ;}
			this.width = width;
			vis(this);
			this.gridIds = [];
			
			this.events.emit('onSize', {
				off: this.getOff(),
				size: this.getSize(),
				grid: this.getGrid()
			});
		},
		setZoom: function (active) {
			//调整缩放比例
			//var dz = globalZoom[active];
			this.zoom = active;

			console.log(this.zoom);

			this.node =  node(active);
			vis(this);
			this.gridIds = [];
			//输出主体区域的宽度
			//输出左侧的缩进量
			//重绘标尺数据
			this.events.emit('onZoom', {
				off: this.getOff(),
				size: this.getSize(),
				grid: this.getGrid()
			});
			//callBack({node:this.node});
		},
		setHand: function(h, isEnd){
			//改变指针，用户拖拽
			if (h > this.end || h < this.start) { return; }
			var dir = h > this.hand ? 'R' : 'L'; //移动方向
			//if (h == this.hand) {dir = 'END'; } //结束
			//var isEnd = h == this.hand;
			this.hand = h;
			vis(this);
			var re = {off: this.getOff()}

			//未超出范围，不执行任何生成
			if (dir == 'R') {
				if (this.visEnd > this.gridIds[this.gridIds.length -1]) {
					re.grid = this.getGrid('R');
				}
			}
			if (dir == "L") {
				if (this.visStart < this.gridIds[0]) {
					re.grid = this.getGrid('L');
				}
			}

			//当拖拽停止，删除多余的节点
			if (isEnd) {
				var i, len = this.gridIds.length, li = 0, ri = 0, teml = [], temr = [];
				for (i = 0; i < len; i++) {
					if (this.gridIds[i] < this.visStart) {
						li = i;
					}
					if (this.gridIds[i] <  this.visEnd) {
						ri = i;
					}
				}
				if (len - ri > 1) {
					temr = this.gridIds.slice(ri + 1);
				}
				if (li > 1) {
					teml = this.gridIds.slice(0, li);
				}
				re.del = teml.concat(temr);
				this.gridIds = this.gridIds.slice(li, ri + 1);
			}
			this.events.emit('onHand', re);
		}
	}
	return MD;
})();