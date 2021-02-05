import * as THREE from "../build/three.module.js";
import {GLTFLoader} from "../examples/jsm/loaders/GLTFLoader.js";
import Stats from "../examples/jsm/libs/stats.module.js";

var stats;

var scene, camera, renderer, gltfLoader, texLoader, mixer, manager;

var rockArr = [];
var rockInterval = 3; // distance between individual rocks
const collisionItems = new THREE.Object3D;

var dino, dinoBounds, dinoShadow;
var actions, dieAction, jumpAction, runAction;

var controlsLocked = false;

// game config
var rightWall = 4;
var leftWall = -4;

var velocity = new THREE.Vector3;
var direction = new THREE.Vector3;

var moveLeft = false;
var moveRight = false;
var canJump = false;

var speed = 0.1;
var turnSpeed = 0.1;

var isDead = false;
var blockerTimer = 0; 

var scoreHUD = document.getElementById("scoreDiv");
var score = 0;

var prevTime = performance.now();


init();
animate();

function init(){
    // fps counter
    stats = new Stats();
    document.body.appendChild(stats.dom);

    // init scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x45c3ff);
    scene.fog = new THREE.Fog(0xffffff,0.1,100);

    // init camera
    var fov = 75;
    var aspect = window.innerWidth/ window.innerHeight;
    var near = 0.1;
    var far = 100;
    camera = new THREE.PerspectiveCamera(fov, aspect,near,far);
    scene.add(camera);
    camera.position.set(0,3,-8);
    camera.lookAt(0,0,0);


    // init renderer
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild( renderer.domElement );
    window.addEventListener( 'resize', onWindowResize, false );

    // lights
    var hemiLight = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
    hemiLight.position.set(0,1,0.75);
    scene.add(hemiLight);


    // init loadingmanager
    manager = new THREE.LoadingManager();
    manager.onStart = function(url,itemsLoaded,itemsTotal){
        console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    }
    manager.onLoad = function(){
        console.log("Loading complete.");
        appendRocks();
    }
    manager.onProgress = function (url,itemsLoaded,itemsTotal) {
        console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    };
    manager.onError = function (url) {
        console.log( 'There was an error loading ' + url );
    };

    // load background
    texLoader = new THREE.TextureLoader();
    var skyTex = texLoader.load("./models/textures/sky.png");
    scene.background = skyTex;

    // load level
    gltfLoader = new GLTFLoader(manager);
    gltfLoader.load("./models/river.glb",function(gltf){
        var level = gltf.scene;
        scene.add(level);
    });

    // load rocks
    var rockUrls = ["./models/rock/rock1.glb","./models/rock/rock2.glb","./models/rock/rock3.glb"];

    for(let i =0;i<rockUrls.length;i++){
        gltfLoader.load(rockUrls[i], function(gltf){
            var rock = gltf.scene;
            rockArr.push(rock.children[0]);
        });
    }

    // load dino shadow
    var dinoShadowTex = texLoader.load("./models/textures/dino_shadow.png");
    var dinoShadowGeo = new THREE.PlaneBufferGeometry( 1, 1 );
    var dinoShadowMat = new THREE.MeshBasicMaterial({
        map : dinoShadowTex,
        transparent : true,
        depthWrite : false,
        side : THREE.DoubleSide
    });
    dinoShadow = new THREE.Mesh( dinoShadowGeo, dinoShadowMat );
    dinoShadow.rotation.x = Math.PI / 2 ;
    dinoShadow.rotation.z = Math.PI;
    dinoShadow.position.y = 0.1;
    dinoShadow.scale.set( 1.5, 1.5, 1.5);
    dinoShadow.name = "shadowPlane";
    scene.add( dinoShadow );

    // load dino model
    gltfLoader.load('./models/dino_model.glb', function ( gltf ) {
        dino = gltf.scene; 
        dinoBounds = dino.getObjectByName( "boundMesh" );
        dinoBounds.material = new THREE.MeshBasicMaterial( {color: "yellow", wireframe: true, visible: false} );
        var animations = gltf.animations;

        mixer = new THREE.AnimationMixer( dino );
        dieAction = mixer.clipAction( animations[ 2 ] );
        dieAction.setLoop( THREE.LoopOnce );
        dieAction.clampWhenFinished = true;
        jumpAction = mixer.clipAction( animations[ 0 ]);
        runAction = mixer.clipAction( animations[ 1 ] );

        runAction.play();

        actions = [ runAction, dieAction, jumpAction ];
        scene.add( dino );
    } );

    // movement
    document.addEventListener("keyup",()=>{
        onKeyUp();
    },false);
    document.addEventListener("keydown",()=>{
        onKeyDown();
    },false);
}

// create array with 1000 random rocks
function appendRocks(){
    scene.add(collisionItems);
    for(let i=0; i<1000;i++){
        var randInt = Math.floor(Math.random()*3);
        let randRock = rockArr[randInt].clone();
        collisionItems.add(randRock);
    }
    spreadRocks();
}

// spread rocks 
function spreadRocks(){
    var zPos = 10;
    for(let i=0;i<collisionItems.children.length;i++){
        let randPos = leftWall + Math.random()*10;
        collisionItems.children[i].position.set(randPos,0,zPos);
        zPos += rockInterval;
    }
}

// UI buttons
var resetBtn = document.getElementById("resetBtn");
resetBtn.addEventListener("click", ()=>{
    resetGame();
},false); 

function resetGame(){
    speed = 0.1;
    blockerTimer = 0;
    spreadRocks();
    jumpAction.stop();
    dieAction.stop();
    runAction.play();
    dino.position.set(0,0,0);
    dino.rotation.y = 0;
    dinoShadow.rotation.z = Math.PI;
    dinoShadow.material.opacity = 1;
    camera.position.z = -8;
    isDead = false;
}

document.addEventListener("pointerlockchange", ()=>{
    controlsLocked = !controlsLocked;
    hideMenu();
},false);

var playBtn = document.getElementById("playBtn");
playBtn.addEventListener("click", ()=>{
    document.body.requestPointerLock();
},false);

var blocker = document.getElementById("blocker");
function hideMenu(){
    if(controlsLocked){
        blocker.style.display = "none";
    }else{
        blocker.style.display = "flex";
    }
}


function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
}

function onKeyDown(){
    var keyCode = event.which;
    switch( keyCode ) {
        case 65:
            moveLeft = true;
            break;
        case 68:
            moveRight = true;
            break;
        case 32: //space
            if( canJump === true ) velocity.y += 20;
            canJump = false;
            break; 
    }
}

function onKeyUp(){
    var keyCode = event.which;

    if(!isDead){
        dino.rotation.y = 0;
        dinoShadow.rotation.z = Math.PI;
    }
    switch( keyCode ) {
        case 65:
            moveLeft = false;
            break;
        case 68:
            moveRight = false;
            break;
    }
}

// check for collision between dino and rocks
function collisionCheck(){
    if(dino.position.z < 10)return;
    var dinoBoundingBox = new THREE.Box3().setFromObject(dinoBounds);
    var spat1 = Math.floor(dino.position.z/rockInterval)-3;
    var spat2 = spat1+21;
    for(var i =spat1; i< spat2;i++){
        var rockBoundingBox = new THREE.Box3().setFromObject(collisionItems.children[i]);
        var intersect = dinoBoundingBox.intersectsBox(rockBoundingBox);
        if(intersect) isDead = true;
    }
}

function animate(){

    requestAnimationFrame(animate);

    var time = performance.now();
    var delta = (time - prevTime) /1000;

    if(controlsLocked && !isDead){
        collisionCheck();

        velocity.y -= 9.8 * 7 *delta;

        // change z pos
        dino.position.z += speed;
        dinoShadow.position.copy(dino.position);
        dinoShadow.position.y = 0.1;
        camera.position.z += speed;

        // rotate dino
        if(moveLeft && dino.position.x < rightWall){
            dino.rotation.y = 45;
            dino.position.x += turnSpeed;
            dinoShadow.rotation.z = Math.PI / 1.5;
        }
        if(moveRight && dino.position.x > leftWall){
            dino.rotation.y = -45;
            dino.position.x -= turnSpeed;
            dinoShadow.rotation.z = - Math.PI / 1.5;
        }
        dino.position.y += velocity.y * delta;

        // jump
        if(dino.position.y < 0){
            velocity.y = 0;
            dino.position.y = 0;
            canJump = true; 
        }

        if(dino.position.y > 0){
            dinoShadow.material.opacity = 1 - dino.position.y *0.3;
            jumpAction.play();
            if(dino.position.y < 1){
                jumpAction.stop();
            }
        }

        mixer.update(delta*4);
        speed += 0.0001;

        //update HUD
        score = Math.floor(dino.position.z);
        scoreDiv.innerHTML = score;

    }
    if(isDead){
        jumpAction.stop();
        runAction.stop();
        dieAction.play();
        dinoShadow.material.opacity = 0;
        dino.position.y = 0;

        mixer.update(delta*4);

        blockerTimer+=1;
        if(blockerTimer==50){
            document.exitPointerLock();
            hideMenu();
        }

        // update highscore
        var highscore = document.getElementById("highScore").innerHTML;
        if(score > highscore){
            document.getElementById("highScore").innerHTML = score;
        }
    }

    prevTime = performance.now();
    stats.update();
    renderer.render(scene,camera);
}