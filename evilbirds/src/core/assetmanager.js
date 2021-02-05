import {
    Box3,
    Mesh,
    LoadingManager,
    CubeTextureLoader,
    TextureLoader,
    AnimationMixer,
    AnimationClip,
    MeshBasicMaterial,
} from "../../../build/three.module.js";

import {GLTFLoader} from "../../../examples/jsm/loaders/GLTFLoader.js";

import {Weapon} from "../weapons/weapon.js";
import {Hands} from "../entities/hands.js";
import {Enemy} from "../entities/enemy.js";
import {Player} from "../entities/player.js";

class AssetManager {

    constructor(scene, assetMap, mixers) {
        
        this.scene = scene;
        this.assetMap = assetMap;
        this.mixers = mixers;

        this.tempAk = {
            mesh: [],
            animations: null,
            muzzle: null
        }

        this.tempHands = {
            mesh: null,
            animations: {}
        }

        this.weapon = null;
        this.hands = null;
        this.enemy = null;

        this.crosshairs = {
            mesh: null
        }

        this.tempEnemy = {
            mesh: null,
            animations: {}
        }

        this.loadingManager = new LoadingManager();
        this.cubeTexLoader = new CubeTextureLoader(this.loadingManager);
        this.gltfLoader = new GLTFLoader(this.loadingManager);
        this.textureLoader = new TextureLoader(this.loadingManager);

    }

    init() {
        this._loadCubeTex();
        this._loadModels();

    }

    // create 3Dboxes from the hitboxes for collision detection
    processLevel(objectGroup) {
        var tempArray = [];
        for (var i = 0; i < objectGroup.children.length; i++) {
            var objBounds = new Box3().setFromObject(objectGroup.children[i]);
            tempArray.push(objBounds);
        }
        this.assetMap.terrainObjects = tempArray;
    }

    _loadCubeTex() {

    }

    _loadModels() {

        var tempMesh = [];
        var tempShoot = [];
        var tempReload = [];

        var tempMuzzle = [];

        // need to add more temp variables to hold future gun actions but for only the AK this is good
        var tempHandMesh = [];
        var tempHandShoot = [];
        var tempHandReload = [];

        // enemy
        var tempEnemyMesh = [];
        var tempEnemyAnims = [];

        // load textured level
        this.gltfLoader.load("./meshes/level.glb", (gltf) => {
            var level = gltf.scene;
            this.scene.add(level);
        });

        // load windows 
        this.gltfLoader.load("./meshes/level_glass.glb", (gltf) => {
            var levelGlass = gltf.scene;
            var glassMat = new MeshBasicMaterial({
                color: 0xffffff, envMap: this.scene.background,
                refractionRatio: 0.95, transparent: true, opacity: 0.5, side: 2
            });
            levelGlass.children[0].geometry.material = glassMat;
            var glass = new Mesh(levelGlass.children[0].geometry, glassMat);
            this.scene.add(glass);
        });

        this.gltfLoader.load("./meshes/level_hitboxes.glb", (gltf) => {
            var hitboxes = gltf.scene;
            this.processLevel(hitboxes);
        });

        // load ak
        this.gltfLoader.load("./meshes/akRe.glb", (gltf) => {
            var akFrame = gltf.scene;

            var tempMixer = new AnimationMixer(akFrame);

            var reload = new AnimationClip.findByName(gltf.animations, "akReload");
            var shoot = new AnimationClip.findByName(gltf.animations, "akShoot");

            var anim1 = tempMixer.clipAction(reload);
            var anim2 = tempMixer.clipAction(shoot);

            this.mixers.push(tempMixer);
            tempMesh.push(akFrame);
            tempShoot.push(anim2);
            tempReload.push(anim1);

            this.scene.add(akFrame);
        });

        // load ak magazine
        this.gltfLoader.load("./meshes/akMagRe.glb", (gltf) => {
            var akMag = gltf.scene;

            var tempMixer = new AnimationMixer(akMag);

            var reload = new AnimationClip.findByName(gltf.animations, "magReload");
            var shoot = new AnimationClip.findByName(gltf.animations, "akShoot");

            var anim1 = tempMixer.clipAction(shoot);
            var anim2 = tempMixer.clipAction(reload);

            this.mixers.push(tempMixer);
            tempMesh.push(akMag);
            tempShoot.push(anim1);
            tempReload.push(anim2);

            this.scene.add(akMag);
        });

        // load ak spring
        this.gltfLoader.load("./meshes/akSpringRe.glb", (gltf) => {
            var akSpring = gltf.scene;

            var tempMixer = new AnimationMixer(akSpring);
            
            var reload = new AnimationClip.findByName(gltf.animations, "akSpringReload");
            var shoot = new AnimationClip.findByName(gltf.animations, "akShoot");

            var anim1 = tempMixer.clipAction(shoot);
            var anim2 = tempMixer.clipAction(reload);

            this.mixers.push(tempMixer);
            tempMesh.push(akSpring);
            tempShoot.push(anim1);
            tempReload.push(anim2);

            this.scene.add(akSpring);
        });

        // load muzzle
        var muzzleTex = this.textureLoader.load("./images/muzzle.png");
        this.gltfLoader.load(("./meshes/muzzle.glb"), (gltf) => {
            var muzzle = gltf.scene;
            var muzzleMat = new MeshBasicMaterial({ color: 0xffffff, map: muzzleTex, transparent: true, opacity: 1, side: 2 });
            muzzle.children[0].material = muzzleMat;
            muzzle.visible = false;

            var tempMixer = new AnimationMixer(muzzle);
            var tempAnims = gltf.animations;

            var anim1 = tempMixer.clipAction(tempAnims[0]);

            this.mixers.push(tempMixer);
            tempMuzzle.push(muzzle);
            tempShoot.push(anim1);

            this.scene.add(muzzle);
        });

        // load hands
        this.gltfLoader.load("./meshes/handenRe.glb", (gltf) => {
            var handen = gltf.scene;

            var tempMixer = new AnimationMixer(handen);

            var reload = new AnimationClip.findByName(gltf.animations, "handReload");
            var shoot = new AnimationClip.findByName(gltf.animations, "shoot");

            var anim1 = tempMixer.clipAction(reload);
            var anim2 = tempMixer.clipAction(shoot);

            this.mixers.push(tempMixer);
            tempHandMesh.push(handen);
            tempHandShoot.push(anim2);
            tempHandReload.push(anim1);

            this.scene.add(handen);
        });

        // load crosshairs
        var crosshairTexture = this.textureLoader.load("./images/crosshairs.png");
        this.gltfLoader.load("./meshes/akAim.glb", (gltf) => {
            var crosshairs = gltf.scene;
            var crosshairsMat = new MeshBasicMaterial({ color: 0xffffff, map: crosshairTexture, transparent: true, opacity: 1, side: 2 });
            crosshairs.children[0].material = crosshairsMat;

            this.crosshairs.mesh = crosshairs;

            this.scene.add(crosshairs);
        });

        // load enemy
        this.gltfLoader.load("./meshes/twitter.glb", (gltf) => {
            var twitter = gltf.scene;

            var tempMixer = new AnimationMixer(twitter);

            var fly = new AnimationClip.findByName(gltf.animations, "fly");
            fly.optimize();

            var anim1 = tempMixer.clipAction(fly);

            this.mixers.push(tempMixer);
            tempEnemyMesh.push(twitter);
            tempEnemyAnims.push(fly);

            anim1.play();

            twitter.position.y = 1;

            this.scene.add(twitter);
        });

        // create a temp ak object
        this.tempAk.mesh = tempMesh;
        this.tempAk.animations = { shoot: tempShoot, reload: tempReload };
        this.tempAk.muzzle = tempMuzzle;

        // create weapon
        this.weapon = new Weapon("ak", 30, this.tempAk);

        // create a temp hands object
        this.tempHands.mesh = tempHandMesh;
        this.tempHands.animations.ak = { shoot: tempHandShoot, reload: tempHandReload };
        //Object.assign(this.tempHands.animations, { ak: this.weapon});

        // create hands
        this.hands = new Hands(this.tempHands)

        // create temp enemy
        this.tempEnemy.mesh = tempEnemyMesh;
        this.tempEnemy.animations = { idle: tempEnemyAnims };
        this.enemy = new Enemy(this.tempEnemy);

        // add entities to assetmap
        Object.assign(this.assetMap.weaponObjects, { ak: this.weapon });
        Object.assign(this.assetMap.playerObjects, { hands: this.hands }, { crosshairs: this.crosshairs });
        Object.assign(this.assetMap.enemyObjects, { twitter: this.enemy });
    }

}
export {AssetManager};