/*************************************************************************
    > File Name: AutoPlay.js
    > Author: Netcan
    > Blog: http://www.netcan666.com
    > Mail: 1469709759@qq.com
    > Created Time: 2019-11-07 22:14
************************************************************************/

(function(window, $) {
    window['AutoPlay'] = function AutoPlay(board) {
        function rotation(cell) {
            cell.reverse();
            for (var j = 0; j < cell.length; ++j) {
                for (var i = 0; i < j; ++i) {
                    [cell[i][j], cell[j][i]] = [cell[j][i], cell[i][j]]
                }
            }
        }
        // direction: 0: 左 1: 下 2: 右 3: 上
        function move(cell, direction) {
            for (var i = 0; i < direction; ++i)
                rotation(cell);
            var score = 0;
            for (var j = 0; j < cell.length; ++j) {
                for (var i = 0; i < cell[j].length; ++i) {
                    if (cell[j][i] == 0) { continue; }
                    var k = i - 1;
                    while (k >= 0 && cell[j][k] == 0) { --k; }
                    if (k < 0) {
                        [cell[j][0], cell[j][i]] = [cell[j][i], cell[j][0]];
                    } else {
                        if (cell[j][k] == cell[j][i]) {
                            score += cell[j][k] * 2;
                            cell[j][k] *= 2;
                            cell[j][i] = 0;
                        } else {
                            [cell[j][k+1], cell[j][i]] = [cell[j][i], cell[j][k+1]];
                        }
                    }
                }
            }

            for (var i = 0; i < 4 - direction; ++i)
                rotation(cell);
            return score;
        }
        function strageScore(now) {
            var cnt = 0;
            for (var j = 0; j < now.length; ++j) {
                for (var i = 1; i < now[j].length; ++i) {
                    if (now[j][i] <= now[j][i - 1]) {
                        ++cnt;
                    }
                }
            }
            return 0;
        }

        setInterval(function() {
            const direction2keycode = [37, 40, 39, 38];
            var score_table = [];
            for (var direction = 0; direction < 4; ++direction) {
                var cell = board.arr.map(line => line.slice());
                score_table.push({
                    score: move(cell, direction),
                    strageScore: strageScore(cell),
                    keyCode: direction2keycode[direction],
                });
            }
            score_table.sort(function(lhs, rhs) {
                if (lhs.score == rhs.score) { return rhs.strageScore - lhs.strageScore; }
                return rhs.score - lhs.score;
            });
            const ke = new KeyboardEvent("keydown", {
                bubbles: true, cancelable: true, keyCode: score_table[0].keyCode
            });
            document.body.dispatchEvent(ke);
            console.log(score_table);
        }, 20);
    }
})(window, jQuery);
