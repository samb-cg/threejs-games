import * as THREE from "./build/three.module.js";
import {GLTFLoader} from "./examples/jsm/loaders/GLTFLoader.js";
import Stats from "./examples/jsm/libs/stats.module.js";

var blocker = document.getElementById( "blocker" );
var playButton = document.getElementById( "playButton" );

var scene,stats, camera, renderer, loader, manager, mixer;
var fov, near, far;
var ground;

var controlsLocked = false;
var player = new THREE.Object3D;
var rotationGoal = new THREE.Object3D;
var cameragoal = new THREE.Object3D;
var kyle, kyleHandBone, kyleSkinnedMesh;
var idleAction, runAction, runLeft, runRight, runBack, trowAction, jumpAction, jumpAction2, dieAction;
var actions = [];
var moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;

var prevTime = performance.now();
var temp = new THREE.Vector3;
var direction = new THREE.Vector3;
var velocity = new THREE.Vector3;
var euler = new THREE.Euler( 0, 0, 0, "YXZ");
var euler2 = new THREE.Euler( 0, 0, 0, "YXZ" );
var playerRot;
var canJump = false;

var snowballTrown = false;
var snowballGoal = new THREE.Vector3;
var kyleCube;
var snowBallObjects = new THREE.Object3D;
var crosshair;
var test = new THREE.Vector3;

var handSnowball;
var snowball = new THREE.Object3D;
snowball.velocity;
snowball.direction = new THREE.Vector3();
snowball.distance = 0;
var throwRange = 15;

var snowballTarget = new THREE.Vector3( 0, 0, 0 );
var canShoot = false;
var shoot = false;

var collisionIndex = new THREE.Object3D;

var npcObject = new THREE.Object3D;
var npcIdle;
var npcMixers = [];

init();
animate();

function init() { 
    document.addEventListener( "keydown", handleKeydown, false );
    document.addEventListener( "keyup", handleKeyup, false );
    document.addEventListener( "mousemove", moveMouse, false );
    document.addEventListener( "wheel", onWheelMove, false );
    document.addEventListener( "mousedown", onMouseDown, false );
    document.addEventListener( "mouseup", onMouseUp, false);
    window.addEventListener( 'resize', onWindowResize, false );

    function onMouseDown() {
        if( !controlsLocked ) return;
        idleAction.stop();
        trowAction.play();
        trowAction.setLoop( THREE.LoopOnce );
        snowball = new THREE.Mesh( snowballGeo, snowballMat );
        snowball.position.copy( player.position );
        snowball.position.y+=0.1;

        var start = new THREE.Vector3().copy( player.position );
        var target = new THREE.Vector3();
        target.copy( crosshair.getWorldPosition( target ) );
        var dirr = new THREE.Vector3().subVectors( target, start ).normalize();
        dirr.multiplyScalar( 0.2 );

        snowball.direction = dirr;
        snowball.distance = 0;
        snowBallObjects.add( snowball );
        
        var lastChild;
        for ( var i = 0; i < snowBallObjects.children.length; i++ ) {
            lastChild = snowBallObjects.children[ i ];
        }
        lastChild.name = i;
        lastChild.direction = dirr;
        lastChild.distance = 0;

        if ( snowBallObjects.children.length > 5 ) {
            var firstChild = snowBallObjects.children[0];
            snowBallObjects.remove( firstChild );
        }
        shoot = true;

    }

    function onMouseUp() {
        if( !controlsLocked ) return;
        idleAction.play();
        trowAction.reset();

        var test = new THREE.Vector3();
        kyleHandBone.getWorldPosition( test );
    }

    function onWheelMove() { //basic zoom function
        if( !controlsLocked ) return;
        if( event.deltaY > 0 ) cameragoal.position.z -= 0.1;
        if( event.deltaY < 0 ) cameragoal.position.z += 0.1;
    }

    playButton.onclick = function() {
        document.body.requestPointerLock();
    } 

    document.addEventListener('pointerlockchange', function() {
        controlsLocked = !controlsLocked;
        hideMenu();
    }, false);

    function hideMenu() {  
        if( controlsLocked ) {
            document.getElementById("blocker").style.display = "none";
            document.getElementById("instructions").style.display = "none";
        } else {
            document.getElementById("blocker").style.display = "flex";
            document.getElementById("instructions").style.display = "block";
        }
    };
    function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

    //cubemap
    var cubeUrls = [
        "./cubemap/Xpos.png", "./cubemap/Xneg.png",
        "./cubemap/Ypos.png", "./cubemap/Yneg.png",
        "./cubemap/Zpos.png", "./cubemap/Zneg.png",
    ];
    var cubemap = new THREE.CubeTextureLoader().load( cubeUrls );
    scene = new THREE.Scene();
    scene.background = cubemap;


    fov = 75;
    near = 0.1;
    far = 100;
    camera = new THREE.PerspectiveCamera(fov, window.innerWidth/window.innerHeight, near, far );
    renderer = new THREE.WebGLRenderer( { antiallias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild( renderer.domElement );

    stats = new Stats();
    document.body.appendChild( stats.dom );

    //let there be light
    var hemiLight = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
    hemiLight.position.set( 0.5, 1, 0.75 );
    scene.add( hemiLight );
    var ambientLight = new THREE.AmbientLight( 0xffffff , 1);
    //scene.add(ambientLight);
    var dirLight = new THREE.DirectionalLight( 0xffffff );
	dirLight.position.set( 0, 40, 10 );
    dirLight.castShadow = true;
    scene.add( dirLight );
    var lightHelper = new THREE.DirectionalLightHelper( dirLight, 5, "yellow" );
    scene.add( lightHelper );
    

    manager = new THREE.LoadingManager();
    manager.onStart = function( url, itemsLoaded, itemsTotal ) {
        console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    };
    manager.onLoad = function ( ) {
        console.log( 'Loading complete!');
        moveNpcs();
    };
    manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
        console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    };
    manager.onError = function ( url ) {
        console.log( 'There was an error loading ' + url );
    };
    loader = new GLTFLoader( manager );

    //add ground
    var levelAssets = {
        ground : { url: "./models/terain/southpark_grond.glb" },
        sign : { url : "./models/terain/southpark_bord.glb" },
        pole : { url : "./models/terain/southpark_paal.glb" },
        stripes : { url : "./models/terain/southpark_strepen.glb" },
        pineTrees : { url : "./models/terain/pineTrees.glb" }
    };
    for( var i = 0; i < Object.keys( levelAssets ).length; i++ ) {
        var tempAsset = Object.values( levelAssets )[i];
        loader.load( tempAsset.url, function( gltf ) {
            var tempAsset2 = gltf.scene;
            tempAsset2.position.y += 1;
            scene.add( tempAsset2 );
        } );
    }

    var npc = {
        cartman : { url : "./models/cartman.glb" },
        kenny : { url : "./models/kenny.glb" },
        stan : { url : "./models/stan.glb" }
    }
    for( var i = 0; i < Object.keys( npc ).length; i++ ) {
        var tempAsset = Object.values( npc )[i];
        loader.load( tempAsset.url, function( gltf ) {
            var tempAsset2 = gltf.scene;
            tempAsset2.position.y += 1;  
            var mixerTemp = new THREE.AnimationMixer( tempAsset2 );
            var animations = gltf.animations;
            npcIdle = mixerTemp.clipAction( animations[ 0 ] );
            npcIdle.play();             
            npcMixers.push( mixerTemp );
            npcObject.add( tempAsset2 );
        } );
        scene.add( npcObject );
    }
    function moveNpcs() {
        for( var i = 0; i < npcObject.children.length; i++ ) {
            var test2 = npcObject.children[i];
            test2.position.x = i * 2;
        }
    }

    //add crosshair
    var crosshairGeo = new THREE.SphereGeometry( 0.2, 6, 6 );
    var crosshairMat = new THREE.MeshBasicMaterial( { color: "red"} );
    crosshair = new THREE.Mesh( crosshairGeo, crosshairMat );

    //add snowball
    var snowballGeo = new THREE.SphereGeometry( 0.1, 32, 32);
    var snowballMat = new THREE.MeshBasicMaterial( { color: "white" } );
    snowball = new THREE.Mesh( snowballGeo, snowballMat );
    scene.add( snowBallObjects );

    loader.load( "./models/kyle.glb", function( gltf ) {
        kyle = gltf.scene;
        var animations = gltf.animations;
        mixer = new THREE.AnimationMixer( kyle );
        idleAction = mixer.clipAction( animations[ 1 ] );
        runAction = mixer.clipAction( animations[ 5 ] );
        runLeft = mixer.clipAction( animations[ 4 ] );
        runRight = mixer.clipAction( animations[ 6 ] );
        runBack = mixer.clipAction( animations[ 5 ] );
        dieAction = mixer.clipAction( animations[ 0 ] );


        dieAction.setLoop( THREE.LoopOnce);
        dieAction.clampWhenFinished = true;

        trowAction = mixer.clipAction( animations[ 3 ] );
        trowAction.setDuration( 0.8 );
        actions = [ idleAction, runAction, runLeft, runRight, runBack, trowAction ];
        idleAction.play();

        kyleSkinnedMesh = kyle.getObjectByName( "kyleMesh001" );
        kyleHandBone = kyleSkinnedMesh.skeleton.getBoneByName( "handR" );

        rotationGoal.add( crosshair );
        rotationGoal.add( cameragoal );
        scene.add( rotationGoal );
        cameragoal.position.set( 0, 2, -7 ); //XYZ
        crosshair.position.set( 0, 2, 15 );
        player.add( kyle );
        scene.add( player );
    } );

    //add kyle cube
    var kyleCubeGeo = new THREE.BoxBufferGeometry( 1, 2, 1 );
    var kyleCubeMat = new THREE.MeshPhongMaterial( { color: "green" } );
    for( var i = 0; i < 10; i++ ) {
        var kyleCube = new THREE.Mesh( kyleCubeGeo, kyleCubeMat );
        kyleCube.position.x = 8 - (i * 2);
        kyleCube.position.y = 2;
        kyleCube.position.z = 10;
        collisionIndex.add( kyleCube );
    }
    scene.add( collisionIndex ); 
}

function handleKeydown() {
    var keyCode = event.which;
    switch( keyCode ) {
        case 87:
            moveForward = true;
            idleAction.stop();
            runAction.play();
            break;
        case 83:
            moveBackward = true;
            idleAction.stop();
            runBack.play();
            break;
        case 65:
            moveLeft = true;
            idleAction.stop();
            runLeft.play();
            break;
        case 68:
            moveRight = true;
            idleAction.stop();
            runRight.play();
            break;
        case 32: //space
            if( canJump === true ) velocity.y += 20;
            canJump = false;
            break; 
    }   
}
function handleKeyup() {
    var keyCode = event.which;
    switch( keyCode ) {
        case 87:
            moveForward = false;
            idleAction.play();
            runAction.stop();
            break;
        case 83:
            moveBackward = false;
            idleAction.play();
            runBack.stop();
            break;
        case 65:
            moveLeft = false;
            idleAction.play();
            runLeft.stop();
            break;
        case 68:
            moveRight = false;
            idleAction.play();
            runRight.stop();
            break;
    }
}
function moveZ( distance ) {
    var vec = new THREE.Vector3;
    vec.setFromMatrixColumn( player.matrix, 0 );
    vec.crossVectors( player.up, vec );
    player.position.addScaledVector( vec, distance );
}
function moveX( distance ) {
    var vec = new THREE.Vector3;
    vec.setFromMatrixColumn( player.matrix, 0 );
    player.position.addScaledVector( vec, distance );
}

function moveMouse() {
    if( !controlsLocked ) return;
    var movementX = event.movementX || 0;
    var movementY = event.movementY || 0;
    euler.setFromQuaternion( rotationGoal.quaternion );
    euler.y -= movementX * 0.002;
    euler.x -= movementY * 0.002;
    euler.x = Math.max( (-Math.PI/2), Math.min( Math.PI/2, euler.x ) );
    euler2.y = euler.y;
    rotationGoal.quaternion.setFromEuler( euler );
    crosshair.quaternion.setFromEuler( euler );
}

function updateSnowball( value ) {
    for( var i = 0; i < snowBallObjects.children.length; i++ ) {
        var tempSnowball = snowBallObjects.children[ i ];
        if( tempSnowball.distance < throwRange && tempSnowball.position.y > 0 ) {
            tempSnowball.distance += 0.2;
            tempSnowball.position.add( tempSnowball.direction );
        }
        if( tempSnowball.distance > throwRange && tempSnowball.position.y > 0 ) {
            tempSnowball.direction.y -= 0.005;
            tempSnowball.position.add( tempSnowball.direction );
        }
        //check for collision
        var snowballBB = new THREE.Box3().setFromObject( tempSnowball );
        for( var j = 0; j < collisionIndex.children.length; j++ ) {
            var collisionBB = new THREE.Box3().setFromObject( collisionIndex.children[j] );
            var intersects = snowballBB.intersectsBox( collisionBB );
            if( intersects ){
                collisionIndex.children[j].material = new THREE.MeshBasicMaterial( { color: "red" } );
            } 
        }
    }
}



function animate() { 
    requestAnimationFrame( animate );

    var time = performance.now();
    var delta = ( time - prevTime ) / 1000;
    prevTime = time;

    //this smooths player movement rather stopping immediately.
    velocity.z -= velocity.z * 10.0 * delta;
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.y -= 9.8 * 7 * delta; // 100 = mass

    // 1 or -1 in direction z or x
    direction.z -= Number( moveBackward ) - Number( moveForward );
    direction.x -= Number( moveLeft ) - Number( moveRight );
    direction.normalize();

    if( moveForward || moveBackward ) {
        player.quaternion.setFromEuler( euler2 );
        velocity.z -= direction.z * 50 * delta;
    }
    if( moveLeft || moveRight ) {
        player.quaternion.setFromEuler( euler2 );
        velocity.x -= direction.x * 50 * delta;
    } 

    if( shoot ) updateSnowball();
    moveZ( velocity.z * delta );
    moveX( velocity.x * delta );
    player.position.y += ( velocity.y * delta ); //new behavior
            
    if ( player.position.y < 1 ){
        velocity.y = 0;
        player.position.y = 1;
        canJump = true;
    }
    canJump = true;

    rotationGoal.position.copy( player.position );
    temp.setFromMatrixPosition( cameragoal.matrixWorld );
    camera.position.lerp( temp, 0.2);
    camera.lookAt( rotationGoal.position );

    mixer.update( delta * 2 );
    for( var i of npcMixers ) {
        i.update( delta * 2 );
    }
    stats.update();
    renderer.render( scene, camera );
}