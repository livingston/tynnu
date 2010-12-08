/*    __         __   ___      ___   __
     |  |       |  |  \  \    /  /  |  |
     |  |       |  |   \  \  /  /   |  |
     |  |____   |  |    \  \/  /    |  |
     |_______|  |__|     \____/     |__|
        HAND CODED BY LIVINGSTON SAMUEL
*/
/*! tynnu.js

  @author - Livingston Samuel
  @version - 0.7
  @source - https://github.com/livingston/tynnu
*/

(function (window, document) {
  var body = document.body,
      gridH = body.clientHeight,
      gridW = body.clientWidth,
      gew = 10,
      canvas = document.createElement('canvas'),
      context = canvas.getContext('2d'),
      isTouchDevice = ("createTouch" in document),
      deviceType = isTouchDevice? 'touch' : 'mouse',
      n_x = parseInt(gridH/gew, 10) + 1,
      n_y = parseInt(gridW/gew, 10) + 1,
      Brush = {
        brush: "blocks",
        set: function (brush, ctx) {
          this.brush = (brush in Brushes)? brush : "blocks";
          this.ctx = ctx;
        },
        draw: function (x, y) {
          Brushes[this.brush](x, y);

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
        blocks: function (x, y) {
          x = roundTo(x, gew);
          y = roundTo(y, gew);

          Brush.ctx.beginPath();
          Brush.ctx.fillStyle = 'rgba(6,100,195, 0.5)';
          Brush.ctx.rect(x,y, gew, gew);
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
      roundTo = function (n, x) {
        var i = x/2,
            j = n%x,
            k = j>i? (x-j):(j*-1);
        return (n + k)
      }, t,
      Grid = function (ctx, type, w, h, options) {
        this.context = ctx;
        this.h = h || document.body.clientHeight;
        this.w = w || document.body.clientWidth;

        this.set(type);
        this.draw(options);
      };

      Grid.prototype.get = function (w) {
        return this[w] || null;
      };

      Grid.prototype.update = function (type, options) {
        this.clear();
        this.set(type);
        this.draw(options);
      };

      Grid.prototype.clear = function () {
        this.context.clearRect(0, 0, gridW, gridH);
      };

      Grid.prototype.set = function (type) {
        this.type = (type || 'lines');
      };

      Grid.prototype.draw = function (options) {
        var ctx = this.context,
            orig_strokeStyle = ctx.strokeStyle,
            orig_lineWidth = ctx.lineWidth;
        ctx.beginPath();

        Grid.types[this.type](ctx, this, options);

        ctx.save();
        ctx.strokeStyle = orig_strokeStyle;
        ctx.lineWidth = orig_lineWidth;
      };

      Grid.types = {};
      Grid.addType = function (name, fn) {
        Grid.types[name] = fn;
      };

      Grid.addType('lines', function (ctx, grid) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 0.3;

        while (n_x--) {
          t = n_x * gew;
          ctx.moveTo(0, t);
          ctx.lineTo(grid.get('w'), t);
        }

        while (n_y--) {
          t = n_y * gew;
          ctx.moveTo(t, 0);
          ctx.lineTo(t, grid.get('h'));
        }

        ctx.stroke();
        ctx.fill();
      });

      Grid.addType('dotted', function (ctx, grid, options) {
        var n, s = 2,
            getStep = (function () {
              if (options && options.rand) {
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

        while (n_x--) {
          n = 0;
          t = n_x * gew;
          while (n <= grid.get('w')) {
            ctx.moveTo(getStep(), t);
            ctx.lineTo(getStep(), t);
          }
        }

        while (n_y--) {
          n = 0;
          t = n_y * gew;
          while (n <= grid.get('h')) {
            ctx.moveTo(t, getStep());
            ctx.lineTo(t, getStep());
          }
        }

        ctx.stroke();
        ctx.fill();
      });

  canvas.width = gridW;
  canvas.height = gridH;
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.zIndex = '1000000';

  body.appendChild(canvas);
  window.B = Brush;

  var Tynnu = function (root, options) {
    this.root = root = (root && root.nodeType == 1) ? root : document.body;
    if ( root.hasAttribute('hasTynnu') ) { throw new Error('Tynnu is already defined under this root element'); }

    root.setAttribute('hasTynnu', true);
    this.id = 'TYNNU_' + (+new Date());

    this.setup();
  };

  Tynnu.prototype.setup = function () {
    var canvas = this.canvas = document.createElement('canvas'),
        root = this.root;

    canvas.width = this.width = root.clientWidth;
    canvas.height = this.height = root.clientHeight;
    canvas.id = this.id;
    canvas.style.left = 0;
    canvas.style.top = 0;
    canvas.style.position = 'absolute';
    canvas.style.zIndex = '1000010';

    this.root.tynnu = this.canvas.tynnu = this;
    this.ctx = canvas.getContext('2d');

    this.root.appendChild(canvas);
    Brush.set('line', this.ctx);
    this.bind();
  };

  Tynnu.prototype.draw = function (x, y) {
    Brush.draw(x, y);
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
    console.log('BIND::PAINT ', event.target, event.type, _TYNNU);
    Brush.begin(event.x, event.y);
    _TYNNU.handleDraw(event);
    _TYNNU.canvas.addEventListener('mousemove', _TYNNU.handleDraw, false);
  };

  Tynnu.prototype.unbindPaint = function () {
    var _TYNNU = this.tynnu;
    console.log('UNBIND::PAINT', event.target, event.type, _TYNNU, _TYNNU.canvas);
    Brush.stop();
    _TYNNU.canvas.removeEventListener('mousemove', _TYNNU.handleDraw, false);
  };

  Tynnu.prototype.bind = function () {
    var _TYNNU = this, canvas = _TYNNU.canvas;
  console.log('BIND ', this, this.canvas);
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
    this.root.tynnu = NULL;
    root.removeChild(this.canvas);
    root.removeAttribue('hasTynnu');
    this.root = root = NULL;
    this.canvas = NULL;
  };

  this.t = new Tynnu(document.body);

  var grid = new Grid(context, 'dotted', null, null, {rand:true});
  window.g = grid;
}(window, document));