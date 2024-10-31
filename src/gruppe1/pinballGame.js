import * as THREE from "three";
import {
	COLLISION_GROUP_BUMPER,
	COLLISION_GROUP_PLANE,
	COLLISION_GROUP_SPHERE,
	createAmmoRigidBody,
	phy
} from "./myAmmoHelper.js";
import {addMeshToScene} from "./myThreeHelper.js";
import {createFlipperArm} from "./armHingeConstraint.js";

/**
 * Oppretter hele spillet.
 * Merk størrelser; anta at en enhet er en meter, dvs. flipperSize = {with=1.1, ...} betyr at bredde på flipperen er
 * 1,1 meter, dvs. relativt store og de kunne nok vært mindre. Det står imidlertid i forhold til størrelsen på
 * spillbrettet (3,4 meter bredt) og kulene som f.eks. har en diameter på 20cm.
 *
 * Bevegelser på flippere og kuler kan dermed virke litt trege. I så fall er det bare å gjør spillet mindre.
 * */
export function createPinballGame(textureObjects, angle) {
	const position={x:0, y:0, z:0}
	createBoard(textureObjects[0], position, angle);

	let flipperSize = {width: 1.1, height: 0.1, depth:0.1};

	//Flipper1:
	let position1 = {x: -1.3, y: 0, z: 2.0};	//I forhold til at brettet står i posisjon 0,0,0
	createFlipperArm( 1, 0x00FF00, position1, true, "left_hinge_arm", angle, flipperSize);
	//Flipper2:
	//...

	addBumpers(angle);
}

/**
 * Spillbrett med hinder og kanter som en gruppe (uten bumpere eller flippere).
 */
export function createBoard(textureObject, position, angle) {
	//Brettet skal stå i ro:
	const mass = 0;

	let floorSize = { width: 3.4, height: 0.1, depth: 7.5 };
	let edge1Size = { width: 0.1, height: 0.3, depth: 7.5 };
	let edge2Size = { width: 3.4, height: 0.3, depth: 0.1 };
	let leader1Size = { width: 1.3, height: 0.3, depth: 0.1 };

	let floorPosition = { x: 0, y: 0, z: 0 };
	let leftEdgePosition = { x: -1.65, y: 0.15, z: 0 };
	//let rightEdgePosition = { x: 1.65, y: 0.15, z: 0 };
	let leader1Position = { x: 1.2, y: 0.15, z: -2.9 };

	const floorMaterial = new THREE.MeshPhongMaterial({ color: 0xf78a1d });
	const edgeMaterial = new THREE.MeshPhongMaterial({ color: 0xFF0000 });

	// THREE:
	let groupMesh = new THREE.Group();
	groupMesh.name = 'pinballBoard';
	groupMesh.rotation.x = angle;

	// Floor:
	let geoFloor = new THREE.BoxGeometry(floorSize.width, floorSize.height, floorSize.depth);
	let meshFloor = new THREE.Mesh(geoFloor, floorMaterial);
	meshFloor.position.set(floorPosition.x, floorPosition.y, floorPosition.z);
	meshFloor.castShadow = true;
	groupMesh.add(meshFloor);
	// Left edge:
	let geoLeftEdge = new THREE.BoxGeometry(edge1Size.width, edge1Size.height, edge1Size.depth);
	let meshLeftEdge = new THREE.Mesh(geoLeftEdge, edgeMaterial);
	meshLeftEdge.position.set(leftEdgePosition.x, leftEdgePosition.y, leftEdgePosition.z);
	meshLeftEdge.name = 'edge';
	meshLeftEdge.collisionResponse = (mesh1) => {
		mesh1.material.color.setHex(Math.random() * 0xffffff);
	};
	groupMesh.add(meshLeftEdge);
	// Leader1:
	let geoLeader1 = new THREE.BoxGeometry(floorSize.width, floorSize.height, floorSize.depth);
	let meshLeader1 = new THREE.Mesh(geoLeader1, edgeMaterial);
	meshLeader1.position.set(leader1Position.x, leader1Position.y, leader1Position.z);
	meshLeader1.rotateY(-Math.PI/4);
	groupMesh.add(meshLeader1);

	// AMMO:
	let compoundShape = new Ammo.btCompoundShape();
	let floorShape = new Ammo.btBoxShape(new Ammo.btVector3(floorSize.width/2, floorSize.height/2, floorSize.depth/2));
	let leftEdgeShape = new Ammo.btBoxShape(new Ammo.btVector3(edge1Size.width/2, edge1Size.height/2, edge1Size.depth/2));
	let leader1Shape = new Ammo.btBoxShape(new Ammo.btVector3(leader1Size.width/2, leader1Size.height/2, leader1Size.depth/2));

	let transFloor = new Ammo.btTransform();
	transFloor.setIdentity();
	transFloor.setOrigin(new Ammo.btVector3(floorPosition.x, floorPosition.y, floorPosition.z));
	compoundShape.addChildShape(transFloor, floorShape);

	let transLeftEdge = new Ammo.btTransform();
	transLeftEdge.setIdentity();
	transLeftEdge.setOrigin(new Ammo.btVector3(leftEdgePosition.x, leftEdgePosition.y, leftEdgePosition.z));
	compoundShape.addChildShape(transLeftEdge, leftEdgeShape);

	let transLeader1 = new Ammo.btTransform();
	transLeader1.setIdentity();
	transLeader1.setOrigin(new Ammo.btVector3(leader1Position.x, leader1Position.y, leader1Position.z));
	let quaternion = meshLeader1.quaternion;
	transLeader1.setRotation(new Ammo.btVector3(quaternion.x, quaternion.y, quaternion.z, quaternion.w));
	compoundShape.addChildShape(transLeader1, leader1Shape);

	compoundShape.setMargin(0.05);

	let rigidBody = createAmmoRigidBody(compoundShape, groupMesh, 0.2, 0.9, position, mass);
	groupMesh.userData.physicsBody = rigidBody;
	// Legger til physics world:
	phy.ammoPhysicsWorld.addRigidBody(rigidBody, COLLISION_GROUP_PLANE, COLLISION_GROUP_SPHERE);
	addMeshToScene(groupMesh);
	phy.rigidBodies.push(groupMesh);
	rigidBody.threeMesh = groupMesh;
}

/**
 * Legger til bumpers. Må ha et navn (.name) som starter med 'bumper'.
 * Dette henger sammen med kollisjonshåndteringen. Se myAmmoHelper.js og checkCollisions-funksjonen.
 */
function addBumpers(angle) {
	let bumper1Size = {radiusTop:0.2, radiusBottom: 0.2, hight: .4};
	let bumper1Position = {x: 0.45, y: bumper1Size.hight/2, z:1.3};
	bumper1Position.y += (-Math.tan(angle) * bumper1Position.z);
	addBumper(angle, bumper1Size, bumper1Position, "bumper1", 200);
	// osv...
}

/**
 * Legger til en bumper. Bumperen er en sylinder med radiusTop, radiusBottom og height.
 */
function addBumper(angle, size, position, name, points) {
	const material = new THREE.MeshPhongMaterial({color: 0x0ef21a, transparent: false});
	let geoBumper = new THREE.CylinderGeometry(size.radiusTop, size.radiusBottom, size.hight);
	let meshBumper = new THREE.Mesh(geoBumper, material);
	meshBumper.name =  name;
	meshBumper.points = 0;
	meshBumper.collisionResponse = (mesh1) => {
		meshBumper.points += meshBumper.points;
		document.getElementById('points').innerText = String(meshBumper.points);
		mesh1.material.color.setHex(Math.random() * 0xffffff);
	};
	meshBumper.position.set(position.x, position.y, position.z);
	meshBumper.rotation.x = angle;

	addMeshToScene(meshBumper);
	// Sørg for "fysikk" på denne.
	// Tips: Bruk createAmmoRigidBody(...)
}