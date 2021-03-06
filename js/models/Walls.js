/**
 * Created by dannyd1221 on 4/9/2017.
 */
define(function(require){
    var THREE = require('../vendor/three');
    class Walls{
        constructor(){
            const WALL_HEIGHT = 250;
            const WALL_WIDTH = 250;
            const WALL_DEPTH = 200;
            const cobbleTex = new THREE.TextureLoader().load("textures/brick.jpg");
            cobbleTex.repeat.set(6,6);
            cobbleTex.wrapS = THREE.RepeatWrapping;
            cobbleTex.wrapT = THREE.RepeatWrapping;
            const wallGroup = new THREE.Group();
            wallGroup.map = [ // 1  1  3  4  5  6  7  8  9
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 1
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 1
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 3
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 4
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 5
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 6
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 7
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 8
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] // 9

            ];
            wallGroup.walls = [];
            var mapW = wallGroup.map.length, mapH = wallGroup.map[0].length;
            for(var row = 0; row < mapW; row++){
                for(var col = 0; col < mapH; col++)
                    if(wallGroup.map[row][col] == 1){
                        const wallGeo = new THREE.BoxBufferGeometry(WALL_WIDTH, WALL_HEIGHT, WALL_DEPTH, 1, 1, 1);
                        const wallMat= new THREE.MeshPhongMaterial({map:  cobbleTex});
                        const wall = new THREE.Mesh(wallGeo, wallMat);
                        wallGroup.add(wall);
                        wall.translateX(row*WALL_WIDTH);
                        wall.translateY(col*WALL_WIDTH);
                        wallGroup.walls.push(wall);
                    }
            }
            return wallGroup;
        }
    }
    return Walls;
});