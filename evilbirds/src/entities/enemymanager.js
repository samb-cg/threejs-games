import {
    Vector3,
    AnimationMixer
} from "../../../build/three.module.js";

import {SkeletonUtils} from "../../../examples/jsm/utils/SkeletonUtils.js";

class EnemyManager {

    constructor(scene, assetMap) {

        this.scene = scene;
        this.enemy = assetMap.enemyObjects.twitter;
        this.player = assetMap.playerObjects;
        this.navmesh = assetMap.navmesh;

        this.spawnTick = 0;
        this.spawnRate = 50;
        this.xPos = -2;

        this.enemiesAlive = 0;

        this.spawpoints;

        this.mixers = [];

    }

    init() {

        this.spawpoints = [
            new Vector3(3, 1, 10),
            new Vector3(3, 1, -10),
            new Vector3(-7, 1, 0)
        ]

    }

    followPlayer() {
        
    }

    // Add enemy to random enemy spawing point
    addEnemyToLevel() {
        if (this.enemiesAlive == 3) return;
        if (this.spawnTick < this.spawnRate) {
            this.spawnTick++;
            return;
        }

        this.spawnTick = 0;

        var skeletonUtils = SkeletonUtils;

        // clone evil twitter mesh
        var meshclone = skeletonUtils.clone(this.enemy.mesh[0]);

        var tempMixer = new AnimationMixer(meshclone);

        // reuse mesh animation
        var action = tempMixer.clipAction(this.enemy.animations.idle[0]);
        action.play();

        this.mixers.push(tempMixer);

        // set position to one of the spawnpoints
        meshclone.position.copy(this.spawpoints[this.enemiesAlive]);

        this.scene.add(meshclone);

        this.enemiesAlive++;

    }

    update() {

        this.addEnemyToLevel();

        if (this.enemiesAlive>=1) {
            for (var i of this.mixers) {
                i.update(0.05);
            }
        }

    }

}
export {EnemyManager};