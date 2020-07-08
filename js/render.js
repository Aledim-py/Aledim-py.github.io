CanvasRenderingContext2D.prototype.drawRoundedImage = function(image, radius, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {

    var x = dx || sx;
    var y = dy || sy;
    var width =  dWidth || sWidth || image.naturalWidth;
    var height = dHeight || sHeight || image.naturalHeight;
    var r = {topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0};

    if (!Array.isArray(radius)) {
        radius = [radius];
    }

    r.topLeft = radius[0];
    r.topRight = radius[1] || (radius[1] === undefined) * radius[0];
    r.bottomRight = radius[2] || (radius[2] === undefined) * radius[0];
    r.bottomLeft = radius[3] || (radius[3] === undefined) * (radius[1] || (radius[1] === undefined) * radius[0]);

    this.beginPath();
    this.arc(x + r.topLeft, y + r.topLeft, r.topLeft, Math.PI, Math.PI + Math.PI / 2);
    this.lineTo(x + width - r.topRight, y);
    this.arc(x + width - r.topRight, y + r.topRight, r.topRight, Math.PI + Math.PI/2, Math.PI*2);
    this.lineTo(x + width, y + height - r.bottomRight);
    this.arc(x + width - r.bottomRight, y + height - r.bottomRight, r.bottomRight, Math.PI*2, Math.PI/2);
    this.lineTo(x + r.bottomLeft, y + height);
    this.arc(x + r.bottomLeft, y + height - r.bottomLeft, r.bottomLeft, Math.PI/2, Math.PI);
    this.closePath();
    this.save();
    this.clip();

    switch(true) {
        case arguments.length > 6:
            this.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);            
        break;

        case arguments.length > 4:
            this.drawImage(image, sx, sy, sWidth, sHeight);         
        break;

        default:
            this.drawImage(image, sx, sy);          
        break;
    }

    this.restore();
}

function renderGraph(nodes, links) {
  // nodes - Массив узлов, каждый узел задается объектом с координатами и id картинки для отображения.
  // links - Массив связей между узлами. Каждый элемент это массив из двух элементов - индексов узлов.

  var canvas,
    ctx,
    nodes,
    links,
    render,
    getMousePosFromEvent,
    getNodeByPos,
    dragNode,
    dragPoint;

  canvas = document.getElementById('graph');
  canvas.width = window.innerWidth * 0.7;
  canvas.height = window.innerHeight * 0.7;
  ctx = canvas.getContext('2d');

  // Отрисовка канвы.
  render = function() {

    // Очищаем канву.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем связи между узлами (раньше чем сами узлы, чтобы они отображались позади узлов).
    links.forEach(function(link) {
      var i0 = link[0],
        i1 = link[1];
      ctx.strokeStyle = '#C549E6';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(nodes[i0].x, nodes[i0].y);
      ctx.lineTo(nodes[i1].x, nodes[i1].y);
      ctx.stroke();
    });

    // Рисуем узлы.
    nodes.forEach(function(node) {
      var img = document.getElementById(node.id),
        halfWidth = img.naturalWidth / 2,
        halfHeight = img.naturalHeight / 2;
      ctx.drawRoundedImage(img, 30, node.x - halfWidth, node.y - halfHeight);
      //ctx.drawImage(img, node.x - halfWidth, node.y - halfHeight);
    });
  };

  // Получает из события мыши координаты, относительно левого верхнего угла канвы.
  getMousePosFromEvent = function(evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  };

  // Находит узел, находящийся по заданой координате на канве.
    getNodeByPos = function(pos) {
        var result;

        nodes.forEach(function(node) {
            var img = document.getElementById(node.id),
                halfWidth = img.naturalWidth / 2,
                halfHeight = img.naturalHeight / 2;
            if ((pos.x >= node.x - halfWidth)
                && (pos.x < node.x + halfWidth)
                && (pos.y >= node.y - halfHeight)
                && (pos.y < node.y + halfHeight)) {
            result = node;
          }
        });

        return result;
      };

      // При нажатии кнопки мыши находим узел по которому было нажатие,
      // запоминаем его в dragNode для дальнейшего использования,
      // в dragPoint запоминаем по какому месту узла была нажата кнопка мыши.
    canvas.addEventListener('mousedown', function(event) {
        var pos = getMousePosFromEvent(event);
        dragNode = getNodeByPos(pos);
        if (dragNode !== undefined) {
          dragPoint = {
            x: pos.x - dragNode.x,
            y: pos.y - dragNode.y
          }
        }
    }, false);

    // При отпускании кпнопки мыши забываем текущий перетаскиваемый узел.
    canvas.addEventListener('mouseup', function() {
        dragNode = undefined;
    }, false);

    // При движении мыши, если есть перетаскиваемый узел, двигаем его и перерисовываем канву.
    canvas.addEventListener('mousemove', function(event) {
        var pos;
        if (dragNode !== undefined) {
            pos = getMousePosFromEvent(event);
            dragNode.x = pos.x - dragPoint.x;
            dragNode.y = pos.y - dragPoint.y;
            render();
        }
    }, false);

    render();
}

function renderSides(anonymous, citizens) {
    //Меняем картинки массово.
    return;
}