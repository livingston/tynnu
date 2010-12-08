/*    __         __   ___      ___   __
     |  |       |  |  \  \    /  /  |  |
     |  |       |  |   \  \  /  /   |  |
     |  |____   |  |    \  \/  /    |  |
     |_______|  |__|     \____/     |__|
        HAND CODED BY LIVINGSTON SAMUEL
*/
/*! tynnu.js

  @author - Livingston Samuel
  @version - 0.8
  @source - https://github.com/livingston/tynnu
*/

(function (window, document) {
  var isTouchDevice = ("createTouch" in document),
      deviceType = isTouchDevice? 'touch' : 'mouse',
      Helper = {
        roundTo: function (n, x) {
          var i = x/2,
              j = n%x,
              k = j>i? (x-j):(j*-1);
          return (n + k)
        },
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
      },
      Brush = {
        brush: "blocks",
        set: function (brush, ctx) {
          this.brush = (brush in Brushes)? brush : "blocks";
          this.ctx = ctx;
        },
        draw: function (x, y, options) {
          Brushes[this.brush](x, y, options);

          Brush.update();
        },
        begin: function (x, y) {
          this.X = x;
          this.Y = y;
          this.update();
        },
        update: function () {
          this.prevX = this.X;
          this.prevY = this.Y;
        },
        stop: function () {
          Brush.points = [];
          this.ctx.save();
        },
        points: []
      },
      Brushes = {
        blocks: function (x, y, options) {
          var size = (options && options.size) || 10;
          x = Helper.roundTo(x, size);
          y = Helper.roundTo(y, size);

          Brush.ctx.beginPath();
          Brush.ctx.fillStyle = 'rgba(6,100,195, 0.5)';
          Brush.ctx.rect(x,y, size, size);
          Brush.ctx.fill();
        },
        line: function (x, y) {
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
        circles: function (x, y) {
          Brush.X = x;
          Brush.Y = y;
          Brush.ctx.beginPath();
          Brush.ctx.fillStyle = 'rgba(6,100,195, 0.5)';
          Brush.ctx.moveTo(Brush.prevX, Brush.prevY);
          Brush.ctx.arc(x, y, gew, 0, 359, false);
          Brush.ctx.fill();
        },
        curvy: function (x, y) { //based on https://gist.github.com/339070 by Matthew Taylor (rhyolight)
          var dist = 10, point, l, p = Brush.points,
              moveTo = CanvasRenderingBrush.ctxD.prototype.moveTo,
              bezierCurveTo = CanvasRenderingBrush.ctxD.prototype.bezierCurveTo;

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
        }
      },
      Grid = function (options) {
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

    root.style.position = 'relative';
    canvas.width = this.width = root.clientWidth;
    canvas.height = this.height = root.clientHeight;
    canvas.id = this.id;
    canvas.style.left = 0;
    canvas.style.top = 0;
    canvas.style.position = 'absolute';
    canvas.style.zIndex = '10010';

    this.root.tynnu = this.canvas.tynnu = this;
    this.ctx = canvas.getContext('2d');

    this.grid = new Grid({ root: root, type: 'dotted', rand: true, size: _OPT.size });

    this.root.appendChild(canvas);
    Brush.set('line', this.ctx);
    this.bind();
  };

  Tynnu.prototype.draw = function (x, y) {
    Brush.draw(x, y, this.options);
  };

  Tynnu.prototype.handleDraw = (function () {
    if (isTouchDevice) {
      return function () {
        var l = event.changedTouches.length, x ,y,
            _TYNNU = event.target.tynnu;

        while (l--) {
          x = event.changedTouches[l].clientX;
          y = event.changedTouches[l].clientY;
          _TYNNU.draw(x, y);
        }
        _TYNNU = null;
        event.preventDefault();
      }
    } else {
      return function (e) {
        e.target.tynnu.draw(e.x, e.y);
        e.preventDefault();
      }
    }
  }());

  Tynnu.prototype.bindPaint = function () {
    var _TYNNU = this.tynnu;

    Brush.begin(event.x, event.y);
    _TYNNU.handleDraw(event);
    _TYNNU.canvas.addEventListener('mousemove', _TYNNU.handleDraw, false);
  };

  Tynnu.prototype.unbindPaint = function () {
    var _TYNNU = this.tynnu;

    Brush.stop();
    _TYNNU.canvas.removeEventListener('mousemove', _TYNNU.handleDraw, false);
  };

  Tynnu.prototype.bind = function () {
    var _TYNNU = this, canvas = _TYNNU.canvas;

    canvas.addEventListener('mousedown', _TYNNU.bindPaint, false);
    canvas.addEventListener('mouseup', _TYNNU.unbindPaint, false);
    _TYNNU.root.addEventListener('mouseout', _TYNNU.unbindPaint, false);
  };

  Tynnu.prototype.unbind = function () {
    var _TYNNU = this, canvas = _TYNNU.canvas;

    _TYNNU.unbindPaint();
    canvas.removeEventListener('mousedown', _TYNNU.bindPaint, false);
    canvas.removeEventListener('mouseup', _TYNNU.unbindPaint, false);
    _TYNNU.root.removeEventListener('mouseout', _TYNNU.unbindPaint, false);
  };

  Tynnu.prototype.destroy = function () {
    var NULL = null, root = this.root;
    this.unbind();
    root.tynnu = this.canvas.tynnu = NULL;
    root.removeChild(this.canvas);
    root.removeAttribue('hasTynnu');
    this.root = root = NULL;
    this.canvas = NULL;
  };

  this.t = new Tynnu(document.body);
}(window, document));