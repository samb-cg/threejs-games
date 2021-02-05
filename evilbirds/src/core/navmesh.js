THREE.Pathfinding = threePathfinding.Pathfinding;

class Navmesh {

    constructor() {

        this.pathfinder = new THREE.Pathfinding();

        this.ZONE = "level1";
        this.level, this.navmesh, this.groupID, this.path;

        this.gltfLoader = new THREE.GLTFLoader();
    }

    init() {

        // load navmesh
        this.gltfLoader.load(("./meshes/navmesh.glb"), (gltf) => {
            this.navmesh = gltf.scene;
            var navmeshGeo = navmesh.children[0].geometry;

            var zone = THREE.Pathfinding.createZone(navmeshGeo);

            pathfinder.setZoneData(ZONE, zone);

            scene.add(this.navmesh);

        });

    }

    findpath(enemypos, playerpos) {
        
    }

}



