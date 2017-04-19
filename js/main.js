var scene, camera, renderer, projector;
var geometry, material, mesh;
var wheelOne, wheelCF, tmpTranslation, tmpRotation, tmpScale;
var testWall, wallCF;
var clock, controls;
var bullets;
var targets;
var scoreCount = 0;
var WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight,
    ASPECT = WIDTH / HEIGHT,
    UNITSIZE = 250,
    WALLHEIGHT = UNITSIZE / 3,
    MOVESPEED = 300,
    LOOKSPEED = 0.075,
    BULLETMOVESPEED = 1000,
    NUMAI = 5,
    PROJECTILEDAMAGE = 20,
    map;
var mouse = { x: 0, y: 0 };
var gun;
var timeLeft = 0;
var timerId;
var elem = document.getElementById('timer');
require({
    // baseUrl: 'js',
    // three.js should have UMD support soon, but it currently does not
    // shim: {
    //     '/bower_components/threejs/build/three': { exports: 'THREE' },
    //     '/bower_components/threex.windowresize/threex.windowresize': { exports: 'THREEx' }
    // }
}, [
    'vendor/three', 'models/Target', 'models/Walls', 'vendor/FirstPersonControls'
], function(THREE, Target, Walls, FPSControls) {


    init();
    animate();


    function init() {
        projector = new THREE.Projector();
        scene = new THREE.Scene();
        clock = new THREE.Clock();
        bullets  = [];
        scene.background = new THREE.Color(0x42adf4);
        window.addEventListener('resize', onResize, false);
        document.getElementById("timerstart").onclick = startTimer;
        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
        //window.addEventListener('keydown', onKeypress, false);
        const globalAxes = new THREE.AxisHelper(200);
        scene.add(globalAxes);

        camera = new THREE.PerspectiveCamera(60, ASPECT, 1, 10000); // FOV, aspect, near, far
        camera.position.y = 100;
        camera.position.x = (UNITSIZE * 4);
        camera.position.z = -(UNITSIZE * 4);
        scene.add(camera);

        // var objLoader = new THREE.ObjectLoader();
        // objLoader.load('Textures/desert_eagle.json', function(object){
        //    scene.add(object);
        // });

        controls = new FPSControls(camera);
        controls.movementSpeed = MOVESPEED;
        controls.lookSpeed = LOOKSPEED;
        controls.lookVertical = false; // Temporary solution; play on flat surfaces only
        controls.noFly = false;

        var loader = new THREE.JSONLoader();
        loader.load( "textures/desert_eagle.json", addModelToScene );

        const lightOne = new THREE.AmbientLight(0xFFFFFF);
        lightOne.position.set(0, 100, 0);
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

        testWall = new Walls();
        testWall.translateY(100);
        scene.add(testWall);
        map = testWall.map;
        testWall.rotateX(-(Math.PI/2));

        targets = [];

        createTargets();

        var container = document.getElementById("container");
        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

        const gravelTex = new THREE.TextureLoader().load("textures/cobble2.png");
        gravelTex.repeat.set(6,6);
        gravelTex.wrapS = THREE.RepeatWrapping;
        gravelTex.wrapT = THREE.RepeatWrapping;
        const ground = new THREE.Mesh (
            new THREE.PlaneGeometry(10000, 10000, 10, 10),
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

    function addModelToScene(geometry, materials){
        var material = new THREE.MeshFaceMaterial(materials);
        gun = new THREE.Mesh( geometry, material );
        gun.position.set(0,10,0);
        scene.add( model );
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

    var lineMaterial = new THREE.MeshBasicMaterial({color: 0xffff00});
    var lineGeo = new THREE.BoxGeometry(3, 3, 3, 3, 3, 3);
    function createBullet(obj) {
        if (obj === undefined) {
            obj = camera;
        }
        var line = new THREE.Mesh(lineGeo, lineMaterial);
        line.position.set(obj.position.x, obj.position.y * 0.8, obj.position.z);

        if (obj instanceof THREE.Camera) {
            var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
            projector.unprojectVector(vector, obj);
            line.ray = new THREE.Ray(
                obj.position,
                vector.subSelf(obj.position).normalize()
            );
        }
        else {
            var vector = camera.position.clone();
            line.ray = new THREE.Ray(
                obj.position,
                vector.subSelf(obj.position).normalize()
            );
        }
        line.owner = obj;

        bullets.push(line);
        scene.add(line);

        return line;
    }

    function onDocumentMouseMove(e) {
        e.preventDefault();
        mouse.x = (e.clientX / WIDTH) * 2 - 1;
        mouse.y = - (e.clientY / HEIGHT) * 2 + 1;
    }


    function createTargets(){
        var numTargets = 20;
        var positions = [];
        for(var i = 0; i < numTargets; i++){
            var min = 0;
            var max = testWall.walls.length-1;
            var randWall = Math.floor(Math.random() * (max - min)) + min;
            var wall = testWall.walls[randWall];
            positions.push(wall.position);
        }
        for(var i = 0; i < numTargets; i++){
            var target = new Target();

            var min = 0;
            var max = positions.length;
            var randPos = Math.floor(Math.random() * (max - min)) + min;
            var position = positions[randPos];
            if(Math.abs(position.y) > Math.abs(position.x)){
                target.position.x = position.x;
                target.position.z = -position.y + UNITSIZE;
            }
            else{
                target.position.x = position.x;
                target.position.z = -position.y - UNITSIZE;
            }
            target.position.y = 100;
            target.rotateX(Math.PI/2);
            scene.add(target);
            targets.push(target);
            positions.splice(randPos, 1);
        }
    }

    // Update and display
    function render() {
        var delta = clock.getDelta(), speed = delta * BULLETMOVESPEED;
        controls.update(delta); // Move camera

        // Update bullets. Walk backwards through the list so we can remove items.
        if(bullets.length != undefined){
            console.log(camera.position);
            for (var i = bullets.length-1; i >= 0; i--) {
                var bullet = bullets[i];
                var bulletPos = bullet.position;
                var dir = bullet.ray.direction;
                var hit = false;
                for(var t = 0; t < targets.length; t++) {
                    var target = targets[t];
                    var targetPos = target.position;
                    if ((bulletPos.x < targetPos.x + 50 && bulletPos.x > targetPos.x - 50) &&
                        (bulletPos.y < targetPos.y + 50 && bulletPos.y > targetPos.y - 50) &&
                        (bulletPos.z < targetPos.z + 50 && bulletPos.z > targetPos.z - 50)) {
                        hit = true;
                    }
                    if (hit) {
                        scoreCount += 1;
                        scene.remove(target);
                        targets.splice(t, 1);
                        bullets.splice(i, 1);
                        scene.remove(bullet);
                        document.getElementById("Score").innerHTML = "" + scoreCount;
                        break;
                    }
                }
                    if (!hit) {
                        bullet.translateX(speed * dir.x);
                        bullet.translateZ(speed * dir.z);
                        bullet.translateY(speed * dir.y);
                    }


            }
        }

        renderer.render(scene, camera); // Repaint
    }

    function getMapSector(v) {
        var x = Math.floor((v.x + UNITSIZE / 2) / UNITSIZE + map.length/2);
        var z = Math.floor((v.z + UNITSIZE / 2) / UNITSIZE + map.length/2);
        return {x: x, z: z};
    }

    function checkWallCollision(v) {
        var c = getMapSector(v);
        //return map[c.x][c.z] > 0;
        return 0;
    }

    function countdown() {
        if (scoreCount == 20) {
            elem.innerHTML = timeLeft + 's';
            clearTimeout(timerId);
            alert();
        } else {
            elem.innerHTML = timeLeft + 's';
            timeLeft++;
        }
    }

    function startTimer(){
        timerId = setInterval(countdown, 1000);
    }

    function alert(){
        if(window.confirm("All Targets Hit!\n Time: " + timeLeft + "seconds") == true){
            location.reload();
        }else{
            location.reload();
        }
    }

});
