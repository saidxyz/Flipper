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
	let position2 = {x: 1.3, y: 0, z: 2.0};	//I forhold til at brettet står i posisjon 0,0,0
	createFlipperArm( 1, 0x00FF00, position2, false, "right_hinge_arm", angle, flipperSize);

	addBumpers(angle);
}

/**
 * Spillbrett med hinder og kanter som en gruppe (uten bumpere eller flippere).
 */
export function createBoard(textureObject, position, angle) {
	//Brettet skal stå i ro:
	const mass = 0;

	let floorSize = { width: 4.4, height: 0.1, depth: 7.5 };
	let edge1Size = { width: 0.1, height: 0.3, depth: 7.5 };
	let edge2Size = { width: 2.2, height: 0.3, depth: 0.1 };
	let edge3Size = { width: 1.8, height: 0.3, depth: 0.1 };
	let edge4Size = { width: 4.4, height: 0.3, depth: 0.5 };
	let edge5Size = { width: 4.4, height: 0.3, depth: 0.1 };
	let edge6Size = { width: 1.2, height: 0.3, depth: 0.1 };
	let edge7Size = { width: 1.2, height: 0.3, depth: 0.1 };
	let edge8Size = { width: 0.8, height: 0.3, depth: 0.1 };
	let edge9Size = { width: 0.1, height: 0.3, depth: 5.5 };
	let edge10Size = { width: 0.8, height: 0.3, depth: 0.1 };
	let edge11Size = { width: 0.8, height: 0.3, depth: 0.1 };
	let leader1Size = { width: -1.3, height: 0.3, depth: 0.1 };

	let floorPosition = { x: 0.5, y: 0, z: 0 };
	let leftEdgePosition = { x: -1.65, y: 0.15, z: 0 };
	let betweenEdgePosition = { x: 2, y: 0.15, z: 1 };
	let rightEdgePosition = { x: 2.65, y: 0.15, z: 0 };
	let topEdgePosition = { x: 0.5, y: 0.15, z: -3.5 };
	let bottomEdgePosition = { x: 0.5, y: 0.15, z: 3.7 };
	let leader1Position = { x: 1.89, y: 0.15, z: -2.9 };
	let leader2Position = { x: -0.8, y: 0.15, z: -2 };
	let leader3Position = { x: -0.8, y: 0.15, z: -1.4 };
	let leader4Position = { x: -0.8, y: 0.15, z: -0.4 };
	let leader5Position = { x: -0.7, y: 0.15, z: 1.2 };
	let leader6Position = { x: 0.8, y: 0.15, z: 0.4 };
	let leader7Position = { x: 0.8, y: 0.15, z: -0.6 };

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

	// between edge:
	let geoBetweenEdge = new THREE.BoxGeometry(edge9Size.width, edge9Size.height, edge9Size.depth);
	let meshBetweenEdge = new THREE.Mesh(geoBetweenEdge, edgeMaterial);
	meshBetweenEdge.position.set(betweenEdgePosition.x, betweenEdgePosition.y, betweenEdgePosition.z);
	meshBetweenEdge.name = 'edge';
	meshBetweenEdge.collisionResponse = (mesh1) => {
		mesh1.material.color.setHex(Math.random() * 0xffffff);
	};
	groupMesh.add(meshBetweenEdge);

	// right edge:
	let geoRightEdge = new THREE.BoxGeometry(edge1Size.width, edge1Size.height, edge1Size.depth);
	let meshRightEdge = new THREE.Mesh(geoRightEdge, edgeMaterial);
	meshRightEdge.position.set(rightEdgePosition.x, rightEdgePosition.y, rightEdgePosition.z);
	meshRightEdge.name = 'edge';
	meshRightEdge.collisionResponse = (mesh1) => {
		mesh1.material.color.setHex(Math.random() * 0xffffff);
	};
	groupMesh.add(meshRightEdge);

	// top edge:
	let geoTopEdge = new THREE.BoxGeometry(edge4Size.width, edge4Size.height, edge4Size.depth);
	let meshTopEdge = new THREE.Mesh(geoTopEdge, edgeMaterial);
	meshTopEdge.position.set(topEdgePosition.x, topEdgePosition.y, topEdgePosition.z);
	meshTopEdge.name = 'edge';
	meshTopEdge.collisionResponse = (mesh1) => {
		mesh1.material.color.setHex(Math.random() * 0xffffff);
	};
	groupMesh.add(meshTopEdge);

	// bottom edge:
	let geoBottomEdge = new THREE.BoxGeometry(edge5Size.width, edge5Size.height, edge5Size.depth);
	let meshBottomEdge = new THREE.Mesh(geoBottomEdge, edgeMaterial);
	meshBottomEdge.position.set(bottomEdgePosition.x, bottomEdgePosition.y, bottomEdgePosition.z);
	meshBottomEdge.name = 'edge';
	meshBottomEdge.collisionResponse = (mesh1) => {
		mesh1.material.color.setHex(Math.random() * 0xffffff);
	};
	groupMesh.add(meshBottomEdge);

	// Leader1:
	let geoLeader1 = new THREE.BoxGeometry(edge2Size.width, edge2Size.height, edge2Size.depth);
	let meshLeader1 = new THREE.Mesh(geoLeader1, edgeMaterial);
	meshLeader1.position.set(leader1Position.x, leader1Position.y, leader1Position.z);
	meshLeader1.rotateY(-Math.PI/4);
	groupMesh.add(meshLeader1);

	// Leader2:
	let geoLeader2 = new THREE.BoxGeometry(edge3Size.width, edge3Size.height, edge3Size.depth);
	let meshLeader2 = new THREE.Mesh(geoLeader2, edgeMaterial);
	meshLeader2.position.set(leader2Position.x, leader2Position.y, leader2Position.z);
	meshLeader2.rotateY(Math.PI/12);
	groupMesh.add(meshLeader2);

	// Leader3:
	let geoLeader3 = new THREE.BoxGeometry(edge6Size.width, edge6Size.height, edge6Size.depth);
	let meshLeader3 = new THREE.Mesh(geoLeader3, edgeMaterial);
	meshLeader3.position.set(leader3Position.x, leader3Position.y, leader3Position.z);
	meshLeader3.rotateY(Math.PI/6);
	groupMesh.add(meshLeader3);

	// Leader4:
	let geoLeader4 = new THREE.BoxGeometry(edge7Size.width, edge7Size.height, edge7Size.depth);
	let meshLeader4 = new THREE.Mesh(geoLeader4, edgeMaterial);
	meshLeader4.position.set(leader4Position.x, leader4Position.y, leader4Position.z);
	meshLeader4.rotateY(Math.PI/3);
	groupMesh.add(meshLeader4);

	// Leader5:
	let geoLeader5 = new THREE.BoxGeometry(edge8Size.width, edge8Size.height, edge8Size.depth);
	let meshLeader5 = new THREE.Mesh(geoLeader5, edgeMaterial);
	meshLeader5.position.set(leader5Position.x, leader5Position.y, leader5Position.z);
	meshLeader5.rotateY(Math.PI/3);
	groupMesh.add(meshLeader5);

	// Leader5:
	let geoLeader6 = new THREE.BoxGeometry(edge10Size.width, edge10Size.height, edge10Size.depth);
	let meshLeader6 = new THREE.Mesh(geoLeader6, edgeMaterial);
	meshLeader6.position.set(leader6Position.x, leader6Position.y, leader6Position.z);
	meshLeader6.rotateY(Math.PI/3);
	groupMesh.add(meshLeader6);

	// Leader6:
	let geoLeader7 = new THREE.BoxGeometry(edge11Size.width, edge11Size.height, edge11Size.depth);
	let meshLeader7 = new THREE.Mesh(geoLeader7, edgeMaterial);
	meshLeader7.position.set(leader7Position.x, leader7Position.y, leader7Position.z);
	meshLeader7.rotateY(Math.PI+2.5);
	groupMesh.add(meshLeader7);

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
	transLeader1.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));
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
	let bumper1Size = {radiusTop:0.2, radiusBottom: 0.2, height: 0.4};
	let bumper1Position = {x: 0, y: bumper1Size.height/2, z:0};
	bumper1Position.y += (-Math.tan(angle) * bumper1Position.z);
	addBumper(angle, bumper1Size, bumper1Position, "bumper1", 200);


	let bumper2Size = {radiusTop:0.2, radiusBottom: 0.2, height: 0.4};
	let bumper2Position = {x: 1, y: bumper2Size.height/2, z:1.3};
	bumper2Position.y += (-Math.tan(angle) * bumper2Position.z);
	addBumper(angle, bumper2Size, bumper2Position, "bumper2", 200);


	let bumper3Size = {radiusTop:0.1, radiusBottom: 0.1, height: 0.4};
	let bumper3Position = {x: -1, y: bumper3Size.height/2, z:1};
	bumper3Position.y += (-Math.tan(angle) * bumper3Position.z);
	addBumper(angle, bumper3Size, bumper3Position, "bumper3", 200);


	let bumper4Size = {radiusTop:0.1, radiusBottom: 0.1, height: 0.4};
	let bumper4Position = {x: -0.35, y: bumper4Size.height/100, z:1.5};
	bumper2Position.y += (-Math.tan(angle) * bumper4Position.z);
	addBumper(angle, bumper4Size, bumper4Position, "bumper4", 200);



	let bumper5Size = {radiusTop:0.1, radiusBottom: 0.1, height: 0.4};
	let bumper5Position = {x: 1.25, y: bumper5Size.height/2, z:-2};
	bumper5Position.y += (-Math.tan(angle) * bumper5Position.z);
	addBumper(angle, bumper5Size, bumper5Position, "bumper5", 200);

	let bumper6Size = {radiusTop:0.1, radiusBottom: 0.1, height: 0.4};
	let bumper6Position = {x: 0.8, y: bumper6Size.height/2, z:-2};
	bumper6Position.y += (-Math.tan(angle) * bumper6Position.z);
	addBumper(angle, bumper6Size, bumper6Position, "bumper6", 200);


}

/**
 * Legger til en bumper. Bumperen er en sylinder med radiusTop, radiusBottom og height.
 */
function addBumper(angle, size, position, name, points) {
	const material = new THREE.MeshPhongMaterial({color: 0x0ef21a, transparent: false});
	let geoBumper = new THREE.CylinderGeometry(size.radiusTop, size.radiusBottom, size.height, size.width, size.radialSegments, size.openEnded, size.thetaStart, size.thetaLength);
	let meshBumper = new THREE.Mesh(geoBumper, material);
	meshBumper.name =  name;
	meshBumper.points = points;
	meshBumper.collisionResponse = (mesh1) => {
		meshBumper.points += points;
		document.getElementById('points').innerText = String(meshBumper.points);
		mesh1.material.color.setHex(Math.random() * 0xffffff);
	};
	meshBumper.position.set(position.x, position.y, position.z);
	meshBumper.rotation.x = angle;

	addMeshToScene(meshBumper);
	// Sørg for "fysikk" på denne.
	// Tips: Bruk createAmmoRigidBody(...)
}