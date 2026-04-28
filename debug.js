import * as THREE from 'three'

const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 1, 1)
])
console.log(typeof curve.computeFrenetFrames)