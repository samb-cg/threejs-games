import {BulletManager} from "../weapons/bulletmanager.js";
import {WeaponManager} from "../weapons/weaponmanager.js";
import {CollisionManager} from "../core/collisionmanager.js";

class Player{

    constructor(camera, player, assetMap, scene) {

        this.player = player;
        this.head = camera;
        this.bounds = assetMap.playerObjects.bounds;
        this.currentWeapon = null;

        this.assetMap = assetMap;

        this.bulletManager = new BulletManager(this, scene);
        this.weaponManager = new WeaponManager(this.assetMap);

    }

    init() {
        this.changeWeapon(this.assetMap.weaponObjects.ak);
    }


    changeWeapon(weapon) {
        this.currentWeapon = weapon;
        this.weaponManager.currentWeapon = weapon;
        this.bulletManager.currentWeapon = weapon;
    }

    // set all ak meshes to shoot animation
    shoot() {     

        // stop reloading if trying to shoot during reloading
        if (this.assetMap.playerObjects.hands.animations.ak.reload[0].isRunning()) return;

        // tell bulletmanager to add bullets
        this.bulletManager.isShooting = true; 

        // hands shoot animation 
        this.assetMap.playerObjects.hands.shoot()

        // weapon shoot animation
        this.weaponManager.shoot();
    }

    stopShoot() {

        // Trigger one shot on release of mouse so firerate in ak isnt slow as hell when pressed semi auto
        this.bulletManager.bulletTick = this.bulletManager.fireRate;
        this.bulletManager.isShooting = false; 

        // stop hands animation
        this.assetMap.playerObjects.hands.stopShoot()

        // stop weapon shoot animation
        this.weaponManager.stopShoot();

    }

    reload() {

        this.stopShoot();
        
        if (this.assetMap.playerObjects.hands.animations.ak.reload[0].isRunning()) return;

        // hands reload animation
        this.assetMap.playerObjects.hands.reload()

        // weapon reload animation
        this.weaponManager.reload();

        // set ammo to max
        this.currentWeapon.currentAmmo = this.currentWeapon.maxAmmo;
        document.getElementById("hudAmmo").innerHTML = this.currentWeapon.currentAmmo;
    }

    // check for collision
    handleCollision() {
        var collisionManager = new CollisionManager(this.assetMap.terrainObjects);
        collisionManager.check(this.head, this.bounds);
    }


    // copy transform of all objects that are related to the player from the camera
    // also update bullet
    update() {

        this.handleCollision();

        for (var i of this.assetMap.weaponObjects.ak.mesh){
            i.position.copy(this.head.position);
            i.quaternion.copy(this.head.quaternion);
            this.assetMap.playerObjects.bounds.position.copy(this.head.position);
            this.assetMap.playerObjects.crosshairs.mesh.position.copy(this.head.position);
            this.assetMap.playerObjects.crosshairs.mesh.quaternion.copy(this.head.quaternion);
            this.assetMap.playerObjects.hands.mesh[0].position.copy(this.head.position);
            this.assetMap.playerObjects.hands.mesh[0].quaternion.copy(this.head.quaternion);
            this.assetMap.weaponObjects.ak.muzzle[0].position.copy(this.head.position);
            this.assetMap.weaponObjects.ak.muzzle[0].quaternion.copy(this.head.quaternion);

        }

        this.bulletManager.update();

    }

}

export {Player};