//tpt2
import * as THREE from 'three'
function vect(x, y, z) {
	const output = new THREE.Vector3(x, y, z);
	return output;
}
function quat(rot, vectr) {
	const rotation = rot / 180 * Math.PI;
	const vector =  vectr == 'x' ? 
	vect(1, 0, 0) : vectr == 'y' ? 
	vect(0, 1, 0) : vectr == 'z' ? 
	vect(0, 0, 1) : null;
	const output = new THREE.Quaternion().setFromAxisAngle(vector, rotation);
	return output;
}
const trackMaterial = new THREE.MeshStandardMaterial({ color: 0x884444 });
let trackMeshes = [];
const TUBE_SEGMENTS = 24;
function clearTrackMeshes() {
	trackMeshes.forEach(m => {
		m.geometry.dispose();
		scene.remove(m);
	});
	trackMeshes = [];
}
let rollSegments = [[0]]
function buildRailPoints(alignCurve, offsetX, numSamples, coasterIndex) {
	const rolls = rollSegments[coasterIndex];
	const segCount = rolls.length - 1;
	const frames = alignCurve.computeFrenetFrames(numSamples, false);
	const points = [];
	for (let i = 0; i <= numSamples; i++) {
		const t = i / numSamples;
		const pos = alignCurve.getPointAt(i / numSamples);
		const segT    = t * segCount;
		const segIdx  = Math.min(Math.floor(segT), segCount - 1);
		const frac    = segT - segIdx;
		const roll = rolls[segIdx] + (rolls[segIdx + 1] - rolls[segIdx]) * frac;
		const matrix = new THREE.Matrix4().makeBasis(
			frames.normals[i],
			frames.binormals[i],
			frames.tangents[i]
		);
		const q = new THREE.Quaternion().setFromRotationMatrix(matrix);
		const rollq = new THREE.Quaternion().setFromAxisAngle(vect(0, 0, 1), roll)
		const finalQ = q.clone().multiply(rollq)
		const offset = new THREE.Vector3(offsetX, 0, 0).applyQuaternion(finalQ);
		points.push(pos.clone().add(offset));
	}
	return points;
}
let alignment =  [[vect(0, 0, 0)]];
let rightRails = [[vect(0.5, 0, 0)]];
let leftRails =  [[vect(-0.5, 0, 0)]];
function rail(target, coaster, rollFactor) {
	alignment[coaster].push(target);
	rollSegments[coaster].push(rollFactor / 180 * Math.PI)
	if (alignment[coaster].length < 2) return;
	const roll = rollFactor / 180 * Math.PI;
	const curve = new THREE.CatmullRomCurve3(alignment[coaster]);
	const segments = alignment[coaster].length - 1;
	const totalSamples = segments * TUBE_SEGMENTS;
	const frames = curve.computeFrenetFrames(segments, false);
	const i = segments;
	const t = frames.tangents[i];
	const n = frames.normals[i];
	const b = frames.binormals[i];
	const matrix = new THREE.Matrix4().makeBasis(n, b, t);
	const quaternion = new THREE.Quaternion().setFromRotationMatrix(matrix);
	const rollq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), roll);
	const finalQ = quaternion.clone().multiply(rollq);
	const right = vect(0.5, 0, 0).applyQuaternion(finalQ);
	const left  = vect(-0.5, 0, 0).applyQuaternion(finalQ);
	rightRails[coaster].push(target.clone().add(right));
	leftRails[coaster].push(target.clone().add(left));
	clearTrackMeshes();
	const addTube = (pts) => {
		const c = new THREE.CatmullRomCurve3(pts);
		const geo = new THREE.TubeGeometry(c, segments * TUBE_SEGMENTS, 0.05, 8, false);
		const mesh = new THREE.Mesh(geo, trackMaterial);
		scene.add(mesh);
		trackMeshes.push(mesh);
	};
	addTube(alignment[coaster]);
	addTube(buildRailPoints(curve,  0.5, totalSamples, coaster));
	addTube(buildRailPoints(curve, -0.5, totalSamples, coaster));
	dx = 0; dy = 0; dz = 0;
	pastDr = dr
}
let pastDr = 90;
function showSpline(start, target) {
	//show the line first
	if (start.distanceTo(target) < 0.001) return;
	const history = alignment[coaster].slice(-3);
	const curvePoints = [...history, target];
	const curve = new THREE.CatmullRomCurve3(curvePoints)
	previewGeometry.setFromPoints(curve.getPoints(20 * curvePoints.length));
	previewGeometry.attributes.position.needsUpdate = true;
}
let isEditor = true;
let dr = 90;
let dx = 0;
let dz = 0;
let dy = 0;
let coaster = 0
function editor() {
	if (isEditor) {
		const forw = new THREE.Vector3()
		cam.getWorldDirection(forw)
		forw.y = 0;
		forw.normalize()
		const right = new THREE.Vector3().crossVectors(forw, new THREE.Vector3(0, 1, 0)).normalize();
		const speed = 0.03
		if (keys['a']) { dx -= right.x * speed; dz -= right.z * speed; }
		if (keys['d']) { dx += right.x * speed; dz += right.z * speed; }
		if (keys['z']) { dx += forw.x * speed;  dz += forw.z * speed; }
		if (keys['x']) { dx -= forw.x * speed;  dz -= forw.z * speed; }
		if (keys['w']) dy += speed;
		if (keys['s']) dy -= speed;
		if (keys['q']) dr -= 1;
		if (keys['e']) dr += 1;
		if (dr >  30 + pastDr) dr =  30;
		if (dr < -30 - pastDr) dr = -30
		const startVector = alignment[coaster][alignment[coaster].length - 1];
		showSpline(startVector, vect(startVector.x + dx, startVector.y + dy, startVector.z + dz), coaster);
	} 
}
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);
const fog = new THREE.FogExp2(0x222222, 0.03);
//scene.fog = fog;
const render = new THREE.WebGLRenderer();
render.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(render.domElement)
let fov = 90;
let renderDistance = 100000;
const cam = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.01, renderDistance);
cam.position.set(0, 3, 0)
cam.lookAt(0, 0, 0);
const previewGeometry = new THREE.BufferGeometry().setFromPoints([
	vect(0, 0, 0),
	vect(0, 0, 1)
]);
const previewLine = new THREE.Line(previewGeometry, new THREE.LineBasicMaterial({ color: 0xffffff }));
scene.add(previewLine);
const light = new THREE.DirectionalLight(0xffffff, 0.7);
light.position.set(10, 20, 10);
scene.add(light);
let keys = {};
document.addEventListener('keydown', (e) => {
	if (e.key === 'Tab') { e.preventDefault(); isEditor = !isEditor; }
	if (e.key === 'Enter' && isEditor) {
		const startVector = alignment[coaster][alignment[coaster].length - 1];
		const target = vect(startVector.x + dx, startVector.y + dy, startVector.z + dz);
		if (target.distanceTo(startVector) < 0.5) return;
		rail(target, coaster, dr);
	}
	keys[e.key] = true;
});
document.addEventListener('keyup', (e) => {
	keys[e.key] = false;
});
window.addEventListener('resize', () => {
	render.setSize(window.innerWidth, window.innerHeight);
	cam.aspect = window.innerWidth / window.innerHeight;
	cam.updateProjectionMatrix();
});
document.addEventListener('click', () => {
	if (!document.pointerLockElement) {
		render.domElement.requestPointerLock();
	}
})
let yaw = 0, pitch = 0;
document.addEventListener('mousemove', (e) => {
	if (document.pointerLockElement === render.domElement) {
		yaw   -= e.movementX * 0.002;
		pitch -= e.movementY * 0.002;
		pitch  = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
		cam.rotation.order = 'YXZ';
		cam.rotation.y = yaw;
		cam.rotation.x = pitch;
	}
});
function anim() {
	requestAnimationFrame(anim);
	//anim loop
	editor();
	if (!isEditor) {
		const speed = 1;
		const dir = new THREE.Vector3();
		cam.getWorldDirection(dir);
		const right = new THREE.Vector3().crossVectors(dir, cam.up).normalize();
		if (keys['w']) cam.position.addScaledVector(dir, speed);
		if (keys['s']) cam.position.addScaledVector(dir, -speed);
		if (keys['a']) cam.position.addScaledVector(right, -speed);
		if (keys['d']) cam.position.addScaledVector(right, speed);
	}
	render.render(scene, cam);
}
anim();