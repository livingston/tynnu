/*    __         __   ___      ___   __
     |  |       |  |  \  \    /  /  |  |
     |  |       |  |   \  \  /  /   |  |
     |  |____   |  |    \  \/  /    |  |
     |_______|  |__|     \____/     |__|
        HAND CODED BY LIVINGSTON SAMUEL
*/
/*! tynnu.js

  @author - Livingston Samuel
  @version - 0.9f
  @source - https://github.com/livingston/tynnu
*/

(function (window, document) {
  var Helper = {
    extend: function (what, wit) {
      var ext = {}, name;

      for (name in wit) {
        ext[name] = wit[name];
      }
      for (name in what) {
        ext[name] = ext[name]? ext[name] : what[name];
      }

      return ext;
    }
  };

  var Brush = function (options) {
    var defaults = { drawEdges: false, brush: "blocks", context: null, edgeBuffer: 0 };

    this.options = Helper.extend(defaults, options);
    this.ctx = this.options.context;
    this.points = [];
  };

  Brush.prototype.set = function (brush) {
    this.options.brush = (brush in Brushes)? brush : "blocks";
  };

  Brush.prototype.draw = function (x, y, options) {
    this.xy.x.push(x);
    this.xy.y.push(y);
    Brushes[this.options.brush](this, x, y, options);

    this.update();
  };

  Brush.prototype.begin = function (x, y) {
    this.X = x;
    this.Y = y;
    this.xy = { x:[x], y:[y] };
    this.update();
  };

  Brush.prototype.update = function () {
    this.prevX = this.X;
    this.prevY = this.Y;
  };

  Brush.prototype.stop = function (e, callback) {
    this.points = [];

    if (this.options.drawEdges) this.detectEdge.apply(this, arguments);
    this.xy = { x:[], y:[] };

    this.ctx.save();
  };

  Brush.prototype.detectEdge = function (e, callback) {
    var xy = this.xy,
        x = xy.x,
        y = xy.y,
        edgeBuffer = this.options.edgeBuffer,
        sortFn = function (a, b) { return a-b },
        sortedX = x.sort(sortFn),
        sortedY = y.sort(sortFn),
        minX = sortedX.shift() - edgeBuffer,
        maxX = sortedX.pop() + edgeBuffer,
        minY = sortedY.shift() - edgeBuffer,
        maxY = sortedY.pop() + edgeBuffer,
        context = this.ctx, edges;

    context.beginPath();

    context.moveTo(minX, minY);
    context.lineTo(minX, minY);
    context.lineTo(maxX, minY);
    context.lineTo(maxX, maxY);
    context.lineTo(minX, maxY);

    context.closePath();

    context.strokeStyle = '#ff0000';
    context.lineWidth = 0.5;

    context.stroke();

    edges = [ minX, minY, Math.max(maxX-minX, 1), Math.max(maxY-minY, 1)];
    callback && callback.apply(this.ctx, [this.ctx, edges].concat([].slice.call(arguments, 2)));

    return edges;
  };

  var Brushes = {
    blocks: function (Brush, x, y, options) {
      var size = (options && options.size) || 10,
          roundTo = function (n, x) {
            var i = x/2,
                j = n%x,
                k = j>i? (x-j): -j;
            return (n + k)
          },
          x = roundTo(x, size);
          y = roundTo(y, size);

      Brush.ctx.beginPath();
      Brush.ctx.fillStyle = 'rgba(6,100,195, 0.5)';
      Brush.ctx.rect(x,y, size, size);
      Brush.ctx.fill();
      Brush.options.edgeBuffer = size;
    },
    line: function (Brush, x, y) {
      Brush.X = x;
      Brush.Y = y;
      Brush.ctx.beginPath();
      Brush.ctx.lineWidth = 2;
      Brush.ctx.lineJoin = 'round';
      Brush.ctx.strokeStyle = 'rgba(6,100,195,1)';
      Brush.ctx.moveTo(Brush.prevX, Brush.prevY);
      Brush.ctx.lineTo(x, y);
      Brush.ctx.stroke();
    },
    circles: function (Brush, x, y) {
      var rad = Brush.options.rad || 10;
      Brush.X = x;
      Brush.Y = y;
      Brush.ctx.beginPath();
      Brush.ctx.fillStyle = 'rgba(6,100,195, 0.5)';
      Brush.ctx.moveTo(Brush.prevX, Brush.prevY);
      Brush.ctx.arc(x, y, rad, 0, 359, false);
      Brush.ctx.fill();
      Brush.options.edgeBuffer = rad;
    },
    curvy: function (Brush, x, y) { //based on https://gist.github.com/339070 by Matthew Taylor (rhyolight)
      var dist = 10, point, l, p = Brush.points,
          moveTo = CanvasRenderingContext2D.prototype.moveTo;

      Brush.ctx.beginPath();
      p.push([x,y]);
      l = p.length;

      function getPoint(xAgo) {
        var i = l - dist;
        for (;++i < l;) {
            if (p[i]) {
                return p[i];
            }
        }
      }

      Brush.ctx.lineJoin = 'round';
      Brush.ctx.lineWidth = 0.5;
      Brush.ctx.strokeStyle = 'rgba(6,100,195,1)';
      Brush.ctx.beginPath();

      point = getPoint();
      moveTo.apply(Brush.ctx, point);
      Brush.ctx.bezierCurveTo(point[0], point[1], point[0], point[1], x, y);
      Brush.ctx.stroke();
      Brush.options.edgeBuffer = dist;
    }
  };

  var Grid = function (options) {
    var defaults = {
      type: 'lines',
      size: 10,
      root: document.body
    };

    options = Helper.extend(defaults, options);

    options.h = options.root.clientHeight;
    options.w = options.root.clientWidth;
    options.nx = parseInt(options.h/options.size, 10) + 1;
    options.ny = parseInt(options.w/options.size, 10) + 1;

    this.options = options;

    this.setCanvas();
    this.draw();
  };

  Grid.prototype.setCanvas = function () {
    var canvas = document.createElement('canvas'),
        _OPT = this.options;

    canvas.id = 'GRID_' + (+new Date());
    canvas.width = _OPT.w;
    canvas.height = _OPT.h;
    canvas.style.position = 'absolute';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.zIndex = 10000;

    _OPT.root.appendChild(canvas);

    this.options.context = canvas.getContext('2d');
  };

  Grid.prototype.get = function (w) {
    return this.options[w] || null;
  };

  Grid.prototype.update = function (options) {
    this.clear();
    this.options = Helper.extend(this.options, options);
    this.draw();
  };

  Grid.prototype.clear = function () {
    var _OPT = this.options;
    _OPT.context.clearRect(0, 0, _OPT.w, _OPT.h);
  };

  Grid.prototype.set = function (type) {
    this.options.type = (type || 'lines');
  };

  Grid.prototype.draw = function (options) {
    var _OPT = this.options,
        ctx = _OPT.context,
        orig_strokeStyle = ctx.strokeStyle,
        orig_lineWidth = ctx.lineWidth;
    ctx.beginPath();

    Grid.types[_OPT.type](ctx, this, _OPT);

    ctx.save();
    ctx.strokeStyle = orig_strokeStyle;
    ctx.lineWidth = orig_lineWidth;
  };

  Grid.types = {};
  Grid.addType = function (name, fn) {
    Grid.types[name] = fn;
  };

  Grid.addType('lines', function (ctx, grid) {
    var size = grid.get('size'),
        w = grid.get('w'),
        h = grid.get('h'),
        nx = grid.get('nx'),
        ny = grid.get('ny'), t;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 0.3;

    while (nx--) {
      t = nx * size;
      ctx.moveTo(0, t);
      ctx.lineTo(w, t);
    }

    while (ny--) {
      t = ny * size;
      ctx.moveTo(t, 0);
      ctx.lineTo(t, h);
    }

    ctx.stroke();
  });

  Grid.addType('dotted', function (ctx, grid, options) {
    var n, s = 2, t,
        size = grid.get('size'),
        w = grid.get('w'),
        h = grid.get('h'),
        nx = grid.get('nx'),
        ny = grid.get('ny'),
        getStep = (function () {
          if (options.rand) {
            return function () {
              return n = n + (s * Math.random())
            }
          } else {
            return function () {
              return n = n + s
            }
          }
        }());

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 0.3;

    while (nx--) {
      n = 0;
      t = nx * size;
      while (n <= w) {
        ctx.moveTo(getStep(), t);
        ctx.lineTo(getStep(), t);
      }
    }

    while (ny--) {
      n = 0;
      t = ny * size;
      while (n <= h) {
        ctx.moveTo(t, getStep());
        ctx.lineTo(t, getStep());
      }
    }

    ctx.stroke();
    ctx.fill();
  });

  var Tynnu = function (root, options) {
    var defaults = {
      size: 10
    };

    this.root = root = (root && root.nodeType == 1) ? root : document.body;
    if ( root.hasAttribute('hasTynnu') ) { throw new Error('Tynnu is already defined under this root element'); }

    root.setAttribute('hasTynnu', true);
    this.id = 'TYNNU_' + (+new Date());

    this.options = Helper.extend(defaults, options);

    this.setup();
  };

  Tynnu.prototype.setup = function () {
    var canvas = this.canvas = document.createElement('canvas'),
        root = this.root,
        _OPT = this.options;

    canvas.id = this.id;
    root.style.position = 'relative';
    canvas.width = this.width = root.clientWidth;
    canvas.height = this.height = root.clientHeight;
    canvas.style.left = 0;
    canvas.style.top = 0;
    canvas.style.position = 'absolute';
    canvas.style.zIndex = '10010';
    canvas.style.cursor = 'crosshair';

    this.ctx = canvas.getContext('2d');
    this.events = {};

    this.grid = new Grid({ root: root, type: 'dotted', rand: true, size: _OPT.size });
    this.brush = new Brush({ context: this.ctx, drawEdges: true });

    this.root.appendChild(canvas);
    this.brush.set('line');
    this.bind();
  };

  Tynnu.prototype.draw = function (x, y) {
    this.brush.draw(x, y, this.options);
  };

  Tynnu.prototype.handleDraw = (function () {
    if ("createTouch" in document) {
      return function () {
        var _TYNNU = this

        return function () {
          var l = event.changedTouches.length, x ,y,
              offsetLeft = _TYNNU.root.offsetLeft,
              offsetTop = _TYNNU.root.offsetTop;

          while (l--) {
            x = event.changedTouches[l].clientX;
            y = event.changedTouches[l].clientY;
            _TYNNU.draw(x - offsetLeft, y - offsetTop);
          }
          _TYNNU = null;
          event.preventDefault();
        }
      }
    } else {
      return function () {
        var _TYNNU = this, root = _TYNNU.root;

        return function (e) {
          _TYNNU.draw(e.x - root.offsetLeft, e.y - root.offsetTop);
        };
      }
    }
  }());

  Tynnu.prototype.bindPaint = function () {
    var _TYNNU = this,
        root = _TYNNU.root;
    _TYNNU.events['draw'] = _TYNNU.handleDraw();

    return function () {
      _TYNNU.brush.begin(event.x - root.offsetLeft, event.y - root.offsetTop);
      _TYNNU.events['draw'](event);
      _TYNNU.canvas.addEventListener('mousemove', _TYNNU.events['draw'], false);
      _TYNNU.root.addEventListener('mouseout', _TYNNU.events['unbindPaint'], false);
    };
  };

  Tynnu.prototype.unbindPaint = function () {
    var _TYNNU = this;

    return function (e) {
      _TYNNU.brush.stop(e || event);
      _TYNNU.canvas.removeEventListener('mousemove', _TYNNU.events['draw'], false);
      _TYNNU.root.removeEventListener('mouseout', _TYNNU.events['unbindPaint'], false);
    }
  };

  Tynnu.prototype.bind = function () {
    var _TYNNU = this, canvas = _TYNNU.canvas;

    _TYNNU.events['bindPaint'] = _TYNNU.bindPaint();
    _TYNNU.events['unbindPaint'] = _TYNNU.unbindPaint();

    canvas.addEventListener('mousedown', _TYNNU.events['bindPaint'], false);
    canvas.addEventListener('mouseup', _TYNNU.events['unbindPaint'], false);
  };

  Tynnu.prototype.unbind = function () {
    var _TYNNU = this, canvas = _TYNNU.canvas;

    _TYNNU.events['unbindPaint']();
    canvas.removeEventListener('mousedown', this.events['bindPaint'], false);
    canvas.removeEventListener('mouseup', _TYNNU.events['unbindPaint'], false);
  };

  Tynnu.prototype.destroy = function () {
    var NULL = null, root = this.root;
    this.unbind();

    root.removeChild(this.canvas);
    root.removeAttribue('hasTynnu');
    this.root = root = NULL;
    this.canvas = NULL;
  };

  var board = document.getElementById('board');
  board.style.height = (canvasHeight = document.body.clientHeight - document.getElementById('tynnu_toolbar').offsetHeight - 30) + 'px';
  this.t = new Tynnu(board);
}(window, document));