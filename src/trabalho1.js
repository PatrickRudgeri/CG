function main() {
    var stats = initStats();          // To show FPS information
    var scene = new THREE.Scene();    // Create main scene
    var renderer = initRenderer();    // View function in util/utils
    var camera = initCamera(new THREE.Vector3(0, 0, 30)); // Init camera in this position
    var light = initDefaultLighting(scene, new THREE.Vector3(20, 20, 20));
    var trackballControls = new THREE.TrackballControls(camera, renderer.domElement);

    // To use the keyboard
    var keyboard = new KeyboardState();

    // Set angles of rotation
    var angle = [-1.57, 0]; // In degreesToRadians

    // Show world axes
    var axesHelper = new THREE.AxesHelper(20);
    scene.add(axesHelper);

    var paramSphere = {size: 0.2, color: 'rgb(20,255,20)'};
    var paramCylinder = {height: 2, color: 'rgb(20,20,255)'};

    var s_0 = createSphere({size: 0.4, color: 'rgb(255, 0, 0)'});
    var s_1C = createSphere(paramSphere);
    var s_1D = createSphere(paramSphere);
    var s_1E = createSphere(paramSphere);

    scene.add(s_0);

    var c0_1C = createCylinder(paramCylinder);
    var c0_1D = createCylinder(paramCylinder);
    var c0_1E = createCylinder(paramCylinder);

    s_0.add(c0_1C);
    s_0.add(c0_1D);
    s_0.add(c0_1E);

    c0_1C.add(s_1C);
    c0_1D.add(s_1D);
    c0_1E.add(s_1E);


    // Listen window size changes
    window.addEventListener('resize', function () {
        onWindowResize(camera, renderer)
    }, false);

    buildInterface();
    render();

    function createSphere(params) {
        var sphereGeometry = new THREE.SphereGeometry(params.size, 32, 32);
        var sphereMaterial = new THREE.MeshPhongMaterial({color: params.color});
        var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        return sphere;
    }

    function createCylinder(params) {
        var cylinderGeometry = new THREE.CylinderGeometry(0.1, 0.1, params.height, 25);
        var cylinderMaterial = new THREE.MeshPhongMaterial({color: params.color});
        var cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        return cylinder;
    }

    function rotateCylinder() {
        // More info:
        // https://threejs.org/docs/#manual/en/introduction/Matrix-transformations
        s_0.matrixAutoUpdate = false;
        s_1C.matrixAutoUpdate = false;
        s_1D.matrixAutoUpdate = false;
        s_1E.matrixAutoUpdate = false;
        c0_1C.matrixAutoUpdate = false;
        c0_1D.matrixAutoUpdate = false;
        c0_1E.matrixAutoUpdate = false;

        var mat4 = new THREE.Matrix4();

        // resetting matrices
        s_0.matrix.identity();
        s_1C.matrix.identity();
        s_1D.matrix.identity();
        s_1E.matrix.identity();
        c0_1C.matrix.identity();
        c0_1D.matrix.identity();
        c0_1E.matrix.identity();

        //movendo verticalmente s_0 (centro da estrutura)
        s_0.matrix.multiply(mat4.makeTranslation(0.0, 7.0, 0.0)); //fixme: corrigir essa altura


        // Will execute T1 and then R1
        c0_1C.matrix.multiply(mat4.makeRotationZ(0.0)); // R1
        c0_1C.matrix.multiply(mat4.makeTranslation(0.0, 1.0, 0.0)); // T1

        s_1C.matrix.multiply(mat4.makeTranslation(0.0, 1.0, 0.0));

        //começo da perna direita
        c0_1D.matrix.multiply(mat4.makeRotationZ(degreesToRadians(-30))); // R1
        c0_1D.matrix.multiply(mat4.makeTranslation(-0.1, -1, 0.0)); // T1

        s_1D.matrix.multiply(mat4.makeTranslation(0.0, -1*Math.cos(degreesToRadians(-30)), 0.0)); // T1

        // começo da perna esquerda
        c0_1E.matrix.multiply(mat4.makeRotationZ(degreesToRadians(30))); // R1
        c0_1E.matrix.multiply(mat4.makeTranslation(0.1, -1, 0.0)); // T1

        s_1E.matrix.multiply(mat4.makeTranslation(0.0, -1*Math.cos(degreesToRadians(30)), 0.0)); // T1
    }

    function buildInterface() {
        var controls = new function () {
            // TODO:Para cada junção criar um valor inicial aqui
            this.joint1 = 210; //angulo inicial da junção 1
            this.joint2 = 0; //angulo inicial da junção 1

            this.rotate = function () {
                // TODO:Para cada junção criar um angulo aqui
                angle[0] = degreesToRadians(this.joint1);
                angle[1] = degreesToRadians(this.joint2);
                rotateCylinder();
            };
        };

        // GUI interface
        var gui = new dat.GUI();

        //TODO: para cada junção deve-se criar um slider aqui
        gui.add(controls, 'joint1', 0, 210)
            .onChange(function (e) {
                controls.rotate()
            })
            .name("First Joint");

        gui.add(controls, 'joint2', 0, 150)
            .onChange(function (e) {
                controls.rotate()
            })
            .name("Second Joint");
    }

    function keyboardUpdate() {

        keyboard.update();
        console.log("Atualizando keyboard");
        //TODO: implementar essa função

        // var angle = degreesToRadians(10);
        // var rotAxis = new THREE.Vector3(0,0,1); // Set Z axis
        //
        // if ( keyboard.pressed("left") )     cube.translateX( -1 );
        // if ( keyboard.pressed("right") )    cube.translateX(  1 );
        // if ( keyboard.pressed("up") )       cube.translateY(  1 );
        // if ( keyboard.pressed("down") )     cube.translateY( -1 );
        // if ( keyboard.pressed("pageup") )   cube.translateZ(  1 );
        // if ( keyboard.pressed("pagedown") ) cube.translateZ( -1 );
        //
        // if ( keyboard.pressed("A") )  cube.rotateOnAxis(rotAxis,  angle );
        // if ( keyboard.pressed("D") )  cube.rotateOnAxis(rotAxis, -angle );
        //
        // if ( keyboard.pressed("W") )
        // {
        //   scale+=.1;
        //   cube.scale.set(scale, scale, scale);
        // }
        // if ( keyboard.pressed("S") )
        // {
        //   scale-=.1;
        //   cube.scale.set(scale, scale, scale);
        // }
    }

    function render() {
        stats.update(); // Update FPS
        trackballControls.update();
        keyboardUpdate();
        rotateCylinder();
        lightFollowingCamera(light, camera);
        requestAnimationFrame(render); // Show events
        renderer.render(scene, camera) // Render scene
    }
}
