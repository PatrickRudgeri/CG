function createPlaneGround(scene, scale, color) {
    var planeGeometry = new THREE.PlaneGeometry(scale.width, scale.height);
    planeGeometry.translate(.0, 0.0, -0.02); // To avoid conflict with the axeshelper
    var planeMaterial = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.FrontSide//DoubleSide,
    });
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    // add the plane to the scene
    scene.add(plane);
}

function createCube(scene, scale, position) {
    var cubeGeometry = new THREE.BoxGeometry(scale.width, scale.height, scale.depth);
    var cubeMaterial = new THREE.MeshNormalMaterial();
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    // position the cube
    cube.position.set(position.x, position.y, position.z);
    // add the cube to the scene
    scene.add(cube);
}

function createCylinder(scene, scale, position) {
    var cylinderGeometry = new THREE.CylinderGeometry(scale.radiusTop, scale.radiusBottom, scale.height, 200);
    var cylinderMaterial = new THREE.MeshNormalMaterial();
    var cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    // position the cube
    cylinder.position.set(position.x, position.y, position.z);
    // add the cube to the scene
    scene.add(cylinder);
}

function createSphere(scene, scale, position) {
    var sphereGeometry = new THREE.SphereGeometry(scale.radius, 200, 200);
    var sphereMaterial = new THREE.MeshNormalMaterial();
    var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    // position the cube
    sphere.position.set(position.x, position.y, position.z);
    // add the cube to the scene
    scene.add(sphere);
}