/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2014-05-03 11:35:56
 * @version $Id$
 */

//----------------观察者---------------//
var events = function () {
	this.list = {};
}
events.prototype.on = function (name, callback) {
    var list = this.list [name] || (this.list [name] = []);
    list.push(callback);
    return this;
};
events.prototype.off = function (name, callback) {
    if (!(name || callback)) {
        this.list = {};
        return this;
    }
    var list = this.list[name], i;
    if (list) {
        if (callback) {
            i =  list.length - 1;
            for (; i >= 0; i--) {
                if (list[i] === callback) {
                    list.splice(i, 1);
                }
            }
        } else {
            delete this.list[name];
        }
    }
    return this;
};
events.prototype.emit = function (name, data) {
    var list = this.list[name], fn;
    if (list) {
        list = list.slice();
        while ((fn = list.shift())) {
            fn(data);
        }
    }
    return this;
};
