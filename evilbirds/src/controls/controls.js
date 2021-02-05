import {
    Vector2,
    Vector3,
    Euler
} from "../../../build/three.module.js";


class Controls {

    constructor(player, domElement) {

        this.player = player;

        this.domElement = domElement;

        if (this.domElement === undefined) {
            console.warn('THREE.FirstPersonControls: The second parameter "domElement" is now mandatory.');
            this.domElement = document;
        }

        this.controlsLocked = false;

        this.mouse = new Vector2();

        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;

        this.euler = new Euler(0, 0, 0, "YXZ");
        this.playerDirection = new Vector3();

        if (this.domElement !== document) {
            this.domElement.setAttributes('tabindex', -1);
        }

        this._mouseDownHandler = onMouseDown.bind(this);
        this._mouseUpHandler = onMouseUp.bind(this);
        this._mouseMoveHandler = onMouseMove.bind(this);
        this._keyDownHandler = onKeyDown.bind(this);
        this._keyUpHandler = onKeyUp.bind(this);

    }

    init() {
        // Events
        document.addEventListener('mousedown', this._mouseDownHandler, false);
        document.addEventListener('mouseup', this._mouseUpHandler, false);
        document.addEventListener('mousemove', this._mouseMoveHandler, false);
        document.addEventListener('keydown', this._keyDownHandler, false);
        document.addEventListener('keyup', this._keyUpHandler, false);
    }

    update() {
        if (this.controlsLocked === false) return;

        this.playerDirection.z -= Number(this.moveBackward) - Number(this.moveForward);
        this.playerDirection.x -= Number(this.moveLeft) - Number(this.moveRight);
        this.playerDirection.normalize();

        if (this.moveForward || this.moveBackward) {
            moveZ(this.playerDirection.z * 0.1,this.player.head);
        }
        if (this.moveLeft || this.moveRight) {
            move(this.playerDirection.x * 0.1, this.player.head);
        }

    };
    
}

function onMouseDown(event) {
    if (this.controlsLocked === false) return;
    this.player.shoot();
};

function onMouseUp(event) {
    if(this.controlsLocked === false) return;
    this.player.stopShoot();
};

function onMouseMove(event) {
    if (this.controlsLocked === false) return;

    this.mouse.x = event.movementX || 0;
    this.mouse.y= event.movementY || 0;

    this.euler.setFromQuaternion(this.player.head.quaternion);
    this.euler.x -= this.mouse.y * 0.002;
    this.euler.y -= this.mouse.x * 0.002;
    this.player.head.quaternion.setFromEuler(this.euler);
};

function onKeyDown(event) {
    if (this.controlsLocked === false) return;

    switch (event.keyCode) {
        case 38: /*up*/
        case 87: /*W*/ this.moveForward = true; break;

        case 37: /*left*/
        case 65: /*A*/ this.moveLeft = true; break;

        case 40: /*down*/
        case 83: /*S*/ this.moveBackward = true; break;

        case 39: /*right*/
        case 68: /*D*/ this.moveRight = true; break;

        case 82: /*R*/ this.player.reload(); break;
    }
};

function onKeyUp(event) {
    if (this.controlsLocked === false) return;

    switch (event.keyCode) {
        case 38: /*up*/
        case 87: /*W*/ this.moveForward = false; break;

        case 37: /*left*/
        case 65: /*A*/ this.moveLeft = false; break;

        case 40: /*down*/
        case 83: /*S*/ this.moveBackward = false; break;

        case 39: /*right*/
        case 68: /*D*/ this.moveRight = false; break;

    }
};

function moveZ(distance,playerObj) {
    var vec = new Vector3;
    vec.setFromMatrixColumn(playerObj.matrix, 0);
    vec.crossVectors(playerObj.up, vec);
    playerObj.position.addScaledVector(vec, distance);
}
function move(distance, playerObj) {
    var vec = new Vector3;
    vec.setFromMatrixColumn(playerObj.matrix, 0);
    playerObj.position.addScaledVector(vec, distance);
}
export {Controls};