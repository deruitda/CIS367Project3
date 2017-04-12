require({
    // baseUrl: 'js',
    // three.js should have UMD support soon, but it currently does not
    // shim: {
    //     '/bower_components/threejs/build/three': { exports: 'THREE' },
    //     '/bower_components/threex.windowresize/threex.windowresize': { exports: 'THREEx' }
    // }
}, [
    'vendor/three', 'models/Wheel', 'models/BikeFrame', 'models/Walls', 'vendor/FirstPersonControls'
], function(THREE, Wheel, BikeFrame, Walls, FPSControls) {

    var scene, camera, renderer;
    var geometry, material, mesh;
    var wheelOne, wheelCF, tmpTranslation, tmpRotation, tmpScale;
    var bikeFrame, frameCF;
    var testWall, wallCF;
    var clock, controls;
    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight,
        ASPECT = WIDTH / HEIGHT,
        UNITSIZE = 250,
        WALLHEIGHT = UNITSIZE / 3,
        MOVESPEED = 300,
        LOOKSPEED = 0.075,
        BULLETMOVESPEED = MOVESPEED * 5,
        NUMAI = 5,
        PROJECTILEDAMAGE = 20;


    const rotZ1 = new THREE.Matrix4().makeRotationZ(THREE.Math.degToRad(1));

    init();
    animate();


    function init() {

        scene = new THREE.Scene();
        clock = new THREE.Clock();
        window.addEventListener('resize', onResize, false);
        //window.addEventListener('keydown', onKeypress, false);
        const globalAxes = new THREE.AxisHelper(200);
        scene.add(globalAxes);

        camera = new THREE.PerspectiveCamera(60, ASPECT, 1, 10000); // FOV, aspect, near, far
        camera.position.y = 100;
        camera.position.x = UNITSIZE * 5;
        scene.add(camera);

        controls = new FPSControls(camera);
        controls.movementSpeed = MOVESPEED;
        controls.lookSpeed = LOOKSPEED;
        //controls.lookVertical = false; // Temporary solution; play on flat surfaces only
        controls.noFly = true;

        const lightOne = new THREE.DirectionalLight(0xFFFFFF, 1.2);
        lightOne.position.set(100, 40, 400);
        scene.add(lightOne);

        const lightTwo = new THREE.DirectionalLight(0xFFFFFF, 1.2);
        lightTwo.position.set(300, 80, 400);
        scene.add(lightTwo);
        // const lightOneHelper = new THREE.DirectionalLightHelper(lightOne, 100);
        // scene.add(lightOneHelper);
        geometry = new THREE.BoxGeometry( 200, 200, 200 );
        material = new THREE.MeshPhongMaterial( { color: 0x00ff00} );
        mesh = new THREE.Mesh( geometry, material );

        const rotY = new THREE.Matrix4().makeRotationY(Math.PI/2);
        const rotX = new THREE.Matrix4().makeRotationX(Math.PI/2);
        const trans = new THREE.Matrix4().makeTranslation(0, 158, 0);
        wheelCF = new THREE.Matrix4();
        wheelCF.multiply(rotY);

        frameCF = new THREE.Matrix4();

        wallCF = new THREE.Matrix4();

        // the bike frame was created on the XY-plane, we have to bring it up right
        frameCF.multiply(rotX);
        frameCF.multiply(trans);

        tmpRotation = new THREE.Quaternion();
        tmpTranslation = new THREE.Vector3();
        tmpScale = new THREE.Vector3();
        wheelOne = new Wheel();
        bikeFrame = new BikeFrame();

        bikeFrame.add (wheelOne);

        scene.add(bikeFrame);

        testWall = new Walls();
        scene.add(testWall);
        testWall.rotateX(-(Math.PI/2));

        var container = document.getElementById("container");
        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

        const gravelTex = new THREE.TextureLoader().load("textures/gravel.png");
        gravelTex.repeat.set(6,6);
        gravelTex.wrapS = THREE.RepeatWrapping;
        gravelTex.wrapT = THREE.RepeatWrapping;
        const ground = new THREE.Mesh (
            new THREE.PlaneGeometry(5500, 5500, 10, 10),
            new THREE.MeshPhongMaterial({ map: gravelTex})
        );
        scene.add(ground);
        ground.position = new THREE.Vector3(40,0,0);
        ground.rotation.x = -(Math.PI / 2);
        document.body.appendChild( renderer.domElement );
    }

    function animate() {

        requestAnimationFrame( animate );

        frameCF.decompose (tmpTranslation, tmpRotation, tmpScale);
        bikeFrame.position.copy (tmpTranslation);
        bikeFrame.quaternion.copy (tmpRotation);
        bikeFrame.scale.copy (tmpScale);

        wheelCF.decompose (tmpTranslation, tmpRotation, tmpScale);
        wheelOne.position.copy (tmpTranslation);
        wheelOne.quaternion.copy (tmpRotation);
        wheelOne.scale.copy (tmpScale);

        var delta = clock.getDelta(), speed = delta * BULLETMOVESPEED;
        var aispeed = delta * MOVESPEED;
        controls.update(delta); // Move camera

        renderer.render( scene, camera );
    }

    function onResize() {
        const height = window.innerHeight - 100;
        const width = window.innerWidth - 8;
        //camera.aspect = width / height;
        //camera.updateProjectionMatrix();

        renderer.setSize (width, height);
    }

});
