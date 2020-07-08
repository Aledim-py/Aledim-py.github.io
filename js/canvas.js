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

/* 
   Отрисовка графа, сторон и фона
*/
const Render = {
    graph: function(nodes, links) {
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
                var i0 = link.first,
                    i1 = link.second;
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
    },

    citizens: function(people) {
        if (Data.citizens === 'null') return;
        let elements = document.querySelectorAll("div.friends-list__item > img.friends-list__item-img");
        for (let i = 0; i < 5; ++i) {
            //elements[i].src = anonymous[i]['photo'];
            elements[i + 5].src = people[i]['photo'];
        }
    },

    background: function() {
        let NUM_PARTICLES = 300,
            MAX_SPEED = 0.6,
            particles = [],
            imageData,
            pixels,

            w = window.innerWidth,
            h = window.innerHeight,

            mouse = {
                x: 0,
                y: 0
            },

            canvasParticles = document.querySelector('.js-canvas-particles'),
            ctxParticles = canvasParticles.getContext('2d');

        init();

        function init() {
            initEvents();
            initStage();

            run();
        }

        function initEvents() {
            window.addEventListener('resize', initStage);
            document.addEventListener('mousemove', onMouseMove);
        }

        function initStage() {
            w = window.innerWidth;
            h = window.innerHeight;

            canvasParticles.setAttribute('width', w);
            canvasParticles.setAttribute('height', h);

            initParticles();
        }

        function onMouseMove(e) {
            mouse = {
                x: e.clientX,
                y: e.clientY
            };
        }

        function initParticles() {
            particles = [];

            var i = NUM_PARTICLES,
                p,
                x, y, velX, velY, r;

            while (i--) {
                x = randomBetween(0, w);
                y = randomBetween(0, h);
                r = randomBetween(1, 3);

                velX = randomBetween(-MAX_SPEED, MAX_SPEED);
                velY = randomBetween(-MAX_SPEED, MAX_SPEED);

                p = new Particle(x, y, velX, velY, r);
                particles.push(p);
            }
        }

        function Particle(x, y, velX, velY, r) {
            this.x = x;
            this.y = y;
            this.velX = velX;
            this.velY = velY;
            this.radius = r;

            this.update = function () {
                this.x += this.velX;
                this.y += this.velY;

                this.x = Math.round(this.x);
                this.y = Math.round(this.y);

                if (this.x <= 0 || this.x >= w) {
                    this.velX = -this.velX;
                }

                if (this.y <= 0 || this.y >= h) {
                    this.velY = -this.velY;
                }
            };


            this.distanceTo = function (p) {
                var dx = p.x - this.x,
                    dy = p.y - this.y;

                return Math.sqrt(dx * dx + dy * dy);
            };

            this.getIndex = function () {
                return ((this.x | 0) + (this.y | 0) * w) * 4;
            };
        }

        function run() {
            window.requestAnimationFrame(run);

            ctxParticles.clearRect(0, 0, w, h);

            var i = particles.length,
                distance,
                distanceMouse,
                q,
                p1,
                p2;

            while (i--) {
                p1 = particles[i];
                p1.update();

                ctxParticles.beginPath();
                ctxParticles.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctxParticles.arc(p1.x, p1.y, p1.radius, 0, 2 * Math.PI, false);
                ctxParticles.fill();
                ctxParticles.closePath();

                distanceMouse = p1.distanceTo(mouse);

                if (distanceMouse <= w * 0.2) {
                    connect(p1, mouse);
                }

                for (q = 0; q < particles.length; q++) {
                    p2 = particles[q];
                    distance = p2.distanceTo(p1);

                    if (p2 !== p1 && distance <= w * 0.05) {
                        connect(p1, p2);
                    }
                }
            }
        }

        function connect(p1, p2) {
            ctxParticles.beginPath();
            ctxParticles.strokeStyle = 'rgba(255, 255, 255, 0.2)';

            ctxParticles.moveTo(p1.x, p1.y);
            ctxParticles.lineTo(p2.x, p2.y);
            ctxParticles.stroke();
            ctxParticles.closePath();
        }

        function randomBetween(min, max, round) {
            var rand = Math.random() * (max - min + 1) + min;
            if (round === true) {
                return Math.floor(rand);
            } else {
                return rand;
            }
        }
    }
};