//tpt2
import * as THREE from 'three'
function vect(x, y, z) {
    const output = new THREE.Vector3(x, y, z);
    return output;
}
function quat(rot, vectr) {
    const rotation = rot / 180 * Math.PI;
    const vector = vectr == 'x' ? vect(1, 0, 0) : vectr == 'y' ? vect(0, 0, 1) : vectr == 'z' ? vect(0, 0, 1) : null;
    const output = new THREE.Quaternion().setFromAxisAngle(vector, rotation);
    return output;
}
let alignment =  [[vect(0, 0, 0)]];
let rightRails = [[vect(0.5, 0, 0)]];
let leftRails =  [[vect(-0.5, 0, 0)]];
function rail(target, coaster) {
    //make rail from point a to point b
    alignment[coaster].push(target)
    const align = new THREE.TubeGeometry(alignment)
}
let isEditor = false;
function editor() {
    if (isEditor) {

    }
}
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);
const fog = new THREE.FogExp2(0x222222, 0.03);
scene.add(fog);
const render = new THREE.WebGLRenderer();
let fov = 90;
let renderDistance = 1000;
const cam = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.01, renderDistance);
let keys = [];
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// adding the framework for rails
function anim() {
    requestAnimationFrame(anim);
    //anim loop
    render.render(scene, cam);
}
anim();