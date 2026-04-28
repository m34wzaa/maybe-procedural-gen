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
function rail(target, coaster, rollFactor) {
	//make rail from point a to point b
	alignment[coaster].push(target);
	if (alignment[coaster].length < 2) return;
	const roll = rollFactor / 180 * Math.PI;
	const align = new THREE.TubeGeometry(alignment[coaster]);
	const curve = new THREE.CatmullRomCurve3(alignment[coaster]);
	const frames = curve.computeFrenetFrames(segments, false);
	const i = segments;
	const t = frames.tangents[i];
	const n = frames.normals[i];
	const b = frames.binormals[i];
	const matrix = new THREE.Matrix4().makeBasis(n, b, t);
	const quaternion = new THREE.Quaternion().setFromRotationMatrix(matrix);
	const rollq = new THREE.Quaternion().setFromAxisAngle(t, roll);
	rollq.multiply(quaternion);
	const right = vect(0.5, 0, 0).applyQuaternion(rollq);
	const left = vect(-0.5, 0, 0).applyQuaternion(rollq);
	rightRails[coaster].push(target.clone().add(right));
	leftRails[coaster].push(target.clone().add(left));
	dr = 0
	dx = 0
	dy = 0
}
let line;
function showSpline(start, target, coaster, rollFactor) {
	//show the line first
	//e
	const curve = new THREE.CatmullRomCurve3([start, target])
	line = new THREE.Line(curve);
}
let isEditor = false;
let dr = 0;
let dx = 0;
let dz = 0;
let dy = 0;
let coaster = 0
function editor() {
	if (isEditor) {
		if (keys['a']) dx -= 0.01;
		if (keys['d']) dx += 0.01;
		if (keys['s']) dy -= 0.01;
		if (keys['w']) dy += 0.01;
		if (keys['q']) dr -= 0.01;
		if (keys['e']) dr += 0.01;
		const startVector = alignment[coaster][alignment[coaster].length];
		showSpline(startVector, vect(startVector.position.x + dx, startVector.position.y + dy, startVector.position.z + dz), coaster, roll);
	}
}
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);
const fog = new THREE.FogExp2(0x222222, 0.03);
scene.fog = fog;
const render = new THREE.WebGLRenderer();
render.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(render.domElement)
let fov = 90;
let renderDistance = 1000;
const cam = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.01, renderDistance);
cam.position.set(0, 3, 0)
let keys = [];
document.addEventListener('keydown', (e) => {
	keys[e.key] = true;
});
document.addEventListener('keyup', (e) => {
	keys[e.key] = false;
});
document.addEventListener('click', () => {
	if (!document.pointerLockElement) {
		render.domElement.requestPointerLock();
	}
})

function anim() {
	requestAnimationFrame(anim);
	//anim loop
	render.render(scene, cam);
}
anim();