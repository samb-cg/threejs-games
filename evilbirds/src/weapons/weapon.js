class Weapon{

    constructor(name, maxAmmo, weaponObj) {

        this.name = name;

        this.mesh = weaponObj.mesh;
        this.animations = weaponObj.animations;
        this.muzzle = weaponObj.muzzle;

        this.maxAmmo = maxAmmo;
        this.currentAmmo = maxAmmo;

    }

}
export {Weapon};