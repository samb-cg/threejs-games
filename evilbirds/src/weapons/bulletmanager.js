import{
    Mesh,
    Vector3,
    BoxBufferGeometry,
    MeshBasicMaterial,
    Box3
} from "../../../build/three.module.js";


class BulletManager {

    constructor(player, scene) {
        this.player = player;
        this.scene = scene;
        this.currentWeapon;

        this.isShooting = false;

        this.bulletsAlive = [];

        // slow down fire rate 
        this.bulletTick = 0;
        this.fireRate = 5;

        // bullet speed
        this.speed = 1;

        // is used to prolong the reddening of the crosshairs texture
        this.crosshairTick = 0;
    }

    addBullet() {
        if (this.currentWeapon.currentAmmo <= 0) {
            this.player.stopShoot(); 
            this.player.reload();
            return;
        }

        if (this.bulletTick != this.fireRate) {
            this.bulletTick++; return;
        }
        this.bulletTick = 0;

        // get camera direction
        var camDir = new Vector3(); 
        this.player.head.getWorldDirection(camDir);

        // start position
        var startPos = new Vector3(); 
        startPos.copy(this.player.head.position).addScaledVector(camDir, 1);

        var newBullet = this.createBullet(camDir);
        newBullet.position.copy(startPos);

        this.bulletsAlive.push(newBullet);
        this.scene.add(newBullet);

        // remove one ammo from the current weapon
        this.currentWeapon.currentAmmo -= 1;
        document.getElementById("hudAmmo").innerHTML = this.currentWeapon.currentAmmo;
    }

    createBullet(dir) {
        var geoTest = new BoxBufferGeometry(0.01, 0.01, 0.01);
        var matTest = new MeshBasicMaterial({color: "black"});
        var sphereTest = new Mesh(geoTest, matTest);
        sphereTest.userData = {
            velocity: this.speed,
            direction: dir,
            lifetime: 100
        };
        return sphereTest;
    }

    bulletCollision(bullet) {
        var bulletBB = new Box3().setFromObject(bullet);
        var collisionIndex = enemies;
        
        for (var i = 0; i < collisionIndex.length; i++){
            var tempBB = new Box3().setFromObject(collisionIndex[i]);
            var intersects = bulletBB.intersectsBox(tempBB);
            if (intersects) {
                collisionIndex[i].material = new MeshBasicMaterial({ color: "blue" });
                this.crosshairTick = 10;
            } 
        }
    }

    changeCrosshairCol() {
        if(this.crosshairTick < 100)this.player.assetMap.playerObjects.crosshairs.mesh.children[0].material.color = new THREE.Color("red");
        if(this.crosshairTick = 100)this.player.assetMap.playerObjects.crosshairs.mesh.children[0].material.color = new THREE.Color("white");
    }

    // translate bullets in given direction
    updateBullets() {
        for (var i of this.bulletsAlive) {
            if (i.userData.lifetime <= 0) this.scene.remove(i);
            i.position.addScaledVector(i.userData.direction, this.speed);
            i.userData.lifetime -= 0.1;
            //this.bulletCollision(i);
        }
    }

    update() {
        if (this.isShooting === true) this.addBullet();
        if (this.crosshairTick > 0) this.player.assetMap.playerObjects.crosshairs.mesh.children[0].material.color = new THREE.Color("red"); this.crosshairTick -= 1;
        if(this.crosshairTick == 0)this.player.assetMap.playerObjects.crosshairs.mesh.children[0].material.color = new THREE.Color("white");
        this.updateBullets();
    }

}
export {BulletManager};