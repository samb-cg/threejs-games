import * as THREE from "../build/three.module.js";
import {GLTFLoader} from "../examples/jsm/loaders/GLTFLoader.js";
import {SkeletonUtils} from "../examples/jsm/utils/SkeletonUtils.js";
import Stats from "../examples/jsm/libs/stats.module.js";
import {Sky} from "../examples/jsm/objects/Sky.js";
import {AssetManager} from "./src/core/assetmanager.js";
import {Player} from "./src/entities/player.js";
import {BulletManager} from "./src/weapons/bulletmanager.js";
import {CollisionManager} from "./src/core/collisionmanager.js";
import {Controls} from "./src/controls/controls.js";
import {Enemy} from "./src/entities/enemy.js";
import {EnemyManager} from "./src/entities/enemymanager.js";
import {Hands} from "./src/entities/hands.js";
import {Weapon} from "./src/weapons/weapon.js";
import {WeaponManager} from "./src/weapons/weaponmanager.js";


// dom
var playButton;
var controlsLocked = false;
var isPlaying = true;
var gameHasStarted = false;

// scene
var scene, camera, renderer;

var prevTime = performance.now();

var stats;

// seperate js files
var controls, collision, assets, enemy, enemyManager;

// sky
var sky, sun;

// assets
var assetMap = {
    playerObjects: {},
    weaponObjects: {},
    terrainObjects: {},
    enemyObjects: {}
}

// animation 
var mixers = [];
var animations = [];

// player
var player, playerBounds;
var bulletManager, bullet;
var weaponSystem;

init();
animate();

function initSky() {
    sky = new Sky();
    sky.scale.setScalar(1000);
    sky.material.uniforms.turbidity.value = 5;
    sky.material.uniforms.rayleigh.value = 1.5;
    sky.material.uniforms.sunPosition.value.set(- 700, 1000, - 750);
    scene.add(sky);
}

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.05, 100);
    camera.position.set(0, 1.7, 0);

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    document.body.appendChild(renderer.domElement);

    stats = new Stats();
    document.body.appendChild(stats.dom);

    var hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    hemiLight.position.set(0, 100, 0);
    scene.add(hemiLight);

    var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(- 700, 1000, - 750);
    scene.add(dirLight);

    initSky();

    var planeGeo = new THREE.PlaneBufferGeometry(10, 10, 2);
    var planeMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    var plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = Math.PI / 2;
    scene.add(plane);

    // will be collision hull
    var cubeGeo = new THREE.SphereGeometry(1, 16, 16);
    var cubeMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    var cube = new THREE.Mesh(cubeGeo, cubeMat);
    Object.assign(assetMap.playerObjects, { bounds: cube });
    scene.add(cube);

    // load and group assets into assetmap 
    assets = new AssetManager(scene, assetMap, mixers);
    assets.init();

    // player
    player = new Player(camera, player, assetMap, scene);
    player.init();

    // controls
    controls = new Controls(player, document);
    controls.init();

    // enemy 
    enemy = new Enemy(assetMap.enemyObjects);
    enemyManager = new EnemyManager(scene, assetMap);
    enemyManager.init();

    // scene events
    window.addEventListener("resize", onWindowResize, false);
    document.addEventListener("pointerlockchange", onPointerlockChange, false);
    playButton = document.getElementById("playButton");

}

// update all mixers
function updateMixers(delta) {
    for (var i of mixers) {
        i.update(delta * 2);
    }
}

function animate() {
    if (!isPlaying) return;
    requestAnimationFrame(animate);

    var time = performance.now();
    var delta = (time - prevTime) / 1000;
    prevTime = time;


    controls.update();
    player.update();
    enemyManager.update();

    updateMixers(delta);

    stats.update();
    renderer.render(scene, camera);
}

// events
playButton.onclick = function () {
    document.body.requestPointerLock();
}

function onPointerlockChange() {
    controlsLocked = !controlsLocked;
    hideBlocker();
}

// hide instruction menu
function hideBlocker() {
    if (controlsLocked) {
        document.getElementById("blocker").style.display = "none";
        document.getElementById("instructions").style.display = "none";
        controls.controlsLocked = true;
        isPlaying = true;
        if (gameHasStarted) animate();
    } else {
        document.getElementById("blocker").style.display = "flex";
        document.getElementById("instructions").style.display = "block";
        controls.controlsLocked = false;
        isPlaying = false;
        gameHasStarted = true;
        window.cancelAnimationFrame(animate);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}