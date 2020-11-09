function main() {
    var stats = initStats();          // To show FPS information
    var scene = new THREE.Scene();    // Create main scene
    var renderer = initRenderer();    // View function in util/utils

    // var camera = initCamera(new THREE.Vector3(30, 5, 0)); //vista lateral
    var camera = initCamera(new THREE.Vector3(20, 5, 20));
    var light = initDefaultLighting(scene, new THREE.Vector3(40, 40, 40));
    var trackballControls = new THREE.TrackballControls(camera, renderer.domElement);
    // Show axes
    var axesHelper = new THREE.AxesHelper(20);
    scene.add(axesHelper);

    // adicionar sombreamento
    var spotLight;
    adicionarSombreamento();

    // adicionar plano base
    var groundPlane;
    adicionarPlanoBase();

    // ângulos e auxiliares
    var d2R = degreesToRadians;
    // set ângulos iniciais das junções
    var angle = [
        d2R(110), d2R(0), // braço esquerdo
        d2R(0), //cotovelo esquerdo
        d2R(140), d2R(0), // perna esquerda
        d2R(0), // joelho esquerdo
        d2R(110), d2R(0), // braço direito
        d2R(0), // cotovelo direito
        d2R(140), d2R(0), // perna direita
        d2R(0), //joelho direito
    ];
    // var indexAngle = [0, 1]; //usado no mapeamento do teclado
    var angleInicial = angle.slice(); //cópia dos valores originais de angle

    // listas de segmentos e juntas
    var segmentos = [];
    var juntas = [];

    // objs para armazenar juntas e segmentos em 3 grupos (centro, esq e dir)
    var objs = {
        juntas: {
            centro: [],
            dir: [],
            esq: [],
        },
        segmentos: {
            centro: [],
            dir: [],
            esq: [],
        },
    };

    var sizeSegmentos = {
        pescoco: 0.9,
        coluna: 1.5,
        ombros: 1.2,
        bracos: 1.8,
        quadril: 1.0,
        femur: 2.4,
        tibia: 2.0,
        getSegByIndex(i) {
            const t = [this.quadril, this.ombros, this.bracos, this.bracos, this.femur, this.tibia];
            return t[i];
        }
    };

    var sizeJuntas = 0.2;
    var emRepouso = true;
    var pauseAnimation = false;
    var stopAnimation = false;
    var startAnimation = false;
    var inverterSentido = true;
    var limAnguloPerna = {min: degreesToRadians(-20), max: degreesToRadians(20)};

    var speed = degreesToRadians(0.5);
    var clock = new THREE.Clock();
    var t = 0.0;

    criarJuntas();
    criarSegmentos();

    conectarObjs();

    // Listen window size changes
    window.addEventListener('resize', function () {
        onWindowResize(camera, renderer)
    }, false);

    buildInterface();
    render();

    function createSphere(size, color = 'rgb(66,66,75)') {
        var sphereGeometry = new THREE.SphereGeometry(size, 32, 32);
        var sphereMaterial = new THREE.MeshPhongMaterial({color: color});
        var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.castShadow = true;
        juntas.push(sphere);
        return sphere;
    }

    function createCylinder(height, color = 'rgb(239,210,190)') {
        let cylinderGeometry = new THREE.CylinderGeometry(0.02, 0.15, height, 25);
        let cylinderMaterial = new THREE.MeshPhongMaterial({color: color});
        let cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinder.castShadow = true;
        segmentos.push(cylinder);
        return cylinder;
    }

    function criarJuntas() {
        objs.juntas.centro[0] = createSphere(0.3);
        objs.juntas.centro[1] = createSphere(sizeJuntas);
        objs.juntas.centro[2] = createSphere(sizeJuntas);
        objs.juntas.centro[3] = createSphere(0.3, 'rgb(144,76,76)');

        for (let i = 0; i < 6; i++) {
            objs.juntas.dir[i] = createSphere(sizeJuntas);
            objs.juntas.esq[i] = createSphere(sizeJuntas);
        }

    }

    function criarSegmentos() {
        objs.segmentos.centro[0] = createCylinder(sizeSegmentos.coluna);
        objs.segmentos.centro[1] = createCylinder(sizeSegmentos.coluna);
        objs.segmentos.centro[2] = createCylinder(sizeSegmentos.pescoco);

        for (let i = 0; i < 6; i++) {
            objs.segmentos.esq[i] = createCylinder(sizeSegmentos.getSegByIndex(i));
            objs.segmentos.dir[i] = createCylinder(sizeSegmentos.getSegByIndex(i));
        }
    }

    function conectarObjs() {
        scene.add(objs.juntas.centro[0]);

        objs.juntas.centro[0].add(objs.segmentos.centro[0]);
        objs.juntas.centro[0].add(objs.segmentos.dir[0]);
        objs.juntas.centro[0].add(objs.segmentos.esq[0]);

        objs.segmentos.centro[0].add(objs.juntas.centro[1]);
        objs.segmentos.dir[0].add(objs.juntas.dir[0]);
        objs.segmentos.esq[0].add(objs.juntas.esq[0]);

        objs.juntas.centro[1].add(objs.segmentos.centro[1]);
        objs.segmentos.centro[1].add(objs.juntas.centro[2]);

        //ombros
        objs.juntas.centro[2].add(objs.segmentos.dir[1]);
        objs.juntas.centro[2].add(objs.segmentos.esq[1]);
        objs.segmentos.dir[1].add(objs.juntas.dir[3]);
        objs.segmentos.esq[1].add(objs.juntas.esq[3]);
        //pescoço
        objs.juntas.centro[2].add(objs.segmentos.centro[2]);
        objs.segmentos.centro[2].add(objs.juntas.centro[3]);

        //braço esquerdo
        objs.juntas.esq[3].add(objs.segmentos.esq[2]);
        objs.segmentos.esq[2].add(objs.juntas.esq[4]);
        objs.juntas.esq[4].add(objs.segmentos.esq[3]);
        objs.segmentos.esq[3].add(objs.juntas.esq[5]);

        //perna esquerda
        objs.juntas.esq[0].add(objs.segmentos.esq[4]);
        objs.segmentos.esq[4].add(objs.juntas.esq[1]);
        objs.juntas.esq[1].add(objs.segmentos.esq[5]);
        objs.segmentos.esq[5].add(objs.juntas.esq[2]);

        //braço direito
        objs.juntas.dir[3].add(objs.segmentos.dir[2]);
        objs.segmentos.dir[2].add(objs.juntas.dir[4]);
        objs.juntas.dir[4].add(objs.segmentos.dir[3]);
        objs.segmentos.dir[3].add(objs.juntas.dir[5]);

        //perna esquerda
        objs.juntas.dir[0].add(objs.segmentos.dir[4]);
        objs.segmentos.dir[4].add(objs.juntas.dir[1]);
        objs.juntas.dir[1].add(objs.segmentos.dir[5]);
        objs.segmentos.dir[5].add(objs.juntas.dir[2]);
    }

    function getHalfSize(attrName) {
        return sizeSegmentos[attrName] / 2.0;
    }

    function getTotalHeight(angQuadril) {
        return (Math.cos(angQuadril) * sizeSegmentos.quadril) + sizeSegmentos.femur + sizeSegmentos.tibia + (sizeJuntas * 0.9);
    }

    function getDistToGround(obj) {
        return new THREE.Box3().setFromObject(obj).min.y;
    }

    function updateObjs() {
        juntas.forEach(function (s) {
            s.matrixAutoUpdate = false;
            s.matrix.identity(); // resetting matrices
        });
        segmentos.forEach(function (c) {
            c.matrixAutoUpdate = false;
            c.matrix.identity(); // resetting matrices
        })

        var mat4 = new THREE.Matrix4();

        estruturaFixaCentral();

        bracoEsquerdo();
        bracoDireito();

        pernaEsquerda();
        pernaDireita();

        function iniciarAnimacao() {
            console.log("Iniciando animação...");
            if (angle[4] > limAnguloPerna.max) {
                startAnimation = false;
                emRepouso = false;
                angle[4] = limAnguloPerna.max;
                console.log("*INICIOU...");
            } else {
                angle[4] += speed / 5;

            }
        }

        function pararAnimacao() {
            console.log("Parando animação...");
            let a = degreesToRadians(1);
            if (Math.abs(angle[4]) <= a) {
                let isJoelhoEsqInclinado = Math.abs(angle[5]) >= a;
                let isJoelhoDirInclinado = Math.abs(angle[11]) >= a;

                if (isJoelhoEsqInclinado || isJoelhoDirInclinado) {
                    if (isJoelhoEsqInclinado)
                        angle[5] -= speed / 2;
                    if (isJoelhoDirInclinado)
                        angle[11] -= speed / 2;
                } else {
                    stopAnimation = false;
                    emRepouso = true;
                    // angle[4] = 0.0;
                    angle[5] = 0.0;
                    angle[11] = 0.0;
                    console.log("*PAROU...");
                }
            } else {
                angle[4] += angle[4] > 0 ? -speed / 5 : speed / 5;
            }
        }

        function caminhar() {
            console.log("Caminhando...");
            if (angle[4] < limAnguloPerna.min || angle[4] > limAnguloPerna.max) {
                inverterSentido = !inverterSentido;
            }

            angle[4] += (inverterSentido ? -1 : 1) * speed;
            //rotacionando os joelhos a partir da rotaçao da perna
            if (!inverterSentido) {
                angle[5] += -angle[4] * speed * 10;
                angle[11] = 0;
            }
            if (inverterSentido) {
                angle[5] = 0;
                angle[11] += angle[4] * speed * 10;
            }
        }

        function estruturaFixaCentral() {
            let lim = degreesToRadians(10); //angulo limite de rotação do ombro e do quadril
            let theta = degreesToRadians(45); // inclinação do seg. do quadril
            let alpha = degreesToRadians(80); // inclinação do seg. do ombro

            let metadeSegmCol = getHalfSize("coluna");
            let metadeSegmPes = getHalfSize("pescoco");
            let metadeSegmOmb = getHalfSize("ombros");
            let metadeSegmQuad = getHalfSize("quadril");

            //movendo verticalmente objs.juntas.centro[0] (centro da estrutura)
            objs.juntas.centro[0].matrix.multiply(mat4.makeTranslation(0.0, getTotalHeight(theta), 0.0));

            // segmento fixo do tronco inferior
            objs.segmentos.centro[0].matrix.multiply(mat4.makeRotationZ(0.0));
            objs.segmentos.centro[0].matrix.multiply(mat4.makeTranslation(0.0, metadeSegmCol, 0.0));

            objs.juntas.centro[1].matrix.multiply(mat4.makeTranslation(0.0, metadeSegmCol, 0.0));

            // segmento fixo do tronco superior
            objs.segmentos.centro[1].matrix.multiply(mat4.makeRotationZ(0.0));
            objs.segmentos.centro[1].matrix.multiply(mat4.makeTranslation(0.0, metadeSegmCol, 0.0));

            objs.juntas.centro[2].matrix.multiply(mat4.makeTranslation(0.0, metadeSegmCol, 0.0));

            // segmento fixo do pescoço
            objs.segmentos.centro[2].matrix.multiply(mat4.makeTranslation(0.0, metadeSegmPes, 0.0));

            objs.juntas.centro[3].matrix.multiply(mat4.makeTranslation(0.0, metadeSegmPes, 0.0));

            // segmento fixo da perna direita
            objs.segmentos.dir[0].matrix.multiply(mat4.makeRotationZ(-theta));
            objs.segmentos.dir[0].matrix.multiply(mat4.makeTranslation(0, -metadeSegmQuad, 0.0));

            objs.juntas.dir[0].matrix.multiply(mat4.makeTranslation(0.0, -metadeSegmQuad, 0.0));

            // segmento fixo da perna esquerda
            objs.segmentos.esq[0].matrix.multiply(mat4.makeRotationZ(theta));
            objs.segmentos.esq[0].matrix.multiply(mat4.makeTranslation(0, -metadeSegmQuad, 0.0));

            objs.juntas.esq[0].matrix.multiply(mat4.makeTranslation(0.0, -metadeSegmQuad, 0.0));

            // segmento fixo do braço direito
            objs.segmentos.dir[1].matrix.multiply(mat4.makeRotationZ(-alpha));
            objs.segmentos.dir[1].matrix.multiply(mat4.makeTranslation(0, -metadeSegmOmb, 0.0));

            objs.juntas.dir[3].matrix.multiply(mat4.makeTranslation(0.0, -metadeSegmOmb, 0.0));

            // segmento fixo do braço esquerdo
            objs.segmentos.esq[1].matrix.multiply(mat4.makeRotationZ(alpha));
            objs.segmentos.esq[1].matrix.multiply(mat4.makeTranslation(0, -metadeSegmOmb, 0.0));

            objs.juntas.esq[3].matrix.multiply(mat4.makeTranslation(0.0, -metadeSegmOmb, 0.0));

            // movendo os ombros conforme o movimento do braço
            let rotOmbro = 0.0;
            let stepOmbro = angle[1] / 5;
            if (angle[0] !== 0)
                rotOmbro = stepOmbro > lim ? lim : (stepOmbro < -lim ? -lim : stepOmbro);

            objs.juntas.centro[2].matrix.multiply(mat4.makeRotationY(-rotOmbro));

            // movendo o quadril conforme o movimento da perna
            let rotQuadril = 0.0;
            let stepQuadril = angle[4] / 5;
            if (angle[4] !== 0)
                rotQuadril = stepQuadril > lim ? lim : (stepQuadril < -lim ? -lim : stepQuadril);
            objs.juntas.centro[0].matrix.multiply(mat4.makeRotationY(-rotQuadril)); // rotacionando quadril
            objs.juntas.centro[1].matrix.multiply(mat4.makeRotationY(rotQuadril)); //corrigindo angulo da coluna

            // rotacionando toda a estrutura (para acompanhar o movimento)
            objs.juntas.centro[0].matrix.multiply(mat4.makeRotationZ(-rotQuadril / 3));
        }

        function bracoEsquerdo() {
            if (!pauseAnimation) {
                angle[1] = -angle[4] / 2; //espelhando movimento da perna esq

                //movendo o cotovelo com base no movimento do braço
                if (angle[1] >= 0)
                    angle[2] = angle[1] * 3;
            }

            let metadeSegmBraco = getHalfSize("bracos");
            //movendo e rotação na direção 1
            objs.segmentos.esq[2].matrix.multiply(mat4.makeRotationZ(angle[0]));
            objs.segmentos.esq[2].matrix.multiply(mat4.makeTranslation(0, metadeSegmBraco, 0.0));

            //rotação na direção 2
            objs.segmentos.esq[2].matrix.multiply(mat4.makeTranslation(0, -metadeSegmBraco, 0));
            objs.segmentos.esq[2].matrix.multiply(mat4.makeRotationX(angle[1]));
            objs.segmentos.esq[2].matrix.multiply(mat4.makeTranslation(0, metadeSegmBraco, 0));

            // cotovelo
            objs.juntas.esq[4].matrix.multiply(mat4.makeTranslation(0, metadeSegmBraco, 0.0));

            // segmento movel do antebraço esquerdo
            objs.segmentos.esq[3].matrix.multiply(mat4.makeRotationX(angle[2]));
            objs.segmentos.esq[3].matrix.multiply(mat4.makeTranslation(0, metadeSegmBraco, 0.0));
            // "mão" esquerda
            objs.juntas.esq[5].matrix.multiply(mat4.makeTranslation(0, metadeSegmBraco, 0.0));
        }

        function bracoDireito() {
            let metadeSegmBraco = getHalfSize("bracos");
            angle[7] = -angle[4] / 2; //espelhando movimento da perna esq

            //rotação do cotovelo
            if (angle[7] <= 0)
                angle[8] = angle[7] * 3;

            // movendo e rotação na direção 1
            objs.segmentos.dir[2].matrix.multiply(mat4.makeRotationZ(-angle[6]));
            objs.segmentos.dir[2].matrix.multiply(mat4.makeTranslation(0, metadeSegmBraco, 0.0));

            // rotação na direção 2
            objs.segmentos.dir[2].matrix.multiply(mat4.makeTranslation(0, -metadeSegmBraco, 0));
            objs.segmentos.dir[2].matrix.multiply(mat4.makeRotationX(-angle[7]));
            objs.segmentos.dir[2].matrix.multiply(mat4.makeTranslation(0, metadeSegmBraco, 0));
            // cotovelo
            objs.juntas.dir[4].matrix.multiply(mat4.makeTranslation(0, metadeSegmBraco, 0.0));

            // segmento movel do antebraço direito
            objs.segmentos.dir[3].matrix.multiply(mat4.makeRotationX(-angle[8]));
            objs.segmentos.dir[3].matrix.multiply(mat4.makeTranslation(0, metadeSegmBraco, 0.0));
            // mão direita
            objs.juntas.dir[5].matrix.multiply(mat4.makeTranslation(0, metadeSegmBraco, 0.0));
        }

        function pernaEsquerda() {
            let metadeSegmFem = getHalfSize("femur");
            let metadeSegmTib = getHalfSize("tibia");

            if (emRepouso) {
                console.log("Em repouso...");
                if (startAnimation) {
                    iniciarAnimacao();
                }
            } else {
                if (stopAnimation) {
                    pararAnimacao();
                } else if (!pauseAnimation) {
                    caminhar();
                } else {
                    console.log("Pausado...");
                }
            }

            //para corrigir pisada
            let peEsqAlt = getDistToGround(objs.juntas.esq[2]);
            if (peEsqAlt < 1.0) {
                objs.juntas.esq[0].matrix.multiply(mat4.makeTranslation(0, (1.0 - peEsqAlt), 0.0));
            }

            objs.segmentos.esq[4].matrix.multiply(mat4.makeRotationZ(angle[3]));
            objs.segmentos.esq[4].matrix.multiply(mat4.makeTranslation(0, metadeSegmFem, 0));

            objs.segmentos.esq[4].matrix.multiply(mat4.makeTranslation(0, -metadeSegmFem, 0));
            objs.segmentos.esq[4].matrix.multiply(mat4.makeRotationX(angle[4]));
            objs.segmentos.esq[4].matrix.multiply(mat4.makeTranslation(0, metadeSegmFem, 0));

            // joelho
            objs.juntas.esq[1].matrix.multiply(mat4.makeTranslation(0, metadeSegmFem, 0));
            //
            objs.segmentos.esq[5].matrix.multiply(mat4.makeRotationX(-angle[5]));
            objs.segmentos.esq[5].matrix.multiply(mat4.makeTranslation(0, metadeSegmTib, 0.0));
            // 'pé' esquerdo
            objs.juntas.esq[2].matrix.multiply(mat4.makeTranslation(0, metadeSegmTib, 0.0));

        }

        function pernaDireita() {
            let metadeSegmFem = getHalfSize("femur");
            let metadeSegmTib = getHalfSize("tibia");

            angle[10] = -angle[4]; //espelhando movimento da perna esq

            // para corrigir pisada
            let peDirAlt = getDistToGround(objs.juntas.dir[2]);
            if (peDirAlt < 1.0) {
                objs.juntas.dir[0].matrix.multiply(mat4.makeTranslation(0, (1.0 - peDirAlt), 0.0));
            }

            objs.segmentos.dir[4].matrix.multiply(mat4.makeRotationZ(-angle[9]));
            objs.segmentos.dir[4].matrix.multiply(mat4.makeTranslation(0, metadeSegmFem, 0));

            objs.segmentos.dir[4].matrix.multiply(mat4.makeTranslation(0, -metadeSegmFem, 0));
            objs.segmentos.dir[4].matrix.multiply(mat4.makeRotationX(angle[10]));
            objs.segmentos.dir[4].matrix.multiply(mat4.makeTranslation(0, metadeSegmFem, 0));

            // joelho
            objs.juntas.dir[1].matrix.multiply(mat4.makeTranslation(0, metadeSegmFem, 0));
            //
            objs.segmentos.dir[5].matrix.multiply(mat4.makeRotationX(-angle[11]));
            objs.segmentos.dir[5].matrix.multiply(mat4.makeTranslation(0, metadeSegmTib, 0.0));
            // pé esquerdo
            objs.juntas.dir[2].matrix.multiply(mat4.makeTranslation(0, metadeSegmTib, 0.0));
        }

    }

    function buildInterface() {
        let controls = new function () {
            this.speed = speed;

            this.onPause = function () {
                if (!emRepouso)
                    pauseAnimation = !pauseAnimation;
            };

            this.onStart = function () {
                if (!emRepouso && pauseAnimation)
                    pauseAnimation = false;
                else
                    startAnimation = true;
            };

            this.onStop = function () {
                if (!emRepouso)
                    stopAnimation = true;
            };

            this.changeSpeed = function () {
                speed = this.speed;
            };
        };

        // GUI interface
        var gui = new dat.GUI();

        gui.add(controls, 'onPause', false).name("Pause/Resume");
        gui.add(controls, 'onStart', false).name("Start");
        gui.add(controls, 'onStop', false).name("Stop");

        createSlider("speed", "Change speed", 0.001, degreesToRadians(3));

        function createSlider(varName, sliderTitle, rangeMin, rangeMax) {
            gui.add(controls, varName, rangeMin, rangeMax)
                .onChange(function (e) {
                    controls.changeSpeed()
                })
                .name(sliderTitle);
        }
    }

    function adicionarPlanoBase() {
        groundPlane = createGroundPlane(100, 100, 'rgb(59,98,61)'); // width and height
        groundPlane.rotateX(degreesToRadians(-90));
        scene.add(groundPlane);
    }

    function setSpotLight(position) {
        spotLight.position.copy(position);
        spotLight.shadow.mapSize.width = 2048;
        spotLight.shadow.mapSize.height = 2048;
        spotLight.shadow.camera.fov = degreesToRadians(20);
        spotLight.castShadow = true;
        spotLight.decay = 2;
        spotLight.penumbra = 0.05;
        spotLight.name = "Spot Light"

        scene.add(spotLight);
    }

    function adicionarSombreamento() {
        spotLight = new THREE.SpotLight("rgb(50, 50, 50)");
        setSpotLight(new THREE.Vector3(40, 40, 40));
        scene.add(spotLight);
    }

//   function keyboardUpdate() {
//       /*  let angleStep = Math.PI / 90;
//
//         keyboard.update();
//
//         if (keyboard.down("space")) {
//             ladoEsquerdoAtivo = !ladoEsquerdoAtivo;
//             changeLado();
//         }
//
//         if (keyboard.down("1") || segmentoAtivo === 1) {
//             let index = (!ladoEsquerdoAtivo) * 6 + segmentoAtivo;
//             indexAngle[0] = index-1;
//             indexAngle[1] = index;
//
//         }
//         if (keyboard.down("2") || segmentoAtivo === 2) {
//             segmentoAtivo = 2;
//             indexAngle[0] = (!ladoEsquerdoAtivo) * 6 + segmentoAtivo;
//         }
//         if (keyboard.down("3") || segmentoAtivo === 3) {
//             segmentoAtivo = 3;
//             let index = (!ladoEsquerdoAtivo) * 6 + segmentoAtivo;
//             indexAngle[0] = index;
//             indexAngle[1] = index+1;
//         }
//         if (keyboard.down("4") || segmentoAtivo === 4) {
//             segmentoAtivo = 4;
//             indexAngle[0] = (!ladoEsquerdoAtivo) * 6 + segmentoAtivo + 1;
//         }
//
//         //Para os braços e a perna usar as 4 teclas
//         //Para o cotovelo e joelho usar Left e Right apenas
//         if (keyboard.pressed("left")) {
//             angle[indexAngle[0]] += (ladoEsquerdoAtivo ? 1 : -1) * angleStep;
//         }
//         if (keyboard.pressed("right")) {
//             angle[indexAngle[0]] += (!ladoEsquerdoAtivo ? 1 : -1) * angleStep;
//         }
//         if (keyboard.pressed("up")) {
//             //Apenas para segmento 1 (braço) e 3 (perna)
//             if (segmentoAtivo in [1, 3])
//                 angle[indexAngle[1]] += (ladoEsquerdoAtivo ? 1 : -1) * angleStep;
//         }
//         if (keyboard.pressed("down")) {
//             //Apenas para segmento 1 (braço) e 3 (perna)
//             if (segmentoAtivo in [1, 3])
//                 angle[indexAngle[1]] += (!ladoEsquerdoAtivo ? 1 : -1) * angleStep;
//         }
// */
//   }

    function render() {
        t += clock.getDelta();
        stats.update(); // Update FPS
        trackballControls.update();
        // keyboardUpdate(); //não será usado nesse trabalho
        updateObjs();
        lightFollowingCamera(spotLight, camera);
        requestAnimationFrame(render); // Show events

        renderer.render(scene, camera) // Render scene
    }
}
