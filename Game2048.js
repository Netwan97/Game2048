(function(window, document, $) {
    function Game2048(opt) {
        var prefix = opt.prefix, len = opt.len, size = opt.size, margin = opt.margin;
        var view = new View (prefix, len, size, margin); 
        var board = new Board(len);
        var winNum = 16;                // 测试值设置小一点
        var isGameOver = false;
        view.init();                   // 自动生成空单元格

        board.onGenerate = function(e) {
            //console.log( 'e:', e);
            view.addNum(e.x, e.y, e.num);
        };
   
        board.onMove = function(e) {
            // 每当board.arr中的单元格移动时，调用此方法控制页面中的单元格移动
            view.move(e.from, e.to);
            if(e.to.num > e.from.num) {
                this.score += e.to.num;        // 累加分数
                view.updateScore(this.score);        // 更新页面中显示的分数
            }
            if(e.to.num == 2048) {                   // 到2048，提示游戏胜利
                //isGameOver = true;                   // 玩家选择结束才结束
                this.key++;
                if(this.key == 1) {
                    setTimeout(function() {
                        view.win();                  // 玩家玩到2048时提示游戏获胜
                    }, 300); 
                }
            }; 
         };

        board.onMoveComplete = function(e) {
            if (e.moved){
                // 一次移动操作全部结束后，如果移动成功，则在棋盘中增加一个新单元格
                setTimeout(function() {
                    board.generate();
                }, 200);
            };  
            // 判断是否失败
            score = this.score;
            if(!board.canMove()) {
                isGameOver = true;
                setTimeout(function() {
                    view.over(score);              // 游戏结束
                }, 300);
            } 
        }

        // 添加键盘按下事件
        $(document).keydown(function(e) {
            if (isGameOver) {
                return false;
            }
            switch (e.which) {
                case 37: board.moveDirection(1, 1);  break;
                case 38: board.moveDirection(-1, 1);  break;
                case 39: board.moveDirection(1, -1);  break;
                case 40: board.moveDirection(-1, -1);  break;
            }
        });

        function start() {
            view.updateScore(0);        // 将页面中的分数重置为0
            view.cleanNum();            // 清空页面中多余的数字单元格
            board.init();               // 初始化单元格数组
            board.generate();           // 生成第1个数字
            board.generate();           // 生成第2个数字
            isGameOver = false;         // 将游戏状态设置为开始
        }
        function go_on() {
            view.go_on();
        }
        $('#' + prefix + '_restart').click(start);                // 为“重新开始”按钮添加单击事件
        $('#' + prefix + '_continue').click(go_on);                // 为“继续游戏”按钮添加单击事件
        start();                        // 开始游戏
    };
    window['Game2048'] = Game2048;
}) (window, document, jQuery);

function View(prefix, len,size, margin) {
    this.prefix = prefix;
    this.len = len;
    this.size = size;
    this.margin = margin;
    this.container = $('#' + prefix + "-container");
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
        delete this.nums[fromIndex];           // 删除原位置的对象，为undefined
        var prefix = this.prefix + '-num-';
        var pos = {top: this.getPos(to.x), left: this.getPos(to.y)};
        this.nums[toIndex].finish().animate(pos, 200, function(){
            if (to.num > from.num) {           // 判断数字是否合并（合并后to.num大于from.num)
                clean.remove();
                $(this).text(to.num).removeClass(prefix + from.num).addClass(prefix + to.num);
            }
        });
    },
    updateScore: function(score) {
        $('#game_score').text(score);
    },
    win:  function() {
        // 添加提示信息
        $('#' + this.prefix + '_over_info').html('<p>您获胜了！</p><p>本次得分：</p><p>' + score + '</p>');       
        $('#' + this.prefix + '_over').removeClass(this.prefix + '-hide');          // 移除隐藏样式，显示提示信息
    },
    over: function(score) {
        $('#' + this.prefix + '_over_info').html('<p>本次得分: </p><p>' + score + '</p>');
        $('#' + this.prefix + '_continue').remove();
        $('#' + this.prefix + '_over').removeClass(this.prefix + '-hide');
    },
    go_on: function() {
        $('#' + this.prefix + '_over').addClass(this.prefix + '-hide');
    },
    cleanNum: function() {
        this.nums = {};           // 清空this.nums中保存的所有数字单元格对象
        $('#' + this.prefix + '_over').addClass(this.prefix + '-hide');          // 隐藏游戏结束时的提示信息
        $('.' + this.prefix + '-num').remove();         //移除页面中的所有数字单元格
    }
};

function Board(len) {
    this.len = len;
    this.arr = [];
    this.score = 0;
    this.key = 0;
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
        this.score = 0;
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
    canMove: function() {               // 当可以合并或有空格时，游戏仍继续
        for(var x = 0, arr = this.arr, len = arr.length; x < len; x++) {
            for(var y = 0; y < len; y++) {
                if(arr[x][y] === 0) {
                    return true;
                }
                var curr = arr[x][y], right = arr[x][y + 1];
                var down = arr[x + 1] ? arr[x + 1][y] : null;
                if(right ===curr || down === curr) {
                    return true;
                }
            }
        }
        return false;
    },
    moveDirection: function(horz, vert) {
        var moved = false, arr_curcell;
        var arr = this.arr, len = this.arr.length;
        for( var x = 0; x < len; x++) {
            var y = vert > 0 ? 0 : (len - 1); 
            for( ;vert > 0 ? y < len - 1 : y > 0; y = y + 1 * vert) {
                for( var next = y + 1 * vert; vert > 0 ? next < len  : next >= 0; next = next + 1 * vert) {
                    arr_curcell = horz > 0 ? arr[x][next] : arr[next][x];
                    if(arr_curcell === 0){
                        continue;
                    }
                    if(horz > 0 ? arr[x][y] === 0 : arr[y][x] === 0) {
                        if(horz > 0) {
                            arr[x][y] = arr_curcell;
                        }else {
                            arr[y][x] = arr_curcell;
                        };
                        horz > 0 ? this.onMove({from: {x: x, y: next, num: arr_curcell}, to: {x: x, y: y, num: arr[x][y]}}) : this.onMove({from: {x: next, y: x, num: arr_curcell}, to: {x: y, y: x, num: arr[y][x]}});
                        console.log('x', x, "y", y);
                        if(horz > 0) {
                            arr[x][next] = 0;
                        }else {
                            arr[next][x] = 0;
                        };
                        moved = true;
                        y = y - 1 * vert;   
                    }else if (horz > 0 ? arr[x][y] === arr_curcell : arr[y][x] === arr_curcell) {
                        if(horz > 0) {
                            arr[x][y] *= 2;
                        }else{
                            arr[y][x] *= 2;
                        }
                        horz > 0 ? this.onMove({from: {x: x, y: next, num: arr_curcell}, to: {x: x, y: y, num: arr[x][y]}}) : this.onMove({from: {x: next, y: x, num: arr_curcell}, to: {x: y, y: x, num: arr[y][x]}});
                        console.log('x', x, "y", y);
                        if(horz > 0) {
                            arr[x][next] = 0;
                        }else {
                            arr[next][x] = 0;
                        };
                        moved = true;
                    };
                    break;
                }   
            }
        }
        this.onMoveComplete({moved: moved});
    }
};
