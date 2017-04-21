/**
 * Created by Hans Dulimarta on 4/5/17.
 */
define(function (require) {
    var THREE = require('../vendor/three');

    class Target {
        constructor() {
            const targetRad = 50;
            const targetGroup = new THREE.Group();
            const outerRingGeo = new THREE.CylinderGeometry(targetRad, targetRad, 10, 50);
            const outerRingMat = new THREE.MeshPhongMaterial ({color: 0xff0000});
            const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
            const middleRingGeo = new THREE.CylinderGeometry(targetRad-15, targetRad-15, 11, 50);
            const middleRingMat = new THREE.MeshPhongMaterial ({color: 0xFFFFFF});
            const middleRing = new THREE.Mesh(middleRingGeo, middleRingMat);
            const innerRingGeo =   new THREE.CylinderGeometry(targetRad-35, targetRad-35, 12, 50);
            const innerRingMat = new THREE.MeshPhongMaterial ({color: 0xff0000});
            const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
            targetGroup.add (outerRing);
            targetGroup.add (middleRing);
            targetGroup.add (innerRing);

            targetGroup.hit = function(){
              outerRingMat.color.setHex(0x42f453);
              innerRingMat.color.setHex(0x42f453);
            };

            return targetGroup;

        }
    }

    return Target;
});
