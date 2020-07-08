var NUM_PARTICLES = 300,
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