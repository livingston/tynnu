﻿/*    __         __   ___      ___   __
     |  |       |  |  \  \    /  /  |  |
     |  |       |  |   \  \  /  /   |  |
     |  |____   |  |    \  \/  /    |  |
     |_______|  |__|     \____/     |__|
        HAND CODED BY LIVINGSTON SAMUEL
*/
/*! tynnu.js

  @author - Livingston Samuel
  @version - 0.2
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
      handleDraw = function (x, y) {
          x = roundTo(x, gew),
          y = roundTo(y, gew);

        context2.beginPath(x, y);
        context2.fillStyle = 'rgba(6,100,195, 0.5)';
        context2.rect(x,y, gew, gew);
        context2.fill();
        context2.save();
      },
      handleTouchDraw = function () {
        var x = event.changedTouches[0].clientX,
            y = event.changedTouches[0].clientY;
        handleDraw(x, y);
        event.preventDefault();
      },
      handleMouseDraw = function (e) {
        e = e || event;
        handleDraw(e.x, e.y);
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

  context.beginPath(0, 0);

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
      handleMouseDraw(e||event);
      canvas2.addEventListener('mousemove', handleMouseDraw, false);
    }, false);
    canvas2.addEventListener('mouseup', function (e) {
      canvas2.removeEventListener('mousemove', handleMouseDraw, false);
    }, false);
    body.addEventListener('mouseout', function (e) {
      canvas2.removeEventListener('mousemove', handleMouseDraw, false);
    }, false);
  }

  body.appendChild(canvas);
  body.appendChild(canvas2);
}(window, document));