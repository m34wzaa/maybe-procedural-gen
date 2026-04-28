//tpt2
import * as THREE from 'three'
function vect(x, y, z) {
    const output = new THREE.Vector3(x, y, z);
    return output;
}
function quat(rot, vectr) {
    const rotation = rot / 180 * Math.PI;
    const output = new THREE.Quaternion().setFromAxisAngle(vectr, rotation);
    return output;
}
function rail(vec1, quat1, vec2, quat2) {
    //empty
}
const scene = new THREE.Scene()
const render = new THREE.WebGLRenderer();
let fov = 90;
let renderDistance = 1000
const cam = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.01, renderDistance);
function anim() {
    requestAnimationFrame(anim);
    //anim loop
    render.render(scene, cam)
}
anim()