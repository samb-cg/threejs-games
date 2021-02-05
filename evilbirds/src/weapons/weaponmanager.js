import {LoopOnce} from "../../../build/three.module.js";
// checks which weapon is active and animates it

class WeaponManager{

    constructor(assetMap) {
        
        this.weapons = assetMap.weaponObjects;
        this.currentWeapon;

    }

    // more weapons is more cases
    // for now there is only the ak

    shoot() {

        // check if ammo is full

        switch (this.currentWeapon.name) {
            case "ak":
                this.weapons.ak.muzzle[0].visible = true;
                for (var i of this.weapons.ak.animations.shoot) {
                    i.play();
                }
                break;

        }

    }

    stopShoot() {

        switch (this.currentWeapon.name) {

            case "ak":
                this.weapons.ak.muzzle[0].visible = false;
                for (var i of this.weapons.ak.animations.shoot) {
                    i.stop();
                }
                break;
            
        }

    }

    reload() {
        
        switch (this.currentWeapon.name) {

            case "ak":
                for (var i of this.weapons.ak.animations.reload) {
                    i.play();
                    i.setLoop(LoopOnce);
                    i.reset();
                }
                break;
            
        }

    }

    // hide weapon meshes
    hide() {
        
        switch (this.currentWeapon.name) {

            case "ak":
                for (var i of this.weapons.ak.mesh) {
                    i.visible = false;
                }
                break;
            
        }

    }

}
export {WeaponManager};