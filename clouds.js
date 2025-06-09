import * as THREE from "three";

import { OrbitControls } from "jsm/controls/OrbitControls.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

const ctrls = new OrbitControls(camera, renderer.domElement);
ctrls.enableDamping = true;


const blueShades = [
   
    0xffffff, // Pale Azure
    
  ];

// Higher segment count for smoother spheres
const geometry = new THREE.SphereGeometry(1, 8, 8);
const material = new THREE.MeshNormalMaterial({
    color: 0x99ccff,       // light sky blue
    transparent: true,
    opacity: 0.4,          // soft transparency
    shininess: 20,         // just a bit of gloss
    depthWrite: false,     // prevents transparency issues
    emissive: 0x4477cc,    // soft inner glow
  });


function getCloud(size = 1) {
    const group = new THREE.Group(); // a container for multiple spheres
  
    const sphereGeometry = new THREE.SphereGeometry(size*0.4, 24, 24); // smaller sphere size

    const smallSphereGeometry = new THREE.SphereGeometry(size * 0.2, 16, 16); // Smaller fluff
    // Randomly pick a shade
    const randomBlue = blueShades[0];

    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: randomBlue,
        emissive: randomBlue,
        emissiveIntensity: 0.6,
        transparent: false,
        opacity: 0.1,
        shininess: 10,
        depthWrite: false,
    });
    // const sphereMaterial = new THREE.MeshNormalMaterial({flatShading:true})

  
    const numSpheres = Math.floor(Math.random() * 2) + 60; // Random between 6 and 7
  
    const corePositions = [];

    // Main cloud body
    for (let i = 0; i < numSpheres; i++) {
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        const pos = new THREE.Vector3(
        (Math.random() - 0.5) * size,
        (Math.random() - 0.5) * size*0.3,
        (Math.random() - 0.5) * size * 0.3
        );
        sphere.position.copy(pos);
        corePositions.push(pos);
        group.add(sphere);
    }

    // Add little spheres on outer edges
    for (const pos of corePositions) {
        const numSatellites = Math.floor(Math.random() * 2) + 1; // 2–3 fluff spheres per core
        for (let i = 0; i < numSatellites; i++) {
        const offset = new THREE.Vector3(
            (Math.random() - 0.5) * size * 0.4*3,
            (Math.random() - 0.5) * size * 0.4*0.8,
            (Math.random() - 0.5) * size * 0.2
        );
        const smallSphere = new THREE.Mesh(smallSphereGeometry, sphereMaterial);
        smallSphere.position.copy(pos.clone().add(offset));
        group.add(smallSphere);
        }
    }

    // Store velocity as a custom property for animation
    group.userData.velocity = 0.01 + Math.random() * 0.01; // each cloud moves at its own speed
    
    return group;
}

const clouds = [];

for (let i = 0; i < 10; i++) {
  const cloud = getCloud(1.7);
  cloud.position.x = Math.random() * 10 - 5;
  cloud.position.y = Math.random() * 7 - 1;
  cloud.position.z = Math.random() * -9;
  clouds.push(cloud);
  scene.add(cloud);
  scene.fog = new THREE.Fog(0xe6f7ff, 5, 20);
}




const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
scene.add(hemiLight);

// Sprites BG
// const gradientBackground = getLayer({
//   hue: 0.5,
//   numSprites: 8,
//   opacity: 0.1,
//   radius: 1,
//   size: 24,
//   z: -15.5,
// });
// scene.add(gradientBackground);

function animate() {
  requestAnimationFrame(animate);

  for (let cloud of clouds) {
    cloud.position.x += cloud.userData.velocity;
  
    // Reset cloud to left side if it exits the screen to the right
    if (cloud.position.x > 9) {
      cloud.position.x = -11;
      console.log(window.innerWidth)
    }
  }

  renderer.render(scene, camera);
  ctrls.update();
}

animate();

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", handleWindowResize, false);
