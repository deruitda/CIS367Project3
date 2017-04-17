require({
    // baseUrl: 'js',
    // three.js should have UMD support soon, but it currently does not
    // shim: {
    //     '/bower_components/threejs/build/three': { exports: 'THREE' },
    //     '/bower_components/threex.windowresize/threex.windowresize': { exports: 'THREEx' }
    // }
}, [
    'vendor/three', 'models/Wheel', 'models/Target', 'models/Walls', 'vendor/FirstPersonControls'
], function(THREE, Wheel, Target, Walls, FPSControls) {

    var scene, camera, renderer, projector;
    var geometry, material, mesh;
    var wheelOne, wheelCF, tmpTranslation, tmpRotation, tmpScale;
    var target, TargetCF;
    var testWall, wallCF;
    var clock, controls;
    var bullets;
    var targets;
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
    var mouse = { x: 0, y: 0 };


    const rotZ1 = new THREE.Matrix4().makeRotationZ(THREE.Math.degToRad(1));

    init();
    animate();


    function init() {
        projector = new THREE.Projector();
        scene = new THREE.Scene();
        clock = new THREE.Clock();
        bullets  = [];
        window.addEventListener('resize', onResize, false);
        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
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
        controls.noFly = false;

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
        const targetGeo = new THREE.CylinderGeometry(50, 50, 10, 50);
        const targetMat = new THREE.MeshPhongMaterial ({color: 0xff0000});
        target = new THREE.Mesh(targetGeo, targetMat);
        targets = [];
        targets.push(target);

        scene.add(target);

        testWall = new Walls();
        //scene.add(testWall);
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
        $(document).click(function(e) {
            e.preventDefault;
            if (e.which === 1) { // Left click only
                createBullet();
            }
        });
        document.body.appendChild( renderer.domElement );
    }

    function animate() {

        requestAnimationFrame( animate );
        render();
    }

    function onResize() {
        const height = window.innerHeight - 100;
        const width = window.innerWidth - 8;
        //camera.aspect = width / height;
        //camera.updateProjectionMatrix();

        renderer.setSize (width, height);
    }

    var sphereMaterial = new THREE.MeshBasicMaterial({color: 0xffff00});
    var sphereGeo = new THREE.SphereGeometry(1, 1, 1);
    function createBullet(obj) {
        if (obj === undefined) {
            obj = camera;
        }
        var sphere = new THREE.Mesh(sphereGeo, sphereMaterial);
        sphere.position.set(obj.position.x, obj.position.y * 0.8, obj.position.z);

        if (obj instanceof THREE.Camera) {
            var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
            projector.unprojectVector(vector, obj);
            sphere.ray = new THREE.Ray(
                obj.position,
                vector.subSelf(obj.position).normalize()
            );
        }
        else {
            var vector = camera.position.clone();
            sphere.ray = new THREE.Ray(
                obj.position,
                vector.subSelf(obj.position).normalize()
            );
        }
        sphere.owner = obj;

        bullets.push(sphere);
        scene.add(sphere);

        return sphere;
    }

    function onDocumentMouseMove(e) {
        e.preventDefault();
        mouse.x = (e.clientX / WIDTH) * 2 - 1;
        mouse.y = - (e.clientY / HEIGHT) * 2 + 1;
    }


    // Update and display
    function render() {
        var delta = clock.getDelta(), speed = delta * BULLETMOVESPEED;
        controls.update(delta); // Move camera

        // Update bullets. Walk backwards through the list so we can remove items.
        if(bullets.length != undefined){
            for (var i = bullets.length-1; i >= 0; i--) {
                var b = bullets[i], bulletPos = b.position, bulletDir = b.ray.direction;
                //if()

                var hit = false;
                //for (var j = ai.length-1; j >= 0; j--) {
                if(targets[0]) {
                    var target = targets[0];
                    var ray = new THREE.Raycaster(bulletPos, bulletDir.clone().normalize());
                    var colResults = ray.intersectObject(target);
                    if(colResults.length > 0 && colResults[0].distance < bulletDir.length){
                        scene.remove(b);
                        hit = true;
                    }
                    if (hit) {
                        scene.remove(target);
                        window.alert("FUCK!!!");
                    }
                    //}
                    if (!hit) {
                        b.translateX(speed * bulletDir.x);
                        b.translateZ(speed * bulletDir.z);
                        b.translateY(speed * bulletDir.y);
                    }
                }
            }
        }

        renderer.render(scene, camera); // Repaint
    }


});
