/*
   Данные
*/
const Data = {
    nodes: [],
    anonymous: [],
    citizens: [],
    user: {
        id: 123,
        user_city: 'Any'
    }
};

/*
   Граф/сеть
*/
const Network = {
    nodes: [],
    edges: []
};

/*
    Все элементы
*/
const Selectors = {
    modals: {
        overlay: document.getElementById('overlay'),
        openButtons: document.querySelectorAll('[data-modal-target]'),
        closeButtons: document.querySelectorAll('[data-close-button]'),
        changeCity: document.querySelector('[data-change-city]'),
        answerButton: document.querySelector('[data-answer-button]')
    }
};

/*
   Функционал приложения
*/
const App = {
    /*
       Общение с api сервером
    */
    request: {
        getData: async function() {
            const response = await fetch('/data', {
                method: 'GET'
            });

            if (!response.ok) {
                alert('Не удалось получить данные с сервера, обновите страницу, пожалуйста');
                throw new Error('Got non-2XX response from API server.');
                return;
            }

            const json = await response.json();

            if (json['nodes']) {
                Data.nodes = json['nodes'];

                json['nodes'].forEach(function(element, index) {
                    Network.nodes.push({
                        id: index + 1,
                        shape: 'circularImage',
                        image: element['photo'],
                        label: element['name']
                    });

                    // element['links'].forEach((item, i) => {
                    //     Network.edges.push({
                    //         from: index + 1,
                    //         to: i + 1
                    //     });
                    // });
                });

                for (let i = 2; i <= json['nodes'].length; ++i) {
                    Network.edges.push({
                        from: 1,
                        to: i
                    });
                }
            }

            if (json['anonymous']) Data.anonymous = json['anonymous'];
            if (json['citizens']) Data.citizens = json['citizens'];
        },

        postCreate: async function(data) {
            const response = await fetch('/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                alert('Не удалось создать событие, попробуйте ещё раз, пожалуйста');
                throw new Error('Got non-2XX response from API server.');
                return;
            }

            // Ответ от сервера тут
            alert('Сервер получил тестовое событие');
        },

        getAnswers: async function(rid) {
            if (!rid) return false;
            const response = await fetch('/mine?rid=' + rid.toString(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                }
            });

            if (!response.ok) {
                alert('Не удалось получить ответы на , попробуйте ещё раз, пожалуйста');
                throw new Error('Got non-2XX response from API server.');
                return;
            }

            const json = await response.json();
            console.log('Ответы получены: ' + json);
        },
        
        postAnswer: async function(id, answer) {
            const response = await fetch('/answer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    rid: id,
                    text: answer
                })
            });

            if (!response.ok) {
                alert('Не удалось ответить на событие, попробуйте ещё раз, пожалуйста');
                throw new Error('Got non-2XX response from API server.');
                return;
            }

            // Ответ от сервера тут
            alert('Ответ засчитан');
        }
    },

    /*
       Обновление данных
    */
    update: {
        network: async function(thisIndex) {
            if (typeof Data.nodes[thisIndex] === 'undefined') return;

            let header = document.querySelector(`
                #modalRequest >
                div.modal-header >
                div.title
            `);
            let image = document.querySelector(`
                #modalRequest >
                div.modal-body >
                div.modal-body__person-card >
                img.modal-body__person-card__img
            `);
            let text = document.querySelector(`
                #modalRequest >
                div.modal-body >
                p
            `);
            let name = document.querySelector(`
                #modalRequest >
                div.modal-body >
                div.modal-body__person-card >
                div.modal-body__person-card__info >
                p:first-child
            `);
            let city = document.querySelector(`
                #modalRequest >
                div.modal-body >
                div.modal-body__person-card >
                div.modal-body__person-card__info >
                p:last-child
            `);
            
            let pAns = document.querySelector(`
                #modalAnswer >
                div.modal-body >
                p
            `);

            header.innerHTML = 'Что-то из графа';
            pAns.innerHTML = thisIndex.toString();
            text.innerHTML = Data.nodes[thisIndex].text;
            image.src = Data.nodes[thisIndex].photo;
            name.innerHTML = Data.nodes[thisIndex].name + ' ' + Data.nodes[thisIndex].surname;
            city.innerHTML = Data.nodes[thisIndex].user_city || '';
        },

        all: async function() {
            Network.nodes = [];
            Network.edges = [];
            
            // Получаем cookies
            await App.update.cookies();

            // Получаем данные
            await App.request.getData();

            // Рендерим сеть/граф и 5 городских событий
            App.render.network(Network);
            App.render.citizens();
        },

        cookies: async function() {
            let tCity = document.cookie.match('(^|;) ?city=([^;]*)(;|$)');
            let tId = document.cookie.match('(^|;) ?vk_id=([^;]*)(;|$)');
            if (!tCity) {
                let date = new Date(Date.now() + 86400e3);
                date = date.toUTCString();
                document.cookie = 'city=Any; expires=' + date + '; samesite=lax; secure';
            } else Data.user.user_city = tCity[2];

            if (tId) Data.user.id = tId[2];
            else alert('Печенье пропало');
        },

        city: async function(newCity) {
            Data.user.city = newCity;
            let date = new Date(Date.now() + 86400e3);
            date = date.toUTCString();
            document.cookie = 'city=' + newCity + '; expires=' + date + '; samesite=lax; secure';

            //document.location.reload(true);
            // await App.request.getData();

            // Render.network(Network);
            // Render.citizens(Data.citizens);
        },

        modals: function() {

            Selectors.modals.openButtons.forEach(button => {
                button.addEventListener('click', async () => {
                    const modal = document.querySelector(button.dataset.modalTarget);
                    const target = (button.dataset.modalTarget).slice(1);
                    const index = button.dataset.modalIndex;

                    // TODO: place all the queries in the separate const object called Selectors.
                    switch (target) {
                        case 'modalRequestAnonymous':
                            await App.update.anonymousModal(target, index);
                            break;
                        case 'modalRequest':
                            await App.update.citizensModal(target, index);
                            break;
                        case 'modalAnswer':
                            //return;
                            //await App.update.answerModal(target, index);
                        default:
                            break;
                    };

                    App.action.openModal(modal, target, index);
                });
            });

            Selectors.modals.closeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const modal = button.closest('.modal');
                    App.action.closeModal(modal);
                });
            });
            
            Selectors.modals.changeCity.addEventListener('click', async () => {
                const newCity = document.querySelector('select.dropdown-select-city').value;
                
                await App.update.city(newCity);
                await App.update.all();
                
                const modal = Selectors.modals.changeCity.closest('.modal');
                App.action.closeModal(modal);
            });
            
            Selectors.modals.answerButton.addEventListener('click', async () => {
                const answer = document.querySelector('#modalAnswer > div.modal-body > textarea').innerHTML;
                const id = parseImt(document.quetySelector('#modalAnswer > div.modal-body > p').innerHTML, 10);
                
                await App.request.postAnswer(id, answer);
                // await App.update.city(newCity);
                // await App.update.all();
                
                const modal = Selectors.modals.answerButton.closest('.modal');
                App.action.closeModal(modal);
            });

            Selectors.modals.overlay.addEventListener('click', () => {
                const modals = document.querySelectorAll('.modal.active');
                modals.forEach(modal => {
                    App.action.closeModal(modal);
                });
            });
        },
        
        answerModal: async function(thisModal, thisIndex) {
            return;
        },

        anonymousModal: async function(thisModal, thisIndex) {
            if (typeof Data.anonymous[thisIndex] === 'undefined') return;

            let headerA = document.querySelector(`
                #modalRequestAnonymous >
                div.modal-header >
                div.title
            `);
            let textA = document.querySelector(`
                #modalRequestAnonymous >
                div.modal-body >
                p
            `);
            // CATEGORY - wish (желание), question (вопрос), request (просьба)
            // Пока не ответят/не устареет - нельзя создать ещё
            headerA.innerHTML = 'Анонимное что-то';
            textA.innerHTML = Data.anonymous[thisIndex].text;

            // TODO: edit button prop, or just edit a rid inside of a document/visual part
        },

        citizensModal: async function(thisModal, thisIndex) {
            if (typeof Data.citizens[thisIndex] === 'undefined') return;

            let header = document.querySelector(`
                #modalRequest >
                div.modal-header >
                div.title
            `);
            let image = document.querySelector(`
                #modalRequest >
                div.modal-body >
                div.modal-body__person-card >
                img.modal-body__person-card__img
            `);
            let text = document.querySelector(`
                #modalRequest >
                div.modal-body >
                p
            `);
            let name = document.querySelector(`
                #modalRequest >
                div.modal-body >
                div.modal-body__person-card >
                div.modal-body__person-card__info >
                p:first-child
            `);
            let city = document.querySelector(`
                #modalRequest >
                div.modal-body >
                div.modal-body__person-card >
                div.modal-body__person-card__info >
                p:last-child
            `);

            header.innerHTML = 'Городское что-то';
            text.innerHTML = Data.citizens[thisIndex].text;
            image.src = Data.citizens[thisIndex].photo;
            name.innerHTML = Data.citizens[thisIndex].name + ' ' + Data.citizens[thisIndex].surname;
            city.innerHTML = Data.citizens[thisIndex].user_city || '';
        }
    },

    /*
       Разные действия
    */
    action: {
        openModal: function(thisModal, thisTarget, thisIndex) {
            if (thisModal == null) return;
            if (thisTarget === 'modalRequestAnonymous'
                && typeof Data.anonymous[thisIndex] === 'undefined') return;
            if (thisTarget === 'modalRequest'
                && typeof Data.citizens[thisIndex] === 'undefined') return;
            if (thisTarget === 'modalGraph'
                && (typeof Data.nodes[thisIndex] === 'undefined'
                    || Data.nodes[thisIndex].text == null
                    || thisIndex === 0)) return;
            thisModal.style.display = 'block';
            thisModal.classList.add('active');
            Selectors.modals.overlay.classList.add('active');
        },

        closeModal: function(thisModal) {
            if (thisModal == null) return;
            thisModal.style.display = 'none';
            thisModal.classList.remove('active');
            Selectors.modals.overlay.classList.remove('active');
        }
    },

    /*
       Отрисовка графа, сторон и фона
    */
    render: {
        network: function(network) {
            let container = document.getElementById("network"),
                cWidth = Math.ceil(window.innerWidth * 0.8),
                cHeight = Math.ceil(window.innerHeight * 0.7);

            // style="width: 800px; height: 800px; border: 1px solid lightgray;"
            container.style = 'width: ' + cWidth.toString() + 'px; height: ' + cHeight.toString() + 'px;' + `
                position: absolute;
                bottom: 0;
                right: 0;
                left: 0;
                top: 0;
                margin: auto;
            `;
            
            let options = {
                nodes: {
                    borderWidth: 8,
                    size: 50,
                    chosen: {
                        node: async function(values, id, selected, hovering) {
                            values.borderColor = '#ffffff';
                            values.borderWidth = '10';
                            
                            const modal = document.querySelector('#modalRequest');
                            
                            await App.update.network(id - 1);
                            App.action.openModal(modal, 'modalGraph', id - 1);
                            
                            //selected = false;
                            setTimeout(() => {
                                networkVis.selectEdges([]);
                            }, 250);
                        }
                    },
                    color: {
                        border: "#c549e6",
                        background: "#7e42db",
                        highlight: {
                            border: "#ffffff"
                        }
                    },
                    font: {
                        color: "#ffffff"
                    }
                },
                edges: {
                    color: "#c549e6",
                    width: 3,
                    length: 300
                }
            };
            let networkVis = null;
            setTimeout(() => {
                networkVis = new vis.Network(container, network, options);
            }, 350);
        },

        citizens: function() {
            if (Data.citizens == null || Data.citizens[0] == null) return;
            let elements = document.querySelectorAll("div.friends-list__item > img.friends-list__item-img");
            for (let i = 0; i < 5; ++i) {
                //elements[i].src = anonymous[i]['photo'];
                if (typeof Data.citizens[i]['photo'] === undefined
                    || Data.citizens[i]['photo'] === 'https://vk.com/images/camera_400.png?ava=1'
                ) {
                    elements[i + 5].src = 'https://vk.com/images/camera_400.png?ava=1'; 'img/default.png';
                } else elements[i + 5].src = Data.citizens[i]['photo'];
            }
        },

        // graph: function(nodes, links) {
        //     // nodes - Массив узлов, каждый узел задается объектом с координатами и id картинки для отображения.
        //     // links - Массив связей между узлами. Каждый элемент это массив из двух элементов - индексов узлов.
        //
        //     var canvas,
        //         ctx,
        //         nodes,
        //         links,
        //         render,
        //         getMousePosFromEvent,
        //         getNodeByPos,
        //         dragNode,
        //         dragPoint;
        //
        //     canvas = document.getElementById('graph');
        //     canvas.width = window.innerWidth * 0.8;
        //     canvas.height = window.innerHeight * 0.7;
        //     ctx = canvas.getContext('2d');
        //
        //     // Отрисовка канвы.
        //     render = function() {
        //
        //         // Очищаем канву.
        //         ctx.clearRect(0, 0, canvas.width, canvas.height);
        //
        //         // Рисуем связи между узлами (раньше чем сами узлы, чтобы они отображались позади узлов).
        //         links.forEach(function(link) {
        //             var i0 = link.first,
        //                 i1 = link.second;
        //             ctx.strokeStyle = '#C549E6';
        //             ctx.lineWidth = 4;
        //             ctx.beginPath();
        //             ctx.moveTo(nodes[i0].x, nodes[i0].y);
        //             ctx.lineTo(nodes[i1].x, nodes[i1].y);
        //             ctx.stroke();
        //         });
        //
        //         // Рисуем узлы.
        //         nodes.forEach(function(node) {
        //             let img = document.getElementById(node.id),
        //                 halfWidth = img.naturalWidth / 2,
        //                 halfHeight = img.naturalHeight / 2,
        //                 x = canvas.width / 2 - 50,
        //                 y = canvas.height / 2 - 50;
        //             ctx.beginPath();
    	// 	        ctx.arc(x, y, 25, 0, 2 * Math.PI, false);
        //             ctx.lineWidth = 50;
        //             ctx.stroke();
        //             ctx.save();
        //             ctx.globalCompositeOperation = 'source-in';
        //             ctx.drawImage(img, 0, 0, 400, 400, x - 75, y - 75, 150, 150);
        //             ctx.restore();
        //             //ctx.drawRoundedImage(img, 30, node.x - halfWidth, node.y - halfHeight);
        //             //ctx.drawImage(img, node.x - halfWidth, node.y - halfHeight);
        //         });
        //     };
        //
        //     // Получает из события мыши координаты, относительно левого верхнего угла канвы.
        //     getMousePosFromEvent = function(evt) {
        //         var rect = canvas.getBoundingClientRect();
        //         return {
        //             x: evt.clientX - rect.left,
        //             y: evt.clientY - rect.top
        //         };
        //     };
        //
        //     // Находит узел, находящийся по заданой координате на канве.
        //     getNodeByPos = function(pos) {
        //         var result;
        //         nodes.forEach(function(node) {
        //             var img = document.getElementById(node.id),
        //                 halfWidth = img.naturalWidth / 2,
        //                 halfHeight = img.naturalHeight / 2;
        //             if ((pos.x >= node.x - halfWidth)
        //                 && (pos.x < node.x + halfWidth)
        //                 && (pos.y >= node.y - halfHeight)
        //                 && (pos.y < node.y + halfHeight)) {
        //             result = node;
        //           }
        //         });
        //
        //         return result;
        //     };
        //
        //     // При нажатии кнопки мыши находим узел по которому было нажатие,
        //     // запоминаем его в dragNode для дальнейшего использования,
        //     // в dragPoint запоминаем по какому месту узла была нажата кнопка мыши.
        //     canvas.addEventListener('mousedown', function(event) {
        //         var pos = getMousePosFromEvent(event);
        //         dragNode = getNodeByPos(pos);
        //         if (dragNode !== undefined) {
        //             dragPoint = {
        //                 x: pos.x - dragNode.x,
        //                 y: pos.y - dragNode.y
        //             }
        //         }
        //     }, false);
        //
        //     // При отпускании кпнопки мыши забываем текущий перетаскиваемый узел.
        //     canvas.addEventListener('mouseup', function() {
        //         dragNode = undefined;
        //     }, false);
        //
        //     // При движении мыши, если есть перетаскиваемый узел, двигаем его и перерисовываем канву.
        //     canvas.addEventListener('mousemove', function(event) {
        //         var pos;
        //         if (dragNode !== undefined) {
        //             pos = getMousePosFromEvent(event);
        //             dragNode.x = pos.x - dragPoint.x;
        //             dragNode.y = pos.y - dragPoint.y;
        //             render();
        //         }
        //     }, false);
        //
        //     render();
        // },

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
    }
};

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
};

// const testRequest = document.querySelector('button.buttonTestMakeRequest');
// if (Data.user.rid === -1) {
//     testRequest.addEventListener('click', async function testClick() {
//         const testRequestData = {
//             category: 'request',
//             text: 'Тестовый текст',
//             anonymous: 'everyone',
//             rcity: 'Any',
//             age: {from: '18', to: '24'},
//             sex: 2
//         };
//         await App.request.postCreate(testRequestData);
//         this.removeEventListener('click', testClick);
//     });
// }

// changeCity: async function(newCity) {
//     const response = await fetch('/city', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json;charset=utf-8'
//         },
//         body: JSON.stringify({
//             id: Data.user.id,
//             city: newCity
//         })
//     });

//     if (!response.ok) {
//         alert('Не удалось сменить город, попробуйте ещё раз, пожалуйста');
//         throw new Error('Got non-2XX response from API server.');
//         return;
//     }

//     Data.user.city = newCity;
// },
// createRequest: async function(formData) {
//     console.log('createRequest - send /POST request with form data');
// },
// getFormData: async function() {
//     console.log('getFormData - get data from form');
// },
// getRequest: async function() {
//     console.log('getRequest - get data in modal window');
// },
// resolveError: async function(error) {
//     console.log('resolveError - united error log');
// },
// anonymousModal: async function(index) {
//     let current = document.querySelector('#modalRequest');
//     //let image = document.querySelector('#modalRequest > div.modal-body > div.modal-body__person-card > img.modal-body__person-card__img');
//     let text = document.querySelector(`
//         #modalRequest >
//         div.modal-body >
//         p
//     `);

//     text.innerHTML = Data.anonymous[index].;
//     openModal(current);
// },
// refreshData: async function() {
//     try {
//         console.log('lul');
//     } catch(error) {
//         alert('Сломалось: ' + error);
//         throw new Error(error);
//         // // Рендерим картинки
//         // renderImages();

//         // // Строим граф
//         // renderGraph();
//     }
// },
// requestCity: async function() {
//     const firstButton = document.querySelector('button.buttonCity');
//     const mainButton = document.querySelector('button.buttonModal.buttonCityInside');
//     const listener = function(event) {
//         main.changeCity('Kaliningrad');
//         //alert('works!');
//     };

//     mainButton.addEventListener('click', listener);
//     firstButton.click();
//     //button.removeEventListener('click', listener);
// }

//const gotCookies = await main.getCookies();
// await main.changeCity();
//const gotData = await main.getData();

//renderGraph(data.nodes, data.links);
//renderSides(data.anonymous, data.citizens);
// const rendered = await main.renderAll();

// if (rendered === false) {
//     alert('Не удалось обработать данные :(');
//     window.location.href = 'https://grph.ru/';
// }

// //     // Спрашиваем о городе
// // if (data.user.city === 'Any') {
// //     document.querySelector('button.buttonCity').click();
// //     //await main.requestCity(); //listen for it
// // } else {
// //     // Получаем данные с сервера напрямую
// //     await main.refreshData();
// // }

// renderGraph(Data.nodes, Data.links);
// renderSides(Data.anonymous, Data.citizens);
// // const rendered = await main.renderAll();

// // if (rendered === false) {
// //     alert('Не удалось обработать данные :(');
// //     window.location.href = 'https://grph.ru/';
// // }

// // Перерендер графа при изменении размеров экрана
// renderGraph(Data.nodes, Data.links);

// const Selectors.modals.openButtons = document.querySelectorAll('[data-modal-target]')
// const Selectors.modals.closeButtons = document.querySelectorAll('[data-close-button]')
// const overlay = document.getElementById('overlay')

// Selectors.modals.openButtons.forEach(button => {
//     button.addEventListener('click', () => {
//         const modal = document.querySelector(button.dataset.modalTarget)

//         openModal(modal)
//     })
// })

// overlay.addEventListener('click', () => {
//     const modals = document.querySelectorAll('.modal.active')
//     modals.forEach(modal => {
//         closeModal(modal)
//     })
// })

// Selectors.modals.closeButtons.forEach(button => {
//     button.addEventListener('click', () => {
//         const modal = button.closest('.modal')
//         closeModal(modal)
//     })
// })

// function openModal(modal) {
//     if (modal == null) return
//     modal.style.display = 'block'
//     modal.classList.add('active')
//     overlay.classList.add('active')

// }

// function closeModal(modal) {
//     if (modal == null) return
//     modal.style.display = 'none'
//     modal.classList.remove('active')
//     overlay.classList.remove('active')
// }

/*

let graph = document.getElementById('graph');

if (json['user']) {
    let img = document.createElement('img');
    img.src = json['user']['photo'];
    img.id = json['user']['id'];
    img.style = 'max-width: 128px; max-height: 128px; width: auto; height: auto;';

    graph.appendChild(img);

    Data.nodes.push({
        id: json['user']['id'],
        x: 50,
        y: 60
    });
}

if (json['nodes']) {
    json['nodes'].forEach(function(element, index) {
        let img = document.createElement('img');
        img.src = element['photo'];
        img.id = element['id'];
        img.style = 'max-width: 128px; max-height: 128px; width: auto; height: auto;';

        graph.appendChild(img);

        Data.nodes.push({
            id: element['id'],
            x: 250,
            y: 250 + 10 * index
        });

        Data.links.push({first: 0, second: index});
    });

    // Data.links = [
    //     [0, 1]
    // ];
}

*/
