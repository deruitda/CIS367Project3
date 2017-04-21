/**
 * Created by aiuake4 on 4/21/17.
 */
define(function (require) {
    var THREE = require('../vendor/three');

    class deagle {
        constructor() {
            const deagleGroup = new THREE.Group();
            const handleGeo = new THREE.BoxGeometry(0.25, 0.75, 0.25);
            const handleMat = new THREE.MeshPhongMaterial ({color: 0xc7c8c9});
            const handle = new THREE.Mesh(handleGeo, handleMat);
            const gripGeo = new THREE.BoxGeometry(0.26, 0.75, 0.24);
            const gripMat = new THREE.MeshPhongMaterial ({color: 0x353535});
            const grip = new THREE.Mesh(gripGeo, gripMat);
            const barrelGeo = new THREE.BoxGeometry(.3, .25, 1.5);
            const barrelMat = new THREE.MeshPhongMaterial ({color: 0xc7c8c9});
            const barrel = new THREE.Mesh(barrelGeo, barrelMat);
            const barrelTopGeo = new THREE.BoxGeometry(.15, .1, 1.4);
            const barrelTopMat = new THREE.MeshPhongMaterial ({color: 0x353535});
            const barrelTop = new THREE.Mesh(barrelTopGeo, barrelTopMat);
            barrel.position.y += .5;
            barrel.position.z -= .5;
            barrelTop.position.y += .6;
            barrelTop.position.z -= .5;
            deagleGroup.add (handle);
            deagleGroup.add (barrel);
            deagleGroup.add (barrelTop);
            deagleGroup.add (grip);

            return deagleGroup;

        }
    }

    return deagle;
});