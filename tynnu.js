﻿/*    __         __   ___      ___   __
     |  |       |  |  \  \    /  /  |  |
     |  |       |  |   \  \  /  /   |  |
     |  |____   |  |    \  \/  /    |  |
     |_______|  |__|     \____/     |__|
        HAND CODED BY LIVINGSTON SAMUEL
*/
/*! tynnu.js

  @author - Livingston Samuel
  @version - 0.5a
*/

(function (window, document) {
  var body = document.body,
      gridH = body.clientHeight,
      gridW = body.clientWidth,
      gew = 10,
      canvas = document.createElement('canvas'),
      canvas2 = document.createElement('canvas'),
      context = canvas.getContext('2d'),
      context2 = canvas.getContext('2d'),
      n_x = parseInt(gridH/gew, 10) + 1,
      n_y = parseInt(gridW/gew, 10) + 1,
      Brush = {
        brush: "blocks",
        set: function (brush) {
          this.brush = (brush in Brushes)? brush : "blocks";
        },
        draw: function (x, y) {
          Brushes[this.brush](x, y);

          Brush.update();
        },
        begin: function (x, y) {
          Brushes.prevX = Brushes.X = x;
          Brushes.prevY = Brushes.Y = y;
        },
        update: function () {
          Brushes.prevX = Brushes.X;
          Brushes.prevY = Brushes.Y;
        },
        stop: function () {
          Brushes.points = [];
          context2.save();
        }
      },
      Brushes = {
        points: [],
        blocks: function (x, y) {
          x = roundTo(x, gew);
          y = roundTo(y, gew);

          context2.beginPath();
          context2.fillStyle = 'rgba(6,100,195, 0.5)';
          context2.rect(x,y, gew, gew);
          context2.fill();
        },
        line: function (x, y) {
          this.X = x;
          this.Y = y;
          context2.beginPath();
          context2.lineWidth = 2;
          context2.lineJoin = 'round';
          context2.strokeStyle = 'rgba(6,100,195, 1)';
          context2.moveTo(this.prevX, this.prevY);
          context2.lineTo(x, y);
          context2.stroke();
        },
        curvy: function (x, y) { //based on https://gist.github.com/339070 by Matthew Taylor (rhyolight)
          var dist = 20, point, l, p = this.points,
              moveTo = CanvasRenderingContext2D.prototype.moveTo,
              bezierCurveTo = CanvasRenderingContext2D.prototype.bezierCurveTo;

          context2.beginPath();
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

          context2.strokeStyle = "rgba(6, 100, 195, 1)";
          context2.beginPath();

          point = getPoint();
          moveTo.apply(context2, point);
          context2.bezierCurveTo(point[0], point[1], point[0], point[1], x, y);
          context2.stroke();
        }
      },
      handleTouchDraw = function () {
        var l = event.changedTouches.length, x ,y;

        while (l--) {
          x = event.changedTouches[l].clientX;
          y = event.changedTouches[l].clientY;
          Brush.draw(x, y);
        }
        event.preventDefault();
      },
      handleMouseDraw = function (e) {
        Brush.draw(e.x, e.y);
        e.preventDefault();
      },
      roundTo = function (n, x) {
        var i = x/2,
            j = n%x,
            k = j>i? (x-j):(j*-1);
        return (n + k)
      }, t;

  canvas.width = gridW;
  canvas.height = gridH;
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.zIndex = '1000000';
  context.lineWidth = 0.3;
  context.strokeStyle = 'rgba(0, 0, 0, 0.5)';

  canvas2.width = gridW;
  canvas2.height = gridH;
  canvas2.style.position = 'absolute';
  canvas2.style.top = '0';
  canvas2.style.left = '0';
  canvas2.style.zIndex = '1000001';

  context.beginPath();

  while (n_x--) {
    t = n_x * gew;
    context.moveTo(0, t);
    context.lineTo(gridW, t);
  }

  while (n_y--) {
    t = n_y * gew;
    context.moveTo(t, 0);
    context.lineTo(t, gridH);
  }

  context.stroke();
  context.fill();
  context.save();

  if ("createTouch" in document) {
    canvas2.addEventListener('touchstart', function (e) {
      handleTouchDraw();
      canvas2.addEventListener('touchmove', handleTouchDraw, false);
    }, false);
    canvas2.addEventListener('touchend', function (e) {
      canvas2.removeEventListener('mousemove', handleTouchDraw, false);
    }, false);
  } else {
    canvas2.addEventListener('mousedown', function (e) {
      Brush.begin(event.x, event.y);
      handleMouseDraw(e||event);
      canvas2.addEventListener('mousemove', handleMouseDraw, false);
    }, false);
    canvas2.addEventListener('mouseup', function (e) {
      Brush.stop();
      canvas2.removeEventListener('mousemove', handleMouseDraw, false);
    }, false);
    body.addEventListener('mouseout', function (e) {
      canvas2.removeEventListener('mousemove', handleMouseDraw, false);
    }, false);
  }

  body.appendChild(canvas);
  body.appendChild(canvas2);
  window.B = Brush;
}(window, document));