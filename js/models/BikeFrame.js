/**
 * Created by Hans Dulimarta on 4/5/17.
 */
define(function (require) {
    var THREE = require('../vendor/three');

    class BikeFrame {
        constructor() {
            const FORK_LENGTH = 240;
            const FORK_SEPARATION = 60;
            const frameGroup = new THREE.Group();
            const forkGeo = new THREE.CylinderGeometry(12, 12, FORK_LENGTH, 10);
            const forkMat = new THREE.MeshPhongMaterial ({color: 0xFFFF03});
            const leftFork = new THREE.Mesh (forkGeo, forkMat);
            const rightFork = leftFork.clone();
            const handleGeo = new THREE.CylinderGeometry (20, 20, 3 * FORK_SEPARATION, 10);
            const handleMat = new THREE.MeshPhongMaterial ({color: 0x00CC00});
            const handle = new THREE.Mesh (handleGeo, handleMat);
            frameGroup.add (leftFork);
            frameGroup.add (rightFork);
            frameGroup.add (handle);
            leftFork.translateX (-FORK_SEPARATION/2);
            leftFork.translateY (FORK_LENGTH/2);
            rightFork.translateX (+FORK_SEPARATION/2);
            rightFork.translateY (FORK_LENGTH/2);

            handle.rotateZ (Math.PI / 2);
            handle.translateX (FORK_LENGTH);

            // the bike frame is on the XY-plane

            // frameGroup.add (new THREE.AxisHelper (100));
            return frameGroup;
        }
    }

    return BikeFrame;
});
