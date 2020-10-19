function main() {
    var stats = initStats();          // To show FPS information
    var scene = new THREE.Scene();    // Create main scene
    var renderer = initRenderer();    // View function in util/utils
    var camera = initCamera(new THREE.Vector3(10, 10, 30)); // Init camera in this position
    var light = initDefaultLighting(scene, new THREE.Vector3(40, 40, 40));
    var trackballControls = new THREE.TrackballControls(camera, renderer.domElement);

    // para sombreamento
    var spotLight = new THREE.SpotLight("rgb(50, 50, 50)");
    setSpotLight(new THREE.Vector3(40, 40, 40));
    scene.add(spotLight);

    var groundPlane = createGroundPlane(100, 100); // width and height
    groundPlane.rotateX(degreesToRadians(-90));
    scene.add(groundPlane);

    // To use the keyboard
    var keyboard = new KeyboardState();

    // Set angles of rotation
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
    ];
    var indexAngle = [0];
    var angleInicial = angle.slice(); //copia dos valores originais de angle

    // set lado e segmento ativo
    var ladoEsquerdoAtivo = true;
    var segmentoAtivo = 1;

    // listas de arestas e vertices
    var arestas = [];
    var vertices = [];

    // Show world axes
    var axesHelper = new THREE.AxesHelper(20);
    scene.add(axesHelper);

    var paramSphere = {size: 0.2, color: 'rgb(20,255,20)'};
    var paramCylinder = {height: 2, color: 'rgb(20,20,255)'};

    var s_0 = createSphere({size: 0.3, color: 'rgb(255, 0, 0)'});
    var s_1C = createSphere(paramSphere);
    var s_1D = createSphere(paramSphere);
    var s_1E = createSphere(paramSphere);
    var s_2C = createSphere(paramSphere);
    var s_3C = createSphere(paramSphere);
    var s_3D = createSphere(paramSphere);
    var s_4D = createSphere(paramSphere);
    var s_5D = createSphere(paramSphere);
    var s_3E = createSphere(paramSphere);
    var s_4E = createSphere(paramSphere);
    var s_5E = createSphere(paramSphere);
    var s_2PE = createSphere(paramSphere);
    var s_3PE = createSphere(paramSphere);
    var s_2PD = createSphere(paramSphere);
    var s_3PD = createSphere(paramSphere);

    scene.add(s_0);

    var c0_1C = createCylinder(paramCylinder);
    var c0_1D = createCylinder(paramCylinder);
    var c0_1E = createCylinder(paramCylinder);
    var c1_2C = createCylinder(paramCylinder);
    var c2_3C = createCylinder(paramCylinder);
    var c2_3D = createCylinder(paramCylinder);
    var c2_3E = createCylinder(paramCylinder);
    var c3_4E = createCylinder(paramCylinder);
    var c4_5E = createCylinder(paramCylinder);
    var c3_4D = createCylinder(paramCylinder);
    var c4_5D = createCylinder(paramCylinder);
    var c1_2PE = createCylinder(paramCylinder);
    var c2_3PE = createCylinder(paramCylinder);
    var c1_2PD = createCylinder(paramCylinder);
    var c2_3PD = createCylinder(paramCylinder);

    s_0.add(c0_1C);
    s_0.add(c0_1D);
    s_0.add(c0_1E);

    c0_1C.add(s_1C);
    c0_1D.add(s_1D);
    c0_1E.add(s_1E);

    s_1C.add(c1_2C);
    c1_2C.add(s_2C);

    //ombros
    s_2C.add(c2_3D);
    s_2C.add(c2_3E);
    c2_3D.add(s_3D);
    c2_3E.add(s_3E);
    //pescoço
    s_2C.add(c2_3C);
    c2_3C.add(s_3C);

    //braço esquerdo
    s_3E.add(c3_4E);
    c3_4E.add(s_4E);
    s_4E.add(c4_5E);
    c4_5E.add(s_5E);

    //perna esquerda
    s_1E.add(c1_2PE);
    c1_2PE.add(s_2PE);
    s_2PE.add(c2_3PE);
    c2_3PE.add(s_3PE);

    //braço direito
    s_3D.add(c3_4D);
    c3_4D.add(s_4D);
    s_4D.add(c4_5D);
    c4_5D.add(s_5D);

    //perna esquerda
    s_1D.add(c1_2PD);
    c1_2PD.add(s_2PD);
    s_2PD.add(c2_3PD);
    c2_3PD.add(s_3PD);


    // Listen window size changes
    window.addEventListener('resize', function () {
        onWindowResize(camera, renderer)
    }, false);

    var ladoAtivoMensagem = new SecondaryBox("Lado Esquerdo Ativo");
    // var segmentoAtivoMensagem = new SecondaryBox("Segmento 1 Ativo");

    buildInterface();
    render();

    function createSphere(params) {
        var sphereGeometry = new THREE.SphereGeometry(params.size, 32, 32);
        var sphereMaterial = new THREE.MeshPhongMaterial({color: params.color});
        var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.castShadow = true;
        vertices.push(sphere);
        return sphere;
    }

    function createCylinder(params) {
        var cylinderGeometry = new THREE.CylinderGeometry(0.1, 0.1, params.height, 25);
        var cylinderMaterial = new THREE.MeshPhongMaterial({color: params.color});
        var cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinder.castShadow = true;
        arestas.push(cylinder);
        return cylinder;
    }

    function rotateCylinder() {
        vertices.forEach(function (s) {
            s.matrixAutoUpdate = false;
            s.matrix.identity(); // resetting matrices
        });
        arestas.forEach(function (c) {
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
            //movendo verticalmente s_0 (centro da estrutura)
            s_0.matrix.multiply(mat4.makeTranslation(0.0, 6.0, 0.0)); //fixme: corrigir essa altura

            // segmento fixo do tronco inferior
            c0_1C.matrix.multiply(mat4.makeRotationZ(0.0));
            c0_1C.matrix.multiply(mat4.makeTranslation(0.0, 1.0, 0.0));

            s_1C.matrix.multiply(mat4.makeTranslation(0.0, 1.0, 0.0));

            // segmento fixo do tronco superior
            c1_2C.matrix.multiply(mat4.makeRotationZ(0.0));
            c1_2C.matrix.multiply(mat4.makeTranslation(0.0, 1.0, 0.0));

            s_2C.matrix.multiply(mat4.makeTranslation(0.0, 1.0, 0.0));

            // segmento fixo do pescoço
            c2_3C.matrix.multiply(mat4.makeTranslation(0.0, 1.0, 0.0));

            s_3C.matrix.multiply(mat4.makeTranslation(0.0, 1.0, 0.0));

            // segmento fixo da perna direita
            var theta = degreesToRadians(25)
            c0_1D.matrix.multiply(mat4.makeRotationZ(-theta));
            c0_1D.matrix.multiply(mat4.makeTranslation(0, -1, 0.0));

            s_1D.matrix.multiply(mat4.makeTranslation(0.0, -1, 0.0));

            // segmento fixo da perna esquerda
            c0_1E.matrix.multiply(mat4.makeRotationZ(theta));
            c0_1E.matrix.multiply(mat4.makeTranslation(0, -1, 0.0));

            s_1E.matrix.multiply(mat4.makeTranslation(0.0, -1, 0.0));

            // segmento fixo do braço direito
            var alpha = degreesToRadians(90)
            c2_3D.matrix.multiply(mat4.makeRotationZ(-alpha));
            c2_3D.matrix.multiply(mat4.makeTranslation(0, -1, 0.0));

            s_3D.matrix.multiply(mat4.makeTranslation(0.0, -1, 0.0));

            // segmento fixo do braço esquerdo
            c2_3E.matrix.multiply(mat4.makeRotationZ(alpha));
            c2_3E.matrix.multiply(mat4.makeTranslation(0, -1, 0.0));

            s_3E.matrix.multiply(mat4.makeTranslation(0.0, -1, 0.0));
        }

        function bracoEsquerdo() {
            //movendo e rotação na direção 1
            c3_4E.matrix.multiply(mat4.makeRotationZ(angle[0]));
            c3_4E.matrix.multiply(mat4.makeTranslation(0, 1, 0.0));

            //rotação na direção 2
            c3_4E.matrix.multiply(mat4.makeTranslation(0, -1, 0));
            c3_4E.matrix.multiply(mat4.makeRotationX(angle[1]));
            c3_4E.matrix.multiply(mat4.makeTranslation(0, 1, 0));

            // cotovelo
            s_4E.matrix.multiply(mat4.makeTranslation(0, 1, 0.0));

            // segmento movel do antebraço esquerdo
            c4_5E.matrix.multiply(mat4.makeRotationZ(angle[2]));
            c4_5E.matrix.multiply(mat4.makeTranslation(0, 1, 0.0));
            // mão esquerda
            s_5E.matrix.multiply(mat4.makeTranslation(0, 1, 0.0));
        }

        function bracoDireito() {
            // movendo e rotação na direção 1
            c3_4D.matrix.multiply(mat4.makeRotationZ(-angle[6]));
            c3_4D.matrix.multiply(mat4.makeTranslation(0, 1, 0.0));

            // rotação na direção 2
            c3_4D.matrix.multiply(mat4.makeTranslation(0, -1, 0));
            c3_4D.matrix.multiply(mat4.makeRotationX(-angle[7]));
            c3_4D.matrix.multiply(mat4.makeTranslation(0, 1, 0));
            // cotovelo
            s_4D.matrix.multiply(mat4.makeTranslation(0, 1, 0.0));

            // segmento movel do antebraço direito
            c4_5D.matrix.multiply(mat4.makeRotationZ(-angle[8]));
            c4_5D.matrix.multiply(mat4.makeTranslation(0, 1, 0.0));
            // mão direita
            s_5D.matrix.multiply(mat4.makeTranslation(0, 1, 0.0));
        }

        function pernaEsquerda() {
            c1_2PE.matrix.multiply(mat4.makeRotationZ(angle[3]));
            c1_2PE.matrix.multiply(mat4.makeTranslation(0, 1, 0));

            c1_2PE.matrix.multiply(mat4.makeTranslation(0, -1, 0));
            c1_2PE.matrix.multiply(mat4.makeRotationX(angle[4]));
            c1_2PE.matrix.multiply(mat4.makeTranslation(0, 1, 0));

            // joelho
            s_2PE.matrix.multiply(mat4.makeTranslation(0, 1, 0));
            //
            c2_3PE.matrix.multiply(mat4.makeRotationX(-angle[5]));
            c2_3PE.matrix.multiply(mat4.makeTranslation(0, 1, 0.0));
            // pé esquerdo
            s_3PE.matrix.multiply(mat4.makeTranslation(0, 1, 0.0));
        }

        function pernaDireita() {
            c1_2PD.matrix.multiply(mat4.makeRotationZ(-angle[9]));
            c1_2PD.matrix.multiply(mat4.makeTranslation(0, 1, 0));

            c1_2PD.matrix.multiply(mat4.makeTranslation(0, -1, 0));
            c1_2PD.matrix.multiply(mat4.makeRotationX(angle[10]));
            c1_2PD.matrix.multiply(mat4.makeTranslation(0, 1, 0));

            // joelho
            s_2PD.matrix.multiply(mat4.makeTranslation(0, 1, 0));
            //
            c2_3PD.matrix.multiply(mat4.makeRotationX(-angle[11]));
            c2_3PD.matrix.multiply(mat4.makeTranslation(0, 1, 0.0));
            // pé esquerdo
            s_3PD.matrix.multiply(mat4.makeTranslation(0, 1, 0.0));
        }

    }

    function changeLado() {
        if (ladoEsquerdoAtivo)
            ladoAtivoMensagem.changeMessage("Lado Esquerdo Ativo");
        else
            ladoAtivoMensagem.changeMessage("Lado Direito Ativo");
    }

    // function changeSegmento() {
    //     ladoAtivoMensagem.changeMessage("Lado Esquerdo Ativo");
    // }

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

    function keyboardUpdate() {
        let angleStep = Math.PI / 90;

        keyboard.update();

        if (keyboard.down("space")) {
            ladoEsquerdoAtivo = !ladoEsquerdoAtivo;
            changeLado();
        }

        if (keyboard.down("1") || segmentoAtivo === 1) {
            let index = (!ladoEsquerdoAtivo) * 6 + segmentoAtivo;
            indexAngle = [index-1, index];
        }
        if (keyboard.down("2") || segmentoAtivo === 2) {
            segmentoAtivo = 2;
            indexAngle = [(!ladoEsquerdoAtivo) * 6 + segmentoAtivo];
        }
        if (keyboard.down("3") || segmentoAtivo === 3) {
            segmentoAtivo = 3;
            let index = (!ladoEsquerdoAtivo) * 6 + segmentoAtivo;
            indexAngle = [index-1, index];
        }
        if (keyboard.down("4") || segmentoAtivo === 4) {
            segmentoAtivo = 4;
            indexAngle = [(!ladoEsquerdoAtivo) * 6 + segmentoAtivo + 1];
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
            if (!(indexAngle[1] in [2, 5, 8, 11]))
                angle[indexAngle[1]] += (ladoEsquerdoAtivo ? 1 : -1) * angleStep;
        }
        if (keyboard.pressed("down")) {
            //Apenas para segmento 1 (braço) e 3 (perna)
            if (!(indexAngle[1] in [2, 5, 8, 11]))
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
