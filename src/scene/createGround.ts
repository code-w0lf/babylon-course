import {
  GeometryBufferRenderer,
  GroundMesh,
  Mesh,
  PhysicsImpostor,
  Scene,
  StandardMaterial,
  Texture,
} from "@babylonjs/core";

const createGround = (scene: Scene): GroundMesh => {
  const ground = Mesh.CreateGroundFromHeightMap(
    "ground",
    "images/hmap1.png",
    2000,
    2000,
    20,
    0,
    100,
    scene,
    false,
    () => {
      const groundMaterial = new StandardMaterial("groundMaterial", scene);
      groundMaterial.diffuseTexture = new Texture("images/grass.jpg", scene);
      ground.material = groundMaterial;
      ground.checkCollisions = true;
      ground.physicsImpostor = new PhysicsImpostor(
        ground,
        PhysicsImpostor.HeightmapImpostor,
        { mass: 0 },
        scene
      );
    }
  );

  return ground;
};

export default createGround;
