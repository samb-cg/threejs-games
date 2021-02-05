import {LoopOnce} from "../../../build/three.module.js";

class Hands{

    constructor(handObject) {
        
        this.mesh = handObject.mesh;
        this.animations = handObject.animations;

        // change this on weapon change.
        this.currentWeapon = "ak";

    }


    shoot() {

        // more weapons is more cases
        switch (this.currentWeapon) {

            case "ak": this.animations.ak.shoot[0].play(); break;

        }

    }

    stopShoot() {

        switch (this.currentWeapon) {
            case "ak": this.animations.ak.shoot[0].stop(); break;
        }

    }

    reload() {
        
        switch (this.currentWeapon) {

            case "ak":
                this.animations.ak.reload[0].play();
                this.animations.ak.reload[0].setLoop(LoopOnce);
                this.animations.ak.reload[0].reset();
                break;
            
        }

    }

}
export {Hands};