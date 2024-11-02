import * as THREE from "three";
import GUI from "lil-gui";
import {createSphere, pushBall} from "./sphere.js";
import {TrackballControls} from "three/examples/jsm/controls/TrackballControls.js";
import {pushFlipper} from "./armHingeConstraint.js";
import {ri} from "./script.js";
import {phy} from "./myAmmoHelper.js";

export function createThreeScene() {
	const canvas = document.createElement('canvas');
	canvas.style.position = 'absolute';
	canvas.style.left = 0;
	canvas.style.top = 0;
	document.body.appendChild(canvas);

	// Renderer:
	ri.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
	ri.renderer.setSize(window.innerWidth, window.innerHeight);
	ri.renderer.setClearColor(0xBFD104, 0xff);  //farge, alphaverdi.
	ri.renderer.shadowMap.enabled = true; //NB!
	ri.renderer.shadowMapSoft = true;
	ri.renderer.shadowMap.type = THREE.PCFSoftShadowMap; //THREE.BasicShadowMap;

	// Scene
	ri.scene = new THREE.Scene();
	ri.scene.background = new THREE.Color( 0xdddddd );

	// Koordinatakse-hjelper:
	const axesHelper = new THREE.AxesHelper( 200 );
	ri.scene.add( axesHelper );

	// lil-gui kontroller:
	ri.lilGui = new GUI();

	// Sceneobjekter
	addLights();

	// Kamera:
	ri.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 10000);
	ri.camera.position.x = 1.5;
	ri.camera.position.y = 1.7;
	ri.camera.position.z = 2.7;

	// TrackballControls:
	ri.controls = new TrackballControls(ri.camera, ri.renderer.domElement);
	ri.controls.addEventListener( 'change', renderScene);

	// Knapper:
	const btnNewGame = document.getElementById("btnNewGame");
	btnNewGame.addEventListener("click", (event) => {
		//Legg til kule:
	});

	const btnShoot = document.getElementById("btnShoot");
	btnShoot.addEventListener("click", (event) => {
		let sphere = ri.scene.getObjectByName("sphere");
		//... og skyt!!
	});
}

export function addLights() {
	// Ambient:
	let ambientLight1 = new THREE.AmbientLight(0xffffff, 0.5);
	ambientLight1.visible = true;
	ri.scene.add(ambientLight1);
	const ambientFolder = ri.lilGui.addFolder( 'Ambient Light' );
	ambientFolder.add(ambientLight1, 'visible').name("On/Off");
	ambientFolder.add(ambientLight1, 'intensity').min(0).max(1).step(0.01).name("Intensity");
	ambientFolder.addColor(ambientLight1, 'color').name("Color");

	//** RETNINGSORIENTERT LYS (som gir skygge):
	let directionalLight = new THREE.DirectionalLight(0xff0000, 0.1);
	directionalLight.visible = true;
	ri.scene.add(directionalLight);
	directionalLight.position.set(0, 20, 0);

	directionalLight.castShadow = true;     //Merk!
	directionalLight.shadow.mapSize.width = 1024;
	directionalLight.shadow.mapSize.height = 1024;
	directionalLight.shadow.camera.near = 5;
	directionalLight.shadow.camera.far = 110;
	directionalLight.shadow.camera.left = -50;
	directionalLight.shadow.camera.right = 50;
	directionalLight.shadow.camera.top = 50;
	directionalLight.shadow.camera.bottom = -50;
	ri.scene.add(directionalLight);

	//** POINTLIGHT:
	let pointLight = new THREE.PointLight(0xffffff, 360);
	pointLight.visible = true;
	pointLight.position.set(0, 15, 0);
	pointLight.shadow.camera.near = 10;
	pointLight.shadow.camera.far = 31;
	pointLight.shadow.mapSize.width = 1024;
	pointLight.shadow.mapSize.width = 1024;
	pointLight.castShadow = true;
	ri.scene.add(pointLight);

	//lil-gui:
	const directionalFolder = ri.lilGui.addFolder( 'Directional Light' );
	directionalFolder.add(directionalLight, 'visible').name("On/Off");
	directionalFolder.add(directionalLight, 'intensity').min(0).max(1).step(0.01).name("Intensity");
	directionalFolder.addColor(directionalLight, 'color').name("Color");
	const pointLigthFolder = ri.lilGui.addFolder( 'Pointlight' );
	pointLigthFolder.add(pointLight, 'visible').name("On/Off");
	pointLigthFolder.add(pointLight, 'intensity').min(0).max(1000).step(1).name("Intensity");
	pointLigthFolder.addColor(pointLight, 'color').name("Color");
	pointLigthFolder.add(pointLight.position, 'y').min(5).max(20).step(1).name("Height (y-pos)");
}

//Sjekker tastaturet:
export function handleKeys(delta) {
	if (ri.currentlyPressedKeys['KeyH']) {
		let angle = Math.PI/20;
		let z = 3
		clearTimeout(ri.myTimeout)
		ri.myTimeout = setTimeout(()=>{
			if(ri.balls == 0) {
				ri.balls = 1
				document.getElementById("points").innerText = "0";
				let mySphere = createSphere(
					.05,
					0x000000,
					{x: 2.2, y: -Math.tan(angle) * z + 0.2, z: z}
				);
				pushBall(mySphere, {x: -1, y: 1, z: -10});
			}
		},25)
	}

	const leftArmMesh = ri.scene.getObjectByName("left_hinge_arm");
	let leftArmDirection = new THREE.Vector3();
	leftArmMesh.getWorldDirection(leftArmDirection);  // NB! worldDIRECTION! Gir en vektor som peker mot +Z. FRA DOC: Returns a vector representing the direction of object's positive z-axis in world space.
	let leftArmOppositeDirection = new THREE.Vector3();
	leftArmMesh.getWorldDirection(leftArmOppositeDirection).multiplyScalar(-1);

	const rightArmMesh = ri.scene.getObjectByName("right_hinge_arm");
	let rightArmDirection = new THREE.Vector3();
	rightArmMesh.getWorldDirection(rightArmDirection);  // NB! worldDIRECTION! Gir en vektor som peker mot +Z. FRA DOC: Returns a vector representing the direction of object's positive z-axis in world space.
	let rightArmOppositeDirection = new THREE.Vector3();
	rightArmMesh.getWorldDirection(rightArmOppositeDirection).multiplyScalar(-1);

	// Gir venstre flipperen et støt:
	if (ri.currentlyPressedKeys['KeyV']) {
		pushFlipper(leftArmMesh, leftArmOppositeDirection, true);
	}
	if (ri.currentlyPressedKeys['KeyB']) {
		pushFlipper(leftArmMesh, leftArmDirection, true);
	}

	// Gir høyre flipperen et støt:
	if (ri.currentlyPressedKeys['KeyN']) {
		pushFlipper(rightArmMesh, rightArmOppositeDirection, false);
	}
	if (ri.currentlyPressedKeys['KeyM']) {
		pushFlipper(rightArmMesh, rightArmDirection, false);
	}
}

export function updateThree(deltaTime) {
	//Oppdater trackball-kontrollen:
	ri.controls.update();
}

export function addMeshToScene(mesh) {
	ri.scene.add(mesh);
}

export function removeMeshFromScene(mesh){
	//console.log(phy.rigidBodies.indexOf(mesh))
	phy.ammoPhysicsWorld.removeRigidBody(mesh.userData.physicsBody);
	phy.rigidBodies.splice(phy.rigidBodies.indexOf(mesh),1)
	mesh.geometry.dispose();
	mesh.material.dispose();
	ri.scene.remove(mesh);
	ri.balls = 0;
}

export function renderScene()
{
	ri.renderer.render(ri.scene, ri.camera);
}

export function addArrowHelper(mesh, direction, origin, name, color=0xff0000, length=10) {
	const meshDirectionArrow = new THREE.ArrowHelper( direction, origin, length, color );
	meshDirectionArrow.name = name;
	mesh.add(meshDirectionArrow);
}

export function onWindowResize() {
	ri.camera.aspect = window.innerWidth / window.innerHeight;
	ri.camera.updateProjectionMatrix();
	ri.renderer.setSize(window.innerWidth, window.innerHeight);
	ri.controls.handleResize();
	renderScene();
}
