import { FollowCamera, Mesh, Scene } from "@babylonjs/core";

const createFollowCamera = (scene: Scene, target: Mesh): FollowCamera => {
  const camera = new FollowCamera(
    "followCamera",
    target.position,
    scene,
    target
  );

  camera.radius = 30;
  camera.heightOffset = 4;
  camera.rotationOffset = 180;
  camera.cameraAcceleration = 0.5;
  camera.maxCameraSpeed = 50;

  return camera;
};

export default createFollowCamera;
