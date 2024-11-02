import * as THREE from "three";
import {
	COLLISION_GROUP_BUMPER,
	COLLISION_GROUP_PLANE,
	COLLISION_GROUP_SPHERE,
	createAmmoRigidBody,
	phy
} from "./myAmmoHelper.js";
import {addMeshToScene, removeMeshFromScene} from "./myThreeHelper.js";
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
	var loader = new THREE.TextureLoader();
	loader.load('./texture/bird1.png', function ( floorTexture ) {

		const mass = 0;


		let floorSize = { width: 4.4, height: 0.1, depth: 7.5 };
		let floor2Size = { width: 4.4, height: 0.1, depth: 7.5 };

		let edge1Size = { width: 0.1, height: 0.3, depth: 7.5 };
		let edge2Size = { width: 4.4, height: 0.3, depth: 0.5 };
		let edge3Size = { width: 4.4, height: 0.3, depth: 0.1 };
		let edge4Size = { width: 0.1, height: 0.3, depth: 	5.5 };

	let leader1Size = { width: 2.2, height: 0.3, depth: 0.1 };
	let leader2Size = { width: 1.2, height: 0.3, depth: 0.1 };
	let leader3Size = { width: 1.2, height: 0.3, depth: 0.1 };
	let leader4Size = { width: 1.2, height: 0.3, depth: 0.1 };
	let leader5Size = { width: 0.8, height: 0.3, depth: 0.1 };
	let leader6Size = { width: 0.8, height: 0.3, depth: 0.1 };
	let leader7Size = { width: 0.8, height: 0.3, depth: 0.1 };

		let floorPosition = { x: 0.5, y: 0, z: 0 };
		let floor2Position = { x: 0.5, y: 0.35, z: 0 };
		let leftEdgePosition = { x: -1.65, y: 0.15, z: 0 };
		let betweenEdgePosition = { x: 2, y: 0.15, z: 1 };
		let rightEdgePosition = { x: 2.65, y: 0.15, z: 0 };
		let topEdgePosition = { x: 0.5, y: 0.15, z: -3.5 };
		let bottomEdgePosition = { x: 0.5, y: 0.15, z: 3.7 };
		let leader1Position = { x: 1.89, y: 0.15, z: -2.9 };
		let leader2Position = { x: -1.49, y: 0.15, z: 1.4 }
		let leader3Position = { x: 1.65, y: 0.15, z: 0.95 }

		var floorMaterial = new THREE.MeshPhongMaterial({map: floorTexture, overdraw: 0.5});
		const floor2Material = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 });
		const edgeMaterial = new THREE.MeshPhongMaterial({ color: 0xffa200 });


		// THREE:
		let groupMesh = new THREE.Group();
		groupMesh.name = 'pinballBoard';
		groupMesh.rotation.x = angle;

		// Floor 1:
		let geoFloor = new THREE.BoxGeometry(floorSize.width, floorSize.height, floorSize.depth);
		let meshFloor = new THREE.Mesh(geoFloor, floorMaterial);
		meshFloor.position.set(floorPosition.x, floorPosition.y, floorPosition.z);
		meshFloor.castShadow = true;
		groupMesh.add(meshFloor);

		// Floor 2:
		let geo2Floor = new THREE.BoxGeometry(floor2Size.width, floor2Size.height, floor2Size.depth);
		let mesh2Floor = new THREE.Mesh(geo2Floor, floor2Material);
		mesh2Floor.position.set(floor2Position.x, floor2Position.y, floor2Position.z);
		mesh2Floor.castShadow = true;
		groupMesh.add(mesh2Floor);

		// Left edge:
		let geoLeftEdge = new THREE.BoxGeometry(edge1Size.width, edge1Size.height, edge1Size.depth);
		let meshLeftEdge = new THREE.Mesh(geoLeftEdge, edgeMaterial);
		meshLeftEdge.position.set(leftEdgePosition.x, leftEdgePosition.y, leftEdgePosition.z);
		meshLeftEdge.name = 'edge';
		meshLeftEdge.collisionResponse = (mesh1) => {
			mesh1.material.color.setHex(Math.random() * 0xffffff)};
		groupMesh.add(meshLeftEdge);

		// between edge:
		let geoBetweenEdge = new THREE.BoxGeometry(edge4Size.width, edge4Size.height, edge4Size.depth);
		let meshBetweenEdge = new THREE.Mesh(geoBetweenEdge, edgeMaterial);
		meshBetweenEdge.position.set(betweenEdgePosition.x, betweenEdgePosition.y, betweenEdgePosition.z);
		meshBetweenEdge.name = 'edge';
		groupMesh.add(meshBetweenEdge);

		// right edge:
		let geoRightEdge = new THREE.BoxGeometry(edge1Size.width, edge1Size.height, edge1Size.depth);
		let meshRightEdge = new THREE.Mesh(geoRightEdge, edgeMaterial);
		meshRightEdge.position.set(rightEdgePosition.x, rightEdgePosition.y, rightEdgePosition.z);
		meshRightEdge.name = 'edge';
		meshRightEdge.collisionResponse = (mesh1) => {
			mesh1.material.color.setHex(Math.random() * 0xffffff)};
		groupMesh.add(meshRightEdge);

		// top edge:
		let geoTopEdge = new THREE.BoxGeometry(edge2Size.width, edge2Size.height, edge2Size.depth);
		let meshTopEdge = new THREE.Mesh(geoTopEdge, edgeMaterial);
		meshTopEdge.position.set(topEdgePosition.x, topEdgePosition.y, topEdgePosition.z);
		meshTopEdge.name = 'edge';
		meshTopEdge.collisionResponse = (mesh1) => {
			mesh1.material.color.setHex(Math.random() * 0xffffff);
		};
		groupMesh.add(meshTopEdge);

		// bottom edge:
		let geoBottomEdge = new THREE.BoxGeometry(edge3Size.width, edge3Size.height, edge3Size.depth);
		let meshBottomEdge = new THREE.Mesh(geoBottomEdge, edgeMaterial);
		meshBottomEdge.position.set(bottomEdgePosition.x, bottomEdgePosition.y + (-Math.tan(angle) * bottomEdgePosition.z), bottomEdgePosition.z);
		meshBottomEdge.name = 'bottom';
		meshBottomEdge.collisionResponse = (mesh) => {
			removeMeshFromScene(mesh)
		};
		meshBottomEdge.rotation.x = angle;
		let bottomEdgeShape = new Ammo.btBoxShape(new Ammo.btVector3(edge3Size.width, edge3Size.height, edge3Size.depth));
		let bottomEdgeRigidBody = createAmmoRigidBody(bottomEdgeShape, meshBottomEdge, 0.2, 0.9, meshBottomEdge.position, mass);
		meshBottomEdge.userData.physicsBody = bottomEdgeRigidBody;
		// Legger til physics world:
		phy.ammoPhysicsWorld.addRigidBody(bottomEdgeRigidBody, COLLISION_GROUP_PLANE, COLLISION_GROUP_SPHERE);
		addMeshToScene(meshBottomEdge);
		phy.rigidBodies.push(meshBottomEdge);
		bottomEdgeRigidBody.threeMesh = meshBottomEdge;
		//groupMesh.add(meshBottomEdge);

		// Leader1:
		let geoLeader1 = new THREE.BoxGeometry(leader1Size.width, leader1Size.height, leader1Size.depth);
		let meshLeader1 = new THREE.Mesh(geoLeader1, edgeMaterial);
		meshLeader1.position.set(leader1Position.x, leader1Position.y, leader1Position.z);
		meshLeader1.rotateY(-Math.PI/4);
		groupMesh.add(meshLeader1);


		// Leader2:
		let geoLeader2 = new THREE.BoxGeometry(leader2Size.width, leader2Size.height, leader2Size.depth);
		let meshLeader2 = new THREE.Mesh(geoLeader2, edgeMaterial);
		meshLeader2.position.set(leader2Position.x, leader2Position.y, leader2Position.z);
		meshLeader2.rotateY(-Math.PI/2.5);
		groupMesh.add(meshLeader2);


		// Leader3:
		let geoLeader3 = new THREE.BoxGeometry(leader3Size.width, leader3Size.height, leader3Size.depth);
		let meshLeader3 = new THREE.Mesh(geoLeader3, edgeMaterial);
		meshLeader3.position.set(leader3Position.x, leader3Position.y, leader3Position.z);
		meshLeader3.rotateY(Math.PI/2.5);
		groupMesh.add(meshLeader3);

		// AMMO:
		let compoundShape = new Ammo.btCompoundShape();
		let floorShape = new Ammo.btBoxShape(new Ammo.btVector3(floorSize.width/2, floorSize.height/2, floorSize.depth/2));
		let floor2Shape = new Ammo.btBoxShape(new Ammo.btVector3(floor2Size.width/2, floor2Size.height/2, floor2Size.depth/2));

		let leftEdgeShape = new Ammo.btBoxShape(new Ammo.btVector3(edge1Size.width/2, edge1Size.height/2, edge1Size.depth/2));
		let betweenEdgeShape = new Ammo.btBoxShape(new Ammo.btVector3(edge4Size.width/2, edge4Size.height/2, edge4Size.depth/2));
		let rightEdgeShape = new Ammo.btBoxShape(new Ammo.btVector3(edge1Size.width/2, edge1Size.height/2, edge1Size.depth/2));
		let topEdgeShape = new Ammo.btBoxShape(new Ammo.btVector3(edge2Size.width/2, edge2Size.height/2, edge2Size.depth/2));

		let leader1Shape = new Ammo.btBoxShape(new Ammo.btVector3(leader1Size.width/2, leader1Size.height/2, leader1Size.depth/2));
		let leader2Shape = new Ammo.btBoxShape(new Ammo.btVector3(leader2Size.width/2, leader2Size.height/2, leader2Size.depth/2));
		let leader3Shape = new Ammo.btBoxShape(new Ammo.btVector3(leader3Size.width/2, leader3Size.height/2, leader3Size.depth/2));



		let trans1Floor = new Ammo.btTransform();
		trans1Floor.setIdentity();
		trans1Floor.setOrigin(new Ammo.btVector3(floorPosition.x, floorPosition.y, floorPosition.z));
		compoundShape.addChildShape(trans1Floor, floorShape);

		let trans2Floor = new Ammo.btTransform();
		trans2Floor.setIdentity();
		trans2Floor.setOrigin(new Ammo.btVector3(floor2Position.x, floor2Position.y, floor2Position.z));
		compoundShape.addChildShape(trans2Floor, floor2Shape);

		let transLeftEdge = new Ammo.btTransform();
		transLeftEdge.setIdentity();
		transLeftEdge.setOrigin(new Ammo.btVector3(leftEdgePosition.x, leftEdgePosition.y, leftEdgePosition.z));
		compoundShape.addChildShape(transLeftEdge, leftEdgeShape);

		let transBetweenEdge = new Ammo.btTransform();
		transBetweenEdge.setIdentity();
		transBetweenEdge.setOrigin(new Ammo.btVector3(betweenEdgePosition.x, betweenEdgePosition.y, betweenEdgePosition.z));
		compoundShape.addChildShape(transBetweenEdge, betweenEdgeShape);

		let transRightEdge = new Ammo.btTransform();
		transRightEdge.setIdentity();
		transRightEdge.setOrigin(new Ammo.btVector3(rightEdgePosition.x, rightEdgePosition.y, rightEdgePosition.z));
		compoundShape.addChildShape(transRightEdge, rightEdgeShape);


		let transTopEdge = new Ammo.btTransform();
		transTopEdge.setIdentity();
		transTopEdge.setOrigin(new Ammo.btVector3(topEdgePosition.x, topEdgePosition.y, topEdgePosition.z));
		compoundShape.addChildShape(transTopEdge, topEdgeShape);

		let transLeader1 = new Ammo.btTransform();
		transLeader1.setIdentity();
		transLeader1.setOrigin(new Ammo.btVector3(leader1Position.x, leader1Position.y, leader1Position.z));
		let quaternion1 = meshLeader1.quaternion;
		transLeader1.setRotation(new Ammo.btQuaternion(quaternion1.x, quaternion1.y, quaternion1.z, quaternion1.w));
		compoundShape.addChildShape(transLeader1, leader1Shape);

		let transLeader2 = new Ammo.btTransform();
		transLeader2.setIdentity();
		transLeader2.setOrigin(new Ammo.btVector3(leader2Position.x, leader2Position.y, leader2Position.z));
		let quaternion2 = meshLeader2.quaternion;
		transLeader2.setRotation(new Ammo.btQuaternion(quaternion2.x, quaternion2.y, quaternion2.z, quaternion2.w));
		compoundShape.addChildShape(transLeader2, leader2Shape);

		let transLeader3 = new Ammo.btTransform();
		transLeader3.setIdentity();
		transLeader3.setOrigin(new Ammo.btVector3(leader3Position.x, leader3Position.y, leader3Position.z));
		let quaternion3 = meshLeader3.quaternion;
		transLeader3.setRotation(new Ammo.btQuaternion(quaternion3.x, quaternion3.y, quaternion3.z, quaternion3.w));
		compoundShape.addChildShape(transLeader3, leader3Shape);

		//compoundShape.setMargin(0.05);

		let rigidBody = createAmmoRigidBody(compoundShape, groupMesh, 1, 0, position, mass);
		groupMesh.userData.physicsBody = rigidBody;
		// Legger til physics world:
		phy.ammoPhysicsWorld.addRigidBody(rigidBody, COLLISION_GROUP_PLANE, COLLISION_GROUP_SPHERE);
		addMeshToScene(groupMesh);
		phy.rigidBodies.push(groupMesh);
		rigidBody.threeMesh = groupMesh;
	});
}


/**
 * Legger til bumpers. Må ha et navn (.name) som starter med 'bumper'.
 * Dette henger sammen med kollisjonshåndteringen. Se myAmmoHelper.js og checkCollisions-funksjonen.
 */
function addBumpers(angle) {
	// Cylinder bumpers
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
	let bumper4Position = {x: -0.35, y: bumper4Size.height/2, z:1.5};
	bumper4Position.y += (-Math.tan(angle) * bumper4Position.z);
	addBumper(angle, bumper4Size, bumper4Position, "bumper4", 200);

	let bumper5Size = {radiusTop:0.1, radiusBottom: 0.1, height: 0.4};
	let bumper5Position = {x: 1.25, y: bumper5Size.height/2, z:-2};
	bumper5Position.y += (-Math.tan(angle) * bumper5Position.z);
	addBumper(angle, bumper5Size, bumper5Position, "bumper5", 200);

	let bumper6Size = {radiusTop:0.1, radiusBottom: 0.1, height: 0.4};
	let bumper6Position = {x: 0.8, y: bumper6Size.height/2, z:-2};
	bumper6Position.y += (-Math.tan(angle) * bumper6Position.z);
	addBumper(angle, bumper6Size, bumper6Position, "bumper6", 200);

	// Box bumpers
	let bumper7Size = { width: 1.2, height: 0.3, depth: 0.1 };
	let bumper7Position = { x: -0.8, y: 0.15, z: -2 };
	bumper7Position.y += (-Math.tan(angle) * bumper7Position.z);
	addBumper(angle, bumper7Size, bumper7Position, "bumper7", 200, "box", Math.PI/12);

	let bumper8Size = { width: 1.2, height: 0.3, depth: 0.1 };
	let bumper8Position = { x: -0.8, y: 0.15, z: -1.4 };
	bumper8Position.y += (-Math.tan(angle) * bumper8Position.z);
	addBumper(angle, bumper8Size, bumper8Position, "bumper8", 200, "box", Math.PI/6);

	let bumper9Size = { width: 1.2, height: 0.3, depth: 0.1 };
	let bumper9Position = { x: -0.8, y: 0.15, z: -0.4 };
	bumper9Position.y += (-Math.tan(angle) * bumper9Position.z);
	addBumper(angle, bumper9Size, bumper9Position, "bumper9", 200, "box", Math.PI/3);

	let bumper10Size = { width: 0.8, height: 0.3, depth: 0.1 };
	let bumper10Position = { x: -0.7, y: 0.15, z: 1.2 };
	bumper10Position.y += (-Math.tan(angle) * bumper10Position.z);
	addBumper(angle, bumper10Size, bumper10Position, "bumper10", 200, "box", Math.PI/3);

	let bumper11Size = { width: 0.8, height: 0.3, depth: 0.1 };
	let bumper11Position = { x: 0.8, y: 0.15, z: 0.4 };
	bumper11Position.y += (-Math.tan(angle) * bumper11Position.z);
	addBumper(angle, bumper11Size, bumper11Position, "bumper11", 200, "box", Math.PI+2.5);

	let bumper12Size = { width: 0.8, height: 0.3, depth: 0.1 };
	let bumper12Position = { x: 0.8, y: 0.15, z: -0.6 };
	bumper12Position.y += (-Math.tan(angle) * bumper12Position.z);
	addBumper(angle, bumper12Size, bumper12Position, "bumper12", 200, "box", Math.PI/3);
}



/**
 * Legger til en bumper. Bumperen er en sylinder med radiusTop, radiusBottom og height.
 */
function addBumper(angle, size, position, name, points, type = "cylinder", angleY = 0) {
	const material = new THREE.MeshPhongMaterial({color: 0x0ef21a, transparent: false});
	let geoBumper
	if (type == "cylinder") {
		geoBumper = new THREE.CylinderGeometry(size.radiusTop, size.radiusBottom, size.height, size.width, size.radialSegments, size.openEnded, size.thetaStart, size.thetaLength);
	}
	if (type == "box") {
		geoBumper = new THREE.BoxGeometry(size.width, size.height, size.depth);
	}
	let meshBumper = new THREE.Mesh(geoBumper, material);
	meshBumper.name =  name;
	meshBumper.points = points;
	meshBumper.collisionResponse = (mesh1) => {
		//meshBumper.points += points;
		document.getElementById('points').innerText = "" + (+document.getElementById('points').innerText + points);
		mesh1.material.color.setHex(Math.random() * 0xffffff);
	};
	meshBumper.position.set(position.x, position.y, position.z);
	if (type == "box") {
		meshBumper.rotateY(angleY);
	}
	meshBumper.rotation.x = angle;

	addMeshToScene(meshBumper);
	let mass = 0
	let bumperShape;
	if (type == "cylinder") {
		bumperShape = new Ammo.btCylinderShape(new Ammo.btVector3(size.radiusTop, size.radiusBottom, size.height, size.width, size.radialSegments, size.openEnded, size.thetaStart, size.thetaLength));
	}
	if (type == "box") {
		bumperShape = new Ammo.btBoxShape(new Ammo.btVector3(size.width/2, size.height/2, size.depth/2));
	}
	// Sørg for "fysikk" på denne.
	// Tips: Bruk createAmmoRigidBody(...)
	let rigidBody = createAmmoRigidBody(bumperShape, meshBumper, 0.2, 0.9, position, mass);
	meshBumper.userData.physicsBody = rigidBody;
	// Legger til physics world:
	phy.ammoPhysicsWorld.addRigidBody(rigidBody, COLLISION_GROUP_BUMPER, COLLISION_GROUP_SPHERE);
	phy.rigidBodies.push(meshBumper);
	rigidBody.threeMesh = meshBumper;
}