function main() {
    var stats = initStats();          // To show FPS information
    var scene = new THREE.Scene();    // Create main scene
    var renderer = initRenderer();    // View function in util/utils

    var camera = initCamera(new THREE.Vector3(10, 10, 30));
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

    // To use the keyboard
    var keyboard = new KeyboardState();

    // ângulos e auxiliares
    var d2R = degreesToRadians;
    var angle = [
        d2R(180), d2R(0), // braço esquerdo
        d2R(90), //cotovelo esquerdo
        d2R(160), d2R(0), // perna esquerda
        d2R(0), // joelho esquerdo
        d2R(180), d2R(0), // braço direito
        d2R(90), // cotovelo direito
        d2R(160), d2R(0), // perna direita
        d2R(0), //joelho direito
    ]; // ângulos das junções
    var indexAngle = [0, 1]; //usado no mapeamento do teclado
    var angleInicial = angle.slice(); //cópia dos valores originais de angle

    // set lado e segmento ativo
    var ladoEsquerdoAtivo = true;
    var segmentoAtivo = 1;

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
    }

    var paramJunta = {size: 0.2, color: 'rgb(20,255,20)'};
    var paramSegmento = {height: 2, color: 'rgb(20,20,255)'};

    criarJuntas();
    criarSegmentos();

    conectarObjs();

    // Listen window size changes
    window.addEventListener('resize', function () {
        onWindowResize(camera, renderer)
    }, false);

    var ladoAtivoMensagem = new SecondaryBox("Lado Esquerdo Ativo");

    buildInterface();
    render();

    function createSphere(params) {
        var sphereGeometry = new THREE.SphereGeometry(params.size, 32, 32);
        var sphereMaterial = new THREE.MeshPhongMaterial({color: params.color});
        var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.castShadow = true;
        juntas.push(sphere);
        return sphere;
    }

    function createCylinder(params) {
        var cylinderGeometry = new THREE.CylinderGeometry(0.02, 0.15, params.height, 25);
        var cylinderMaterial = new THREE.MeshPhongMaterial({color: params.color});
        var cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinder.castShadow = true;
        segmentos.push(cylinder);
        return cylinder;
    }

    function criarJuntas() {
        objs.juntas.centro[0] = createSphere({size: 0.3, color: 'rgb(255, 0, 0)'});
        objs.juntas.centro[1] = createSphere(paramJunta);
        objs.juntas.centro[2] = createSphere(paramJunta);
        objs.juntas.centro[3] = createSphere(paramJunta);

        for (let i = 0; i < 6; i++) {
            objs.juntas.dir[i] = createSphere(paramJunta);
            objs.juntas.esq[i] = createSphere(paramJunta);
        }

    }

    function criarSegmentos() {
        objs.segmentos.centro[0] = createCylinder(paramSegmento);
        objs.segmentos.centro[1] = createCylinder(paramSegmento);
        objs.segmentos.centro[2] = createCylinder(paramSegmento);

        for (let i = 0; i < 6; i++) {
            objs.segmentos.esq[i] = createCylinder(paramSegmento);
            objs.segmentos.dir[i] = createCylinder(paramSegmento);
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

    function rotateCylinder() {
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

        function estruturaFixaCentral() {
            //movendo verticalmente objs.juntas.centro[0] (centro da estrutura)
            objs.juntas.centro[0].matrix.multiply(mat4.makeTranslation(0.0, 6.0, 0.0)); //fixme: corrigir essa altura

            // segmento fixo do tronco inferior
            objs.segmentos.centro[0].matrix.multiply(mat4.makeRotationZ(0.0));
            objs.segmentos.centro[0].matrix.multiply(mat4.makeTranslation(0.0, 1.0, 0.0));

            objs.juntas.centro[1].matrix.multiply(mat4.makeTranslation(0.0, 1.0, 0.0));

            // segmento fixo do tronco superior
            objs.segmentos.centro[1].matrix.multiply(mat4.makeRotationZ(0.0));
            objs.segmentos.centro[1].matrix.multiply(mat4.makeTranslation(0.0, 1.0, 0.0));

            objs.juntas.centro[2].matrix.multiply(mat4.makeTranslation(0.0, 1.0, 0.0));

            // segmento fixo do pescoço
            objs.segmentos.centro[2].matrix.multiply(mat4.makeTranslation(0.0, 1.0, 0.0));

            objs.juntas.centro[3].matrix.multiply(mat4.makeTranslation(0.0, 1.0, 0.0));

            // segmento fixo da perna direita
            var theta = degreesToRadians(25)
            objs.segmentos.dir[0].matrix.multiply(mat4.makeRotationZ(-theta));
            objs.segmentos.dir[0].matrix.multiply(mat4.makeTranslation(0, -1, 0.0));

            objs.juntas.dir[0].matrix.multiply(mat4.makeTranslation(0.0, -1, 0.0));

            // segmento fixo da perna esquerda
            objs.segmentos.esq[0].matrix.multiply(mat4.makeRotationZ(theta));
            objs.segmentos.esq[0].matrix.multiply(mat4.makeTranslation(0, -1, 0.0));

            objs.juntas.esq[0].matrix.multiply(mat4.makeTranslation(0.0, -1, 0.0));

            // segmento fixo do braço direito
            var alpha = degreesToRadians(90)
            objs.segmentos.dir[1].matrix.multiply(mat4.makeRotationZ(-alpha));
            objs.segmentos.dir[1].matrix.multiply(mat4.makeTranslation(0, -1, 0.0));

            objs.juntas.dir[3].matrix.multiply(mat4.makeTranslation(0.0, -1, 0.0));

            // segmento fixo do braço esquerdo
            objs.segmentos.esq[1].matrix.multiply(mat4.makeRotationZ(alpha));
            objs.segmentos.esq[1].matrix.multiply(mat4.makeTranslation(0, -1, 0.0));

            objs.juntas.esq[3].matrix.multiply(mat4.makeTranslation(0.0, -1, 0.0));
        }

        function bracoEsquerdo() {
            //movendo e rotação na direção 1
            objs.segmentos.esq[2].matrix.multiply(mat4.makeRotationZ(angle[0]));
            objs.segmentos.esq[2].matrix.multiply(mat4.makeTranslation(0, 1, 0.0));

            //rotação na direção 2
            objs.segmentos.esq[2].matrix.multiply(mat4.makeTranslation(0, -1, 0));
            objs.segmentos.esq[2].matrix.multiply(mat4.makeRotationX(angle[1]));
            objs.segmentos.esq[2].matrix.multiply(mat4.makeTranslation(0, 1, 0));

            // cotovelo
            objs.juntas.esq[4].matrix.multiply(mat4.makeTranslation(0, 1, 0.0));

            // segmento movel do antebraço esquerdo
            objs.segmentos.esq[3].matrix.multiply(mat4.makeRotationZ(angle[2]));
            objs.segmentos.esq[3].matrix.multiply(mat4.makeTranslation(0, 1, 0.0));
            // mão esquerda
            objs.juntas.esq[5].matrix.multiply(mat4.makeTranslation(0, 1, 0.0));
        }

        function bracoDireito() {
            // movendo e rotação na direção 1
            objs.segmentos.dir[2].matrix.multiply(mat4.makeRotationZ(-angle[6]));
            objs.segmentos.dir[2].matrix.multiply(mat4.makeTranslation(0, 1, 0.0));

            // rotação na direção 2
            objs.segmentos.dir[2].matrix.multiply(mat4.makeTranslation(0, -1, 0));
            objs.segmentos.dir[2].matrix.multiply(mat4.makeRotationX(-angle[7]));
            objs.segmentos.dir[2].matrix.multiply(mat4.makeTranslation(0, 1, 0));
            // cotovelo
            objs.juntas.dir[4].matrix.multiply(mat4.makeTranslation(0, 1, 0.0));

            // segmento movel do antebraço direito
            objs.segmentos.dir[3].matrix.multiply(mat4.makeRotationZ(-angle[8]));
            objs.segmentos.dir[3].matrix.multiply(mat4.makeTranslation(0, 1, 0.0));
            // mão direita
            objs.juntas.dir[5].matrix.multiply(mat4.makeTranslation(0, 1, 0.0));
        }

        function pernaEsquerda() {
            objs.segmentos.esq[4].matrix.multiply(mat4.makeRotationZ(angle[3]));
            objs.segmentos.esq[4].matrix.multiply(mat4.makeTranslation(0, 1, 0));

            objs.segmentos.esq[4].matrix.multiply(mat4.makeTranslation(0, -1, 0));
            objs.segmentos.esq[4].matrix.multiply(mat4.makeRotationX(angle[4]));
            objs.segmentos.esq[4].matrix.multiply(mat4.makeTranslation(0, 1, 0));

            // joelho
            objs.juntas.esq[1].matrix.multiply(mat4.makeTranslation(0, 1, 0));
            //
            objs.segmentos.esq[5].matrix.multiply(mat4.makeRotationX(-angle[5]));
            objs.segmentos.esq[5].matrix.multiply(mat4.makeTranslation(0, 1, 0.0));
            // pé esquerdo
            objs.juntas.esq[2].matrix.multiply(mat4.makeTranslation(0, 1, 0.0));
        }

        function pernaDireita() {
            objs.segmentos.dir[4].matrix.multiply(mat4.makeRotationZ(-angle[9]));
            objs.segmentos.dir[4].matrix.multiply(mat4.makeTranslation(0, 1, 0));

            objs.segmentos.dir[4].matrix.multiply(mat4.makeTranslation(0, -1, 0));
            objs.segmentos.dir[4].matrix.multiply(mat4.makeRotationX(angle[10]));
            objs.segmentos.dir[4].matrix.multiply(mat4.makeTranslation(0, 1, 0));

            // joelho
            objs.juntas.dir[1].matrix.multiply(mat4.makeTranslation(0, 1, 0));
            //
            objs.segmentos.dir[5].matrix.multiply(mat4.makeRotationX(-angle[11]));
            objs.segmentos.dir[5].matrix.multiply(mat4.makeTranslation(0, 1, 0.0));
            // pé esquerdo
            objs.juntas.dir[2].matrix.multiply(mat4.makeTranslation(0, 1, 0.0));
        }

    }

    function changeLado() {
        if (ladoEsquerdoAtivo)
            ladoAtivoMensagem.changeMessage("Lado Esquerdo Ativo");
        else
            ladoAtivoMensagem.changeMessage("Lado Direito Ativo");
    }

    function resetAngles() {
        angle = angleInicial.slice();
        console.log("Resetando ângulos");
    }

    function buildInterface() {
        let controls = new function () {
            let r2D = radiansToDegrees;
            this.bracoEsqZ = r2D(angleInicial[0]); //angulo inicial do braco Esq (em relação ao eixo Z da scene)
            this.bracoEsqY = r2D(angleInicial[1]); //angulo inicial do braco Esq (em relação ao eixo Y da scene)
            this.cotoveloEsq = r2D(angleInicial[2]); //angulo inicial do cotovelo Esq (em relação ao eixo Z do obj pai)

            this.pernaEsqZ = r2D(angleInicial[3]); //angulo inicial da perna Esq (em relação ao eixo Z da scene)
            this.pernaEsqX = r2D(angleInicial[4]); //angulo inicial da perna Esq (em relação ao eixo X da scene)
            this.joelhoEsq = r2D(angleInicial[5]); //angulo inicial do joelho Esq (em relação ao eixo X da scene)

            this.bracoDirZ = r2D(angleInicial[6]);
            this.bracoDirY = r2D(angleInicial[7]);
            this.cotoveloDir = r2D(angleInicial[8]);

            this.pernaDirZ = r2D(angleInicial[9]);
            this.pernaDirX = r2D(angleInicial[10]);
            this.joelhoDir = r2D(angleInicial[11]);

            this.onReset = function () {
                resetAngles();
                gui.destroy();
                buildInterface();
            };

            this.rotate = function () {
                angle[0] = degreesToRadians(this.bracoEsqZ);
                angle[1] = degreesToRadians(this.bracoEsqY);
                angle[2] = degreesToRadians(this.cotoveloEsq);

                angle[3] = degreesToRadians(this.pernaEsqZ);
                angle[4] = degreesToRadians(this.pernaEsqX);
                angle[5] = degreesToRadians(this.joelhoEsq);

                angle[6] = degreesToRadians(this.bracoDirZ);
                angle[7] = degreesToRadians(this.bracoDirY);
                angle[8] = degreesToRadians(this.cotoveloDir);

                angle[9] = degreesToRadians(this.pernaDirZ);
                angle[10] = degreesToRadians(this.pernaDirX);
                angle[11] = degreesToRadians(this.joelhoDir);

                rotateCylinder();
            };

            this.onAngleChange = function () {

            }
        };

        // GUI interface
        var gui = new dat.GUI();

        gui.add(controls, 'onReset').name("Reset");

        // braço esquerdo
        createSlider("bracoEsqZ", "Braço Esq 1", 75, 285);
        createSlider("bracoEsqY", "Braço Esq 2", -105, 105);
        createSlider("cotoveloEsq", "Cotovelo Esquerdo", 0, 150);
        //perna esquerda
        createSlider("pernaEsqZ", "Perna Esq 1", 160, 250);
        createSlider("pernaEsqX", "Perna Esq 2", 0, 180);
        createSlider("joelhoEsq", "Joelho Esquerdo", 0, 150);
        // braço direito
        createSlider("bracoDirZ", "Braço Dir 1", 75, 285);
        createSlider("bracoDirY", "Braço Dir 2", -105, 105);
        createSlider("cotoveloDir", "Cotovelo Direito", 0, 150);
        //perna direita
        createSlider("pernaDirZ", "Perna Dir 1", 160, 250);
        createSlider("pernaDirX", "Perna Dir 2", 0, 180);
        createSlider("joelhoDir", "Joelho Direito", 0, 150);


        function createSlider(varName, sliderTitle, rangeMin, rangeMax) {
            gui.add(controls, varName, rangeMin, rangeMax)
                .onChange(function (e) {
                    controls.rotate()
                })
                .name(sliderTitle);
        }
    }

    function adicionarPlanoBase() {
        groundPlane = createGroundPlane(100, 100); // width and height
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

    function keyboardUpdate() {
        let angleStep = Math.PI / 90;

        keyboard.update();

        if (keyboard.down("space")) {
            ladoEsquerdoAtivo = !ladoEsquerdoAtivo;
            changeLado();
        }

        if (keyboard.down("1") || segmentoAtivo === 1) {
            let index = (!ladoEsquerdoAtivo) * 6 + segmentoAtivo;
            indexAngle[0] = index-1;
            indexAngle[1] = index;

        }
        if (keyboard.down("2") || segmentoAtivo === 2) {
            segmentoAtivo = 2;
            indexAngle[0] = (!ladoEsquerdoAtivo) * 6 + segmentoAtivo;
        }
        if (keyboard.down("3") || segmentoAtivo === 3) {
            segmentoAtivo = 3;
            let index = (!ladoEsquerdoAtivo) * 6 + segmentoAtivo;
            indexAngle[0] = index;
            indexAngle[1] = index+1;
        }
        if (keyboard.down("4") || segmentoAtivo === 4) {
            segmentoAtivo = 4;
            indexAngle[0] = (!ladoEsquerdoAtivo) * 6 + segmentoAtivo + 1;
        }

        //Para os braços e a perna usar as 4 teclas
        //Para o cotovelo e joelho usar Left e Right apenas
        if (keyboard.pressed("left")) {
            angle[indexAngle[0]] += (ladoEsquerdoAtivo ? 1 : -1) * angleStep;
        }
        if (keyboard.pressed("right")) {
            angle[indexAngle[0]] += (!ladoEsquerdoAtivo ? 1 : -1) * angleStep;
        }
        if (keyboard.pressed("up")) {
            //Apenas para segmento 1 (braço) e 3 (perna)
            if (segmentoAtivo in [1, 3])
                angle[indexAngle[1]] += (ladoEsquerdoAtivo ? 1 : -1) * angleStep;
        }
        if (keyboard.pressed("down")) {
            //Apenas para segmento 1 (braço) e 3 (perna)
            if (segmentoAtivo in [1, 3])
                angle[indexAngle[1]] += (!ladoEsquerdoAtivo ? 1 : -1) * angleStep;
        }

    }

    function render() {
        stats.update(); // Update FPS
        trackballControls.update();
        keyboardUpdate();
        rotateCylinder();
        lightFollowingCamera(spotLight, camera);
        requestAnimationFrame(render); // Show events
        renderer.render(scene, camera) // Render scene
    }
}
