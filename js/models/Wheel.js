/**
 * Created by Hans Dulimarta on 4/4/17.
 */
define(function (require) {
    var THREE = require('../vendor/three');

    class Wheel {
        constructor() {
            const NUM_SPOKES = 5;
            const WHEEL_RADIUS = 150;
            const TIRE_THICKNESS = 16;
            const wheelGroup = new THREE.Group();

            const tubeGeo = new THREE.TorusGeometry(WHEEL_RADIUS, TIRE_THICKNESS, 6, 30);
            const tubeMat = new THREE.MeshPhongMaterial({color: 0x780320});
            const tube = new THREE.Mesh(tubeGeo, tubeMat)
            wheelGroup.add(tube);

            const spokeGeo = new THREE.CylinderGeometry(0.6 * TIRE_THICKNESS, 0.6 * TIRE_THICKNESS,
                WHEEL_RADIUS, 10, 10);
            const spokeMat = new THREE.MeshPhongMaterial({color: 0x001199});
            const spoke = new THREE.Mesh(spokeGeo, spokeMat);

            for (let k = 0; k < NUM_SPOKES; k++) {
                const sp = spoke.clone();
                sp.rotateZ(k * 2 * Math.PI / NUM_SPOKES);
                sp.translateY(WHEEL_RADIUS/2);
                wheelGroup.add(sp);
            }

            // wheelGroup.add (new THREE.AxisHelper (100));
            return wheelGroup;
        }
    }

    return Wheel;
});
