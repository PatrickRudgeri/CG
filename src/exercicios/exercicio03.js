

function main() {

    var stats = initStats();          // To show FPS information
    var scene = new THREE.Scene();    // Create main scene
    var renderer = initRenderer();    // View function in util/utils
    var camera = initCamera(new THREE.Vector3(0, -30, 15)); // Init camera in this position

    // Enable mouse rotation, pan, zoom etc.
    var trackballControls = new THREE.TrackballControls(camera, renderer.domElement);

    // Show axes (parameter is size of each axis)
    var axesHelper = new THREE.AxesHelper(12);
    scene.add(axesHelper);

    // create the ground plane
    createPlaneGround(scene, {width: 20, height: 20}, "rgba(150, 150, 150)");

    // create 9 cubes iteratively
    for (var i=-1; i <= 1; i++) {
        for (var j=-1; j <= 1; j++) {
            createCube(scene, {width: 4, height: 4, depth: 4}, {x: i*8, y: j*8, z: 2.0});
        }
    }

    // Use this to show information onscreen
    controls = new InfoBox();
    controls.add("Basic Scene");
    controls.addParagraph();
    controls.add("Use mouse to interact:");
    controls.add("* Left button to rotate");
    controls.add("* Right button to translate (pan)");
    controls.add("* Scroll to zoom in/out.");
    controls.show();

    // Listen window size changes
    window.addEventListener('resize', function () {
        onWindowResize(camera, renderer)
    }, false);

    render();

    function render() {
        stats.update(); // Update FPS
        trackballControls.update(); // Enable mouse movements
        requestAnimationFrame(render);
        renderer.render(scene, camera) // Render scene
    }
}

