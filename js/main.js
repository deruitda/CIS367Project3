require({
    // baseUrl: 'js',
    // three.js should have UMD support soon, but it currently does not
    // shim: {
    //     '/bower_components/threejs/build/three': { exports: 'THREE' },
    //     '/bower_components/threex.windowresize/threex.windowresize': { exports: 'THREEx' }
    // }
}, [
    'vendor/three', 'models/Wheel', 'models/BikeFrame', 'models/Walls'
], function(THREE, Wheel, BikeFrame, Walls) {

    var scene, camera, renderer;
    var geometry, material, mesh;
    var wheelOne, wheelCF, tmpTranslation, tmpRotation, tmpScale;
    var bikeFrame, frameCF;
    var testWall, wallCF;


    const rotZ1 = new THREE.Matrix4().makeRotationZ(THREE.Math.degToRad(1));

    init();
    animate();


    function init() {

        scene = new THREE.Scene();

        window.addEventListener('resize', onResize, false);
        window.addEventListener('keydown', onKeypress, false);
        const globalAxes = new THREE.AxisHelper(200);
        scene.add(globalAxes);
        camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );

        const eyePos = new THREE.Vector3 (1000, 300, 400);
        const cameraPose = new THREE.Matrix4().lookAt (
            eyePos,
            new THREE.Vector3 (0, 0, 200),
            new THREE.Vector3 (0, 0, 1)
        );
        cameraPose.setPosition (eyePos);
        camera.matrixAutoUpdate = false;
        camera.matrixWorld.copy (cameraPose);

        const lightOne = new THREE.DirectionalLight(0xFFFFFF, 1.2);
        lightOne.position.set(200, 40, 400);
        scene.add(lightOne);
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

        var container = document.getElementById("container");
        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

        const gravelTex = new THREE.TextureLoader().load("textures/gravel.png");
        gravelTex.repeat.set(6,6);
        gravelTex.wrapS = THREE.RepeatWrapping;
        gravelTex.wrapT = THREE.RepeatWrapping;
        const ground = new THREE.Mesh (
            new THREE.PlaneGeometry(2500, 2500, 10, 10),
            new THREE.MeshPhongMaterial({ map: gravelTex})
        );
        scene.add(ground);
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

        renderer.render( scene, camera );
    }

    function onResize() {
        const height = window.innerHeight - 100;
        const width = window.innerWidth - 8;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize (width, height);
    }

    const moveZpos = new THREE.Matrix4().makeTranslation (0, 0, 50);
    const moveZneg = new THREE.Matrix4().makeTranslation (0, 0, -50);
    const rotYpos = new THREE.Matrix4().makeRotationY (THREE.Math.degToRad(5));
    const rotYneg = new THREE.Matrix4().makeRotationY (THREE.Math.degToRad(-5));

    function onKeypress(event) {
        const key = event.keyCode || event.charCode;
        switch (key) {
            case 37: {// left arrow
                camera.matrixAutoUpdate = false;
                camera.matrixWorld.multiply(rotYpos);
                scene.updateMatrixWorld(true);
                break;
            }
            case 38: {// up arrow
                camera.matrixAutoUpdate = false;
                camera.matrixWorld.multiply(moveZneg);
                scene.updateMatrixWorld(true);
                break;
            }
            case 39: { // right arrow
                camera.matrixAutoUpdate = false;
                camera.matrixWorld.multiply(rotYneg);
                scene.updateMatrixWorld(true);
                break;
            }
            case 40: { // down arrow
                camera.matrixAutoUpdate = false;
                camera.matrixWorld.multiply(moveZpos);
                scene.updateMatrixWorld(true);
                break;
            }
            case 73: { /* i */
                frameCF.multiply(moveZpos);
                /* travel distance: 50, wheel radius 158 */
                const angle = 50 / 150;
                wheelCF.multiply (new THREE.Matrix4().makeRotationZ (angle));
                break;
            }
            case 74:  /* j */
                frameCF.multiply(rotYpos);
                break;
            case 75:  /* k */
                frameCF.multiply(moveZneg);
                const angle = 50 / 158;
                wheelCF.multiply (new THREE.Matrix4().makeRotationZ (-angle));
                break;
            case 76:  /* j */
                frameCF.multiply(rotYneg);
                break;
        }
    }

});
