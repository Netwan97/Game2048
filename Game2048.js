(function(window, document, $) {
    function Game2048(opt) {
        var prefix = opt.prefix, len = opt.len, size = opt.size, margin = opt.margin;
        var view = new View (prefix, len, size, margin); 
        
        view.init();              // 自动生成空单元格

        var board = new Board(len);
        board.init();              // 单元格为空时，数组对应的值为 0
        console.log(board.arr);
        board.onGenerate = function(e) {
            //console.log( 'e:', e);
            view.addNum(e.x, e.y, e.num);
        };
        board.generate();
        board.generate();
        board.generate();



        // 添加键盘按下事件
        $(document).keydown(function(e) {
            switch (e.which) {
                case 37: board.moveLeft();  break;
                case 38: board.moveUp();  break;
                case 39: board.moveRight();  break;
                case 40: board.moveDown();  break;
            }
        });

    };
    window['Game2048'] = Game2048;
}) (window, document, jQuery);



function View(prefix, len,size, margin) {
    this.prefix = prefix;
    this.len = len;
    this.size = size;
    this.margin = margin;
    this.container = $('#' + prefix + "_container");
    var containerSize = len * size + margin * (len + 1);
    this.container.css({width: containerSize, height: containerSize});
    this.nums = {};
};

View.prototype = {
    getPos: function(n) {
        return this.margin + n * (this.size + this.margin);
    },
    init: function() {
        for(var x = 0, len = this.len; x < len; x++) {
            for(var y = 0; y < len; y++) {
                var $cell = $('<div class=' + this.prefix + '-cell></div>');
                $cell.css({
                    width: this.size + 'px', 
                    height: this.size + 'px',
                    top: this.getPos(x),
                    left: this.getPos(y)
                }).appendTo(this.container);
            }
        }
    },
    addNum: function(x, y, num) {
        var site = $('<div class="' + this.prefix + '-num ' + this.prefix + '-num-' +  num + '">');
        site.text(num).css({
             top: this.getPos(x) + parseInt(this.size / 2),        // 用于从中心位置展开
             left: this.getPos(x) + parseInt(this.size / 2)        // 用于从中心位置展开
        }).appendTo(this.container).animate({
            width: this.size + 'px',
            height: this.size + 'px',
            lineHeight: this.size + 'px',
            top: this.getPos(x),
            left: this.getPos(y)
        }, 100) ;
        this.nums[x + '-' + y] = site;
    },
    move: function(from, to) {
        var fromIndex = from.x + '-' + from.y, toIndex = to.x + '-' + to.y;
        var clean = this.nums[toIndex];
        this.nums[toIndex] = this.nums[fromIndex];
        delete this.nums[fromIndex];
        var prefix = this.prefix + '-num-';
        var pos = {top: this.getPos(to.x), left: this.getPos(y)};
        this.nums[toIndex].finish().animate(pos, 200, function(){
            if (to.num > from.num) {
                clear.remove();
                $('this').text(to.num).removeClass(prefix + from.num).addClass(prefix + to.num);
            }
        });
    },
};



function Board(len) {
    this.len = len;
    this.arr = [];
}
Board.prototype = {
    init: function() {
        for(var arr = [], len = this.len, x = 0; x < len; x++) {
            arr[x] = [];
            for(var y = 0; y < len; y++) {
                arr[x][y] = 0;
            }
        }
        this.arr = arr;
    },
    // 随机生成数字2或4，保存到数组的随机位置
    generate: function(){
        var empty = [];
        //查找数组中所有为0 的元素的索引
        for( var x = 0, arr = this.arr, len = arr.length; x < len; x++) {
            for( var y = 0; y < len; y++) {
                if (arr[x][y] === 0) {
                    empty.push({x: x, y: y});
                }
            }
        }
        if (empty.length < 1) {
            return false;
        }
        var pos = empty[Math.floor(Math.random() * empty.length)];
        this.arr[pos.x][pos.y] = Math.random() < 0.5 ? 2 : 4;
        this.onGenerate({x: pos.x, y: pos.y, num: this.arr[pos.x][pos.y]});
    },
    // 每当 generate() 方法被调用时，执行此方法
    onGenerate: function() {},
    moveLeft: function() {
        var moved = false;
        for( var x = 0, len = this.arr.length; x < len; x++) {
            for( var y = 0, arr = this.arr[x]; y < len; y++) {
                for( var next = y + 1; next < len; next++) {
                    if(arr[next] === 0){
                        continue;
                    }
                    if(arr[y] === 0) {
                        arr[y] = arr[next];
                        this.onMove({from: {x: x, y: next, num: arr[next]}, to: {x: x, y: y, num: arr[y]}});
                        arr[next] = 0;
                        moved = true;
                        --y;
                        
                    }else if (arr[y] === arr[next]) {
                        arr[y] *= 2;
                        this.onMove({from: {x: x, y: y, num: arr[next]}, to: {x: x, y: y, num: arr[y]}});
                        arr[next] = 0;
                        moved = true;
                    }
                    
                    break;
                }
            }
        }
        this.onMoveComplate({moved: moved});
    },
    onMove: function() {},
    onMoveComplate: function() {},

    moveRight: function() {
        var moved = false;
        for( var x = 0, len = this.arr.length; x < len; x++) {
            for( var arr = this.arr[x], y = arr.length - 1; y > 0; y--) {
                for( var next = y - 1; next >= 0; next--) {
                    if(arr[next] === 0){
                        continue;
                    }
                    if(arr[y] === 0) {
                        arr[y] = arr[next];
                        this.onMove({from: {x: x, y: next, num: arr[next]}, to: {x: x, y: y, num: arr[y]}});
                        arr[next] = 0;
                        moved = true;
                        ++y;
                        
                    }else if (arr[y] === arr[next]) {
                        arr[y] *= 2;
                        this.onMove({from: {x: x, y: y, num: arr[next]}, to: {x: x, y: y, num: arr[y]}});
                        arr[next] = 0;
                        moved = true;
                    }
                    
                    break;
                }
            }
        }
        this.onMoveComplate({moved: moved});
    },
    moveUp: function() {},
    moveDown: function() {},

};
