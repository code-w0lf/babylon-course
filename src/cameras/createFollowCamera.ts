import { FollowCamera, Mesh, Scene } from "@babylonjs/core";

const createFollowCamera = (scene: Scene, target: Mesh): FollowCamera => {
  const camera = new FollowCamera(
    target.name + "_followCamera",
    target.position,
    scene,
    target
  );

  console.log("camera", target.name);

  camera.cameraAcceleration = 0.5;
  camera.maxCameraSpeed = 50;

  if (target.name === "heroDude") {
    camera.radius = 40;
    camera.heightOffset = 10;
    camera.rotationOffset = 0;
  } else {
    camera.radius = 30;
    camera.heightOffset = 4;
    camera.rotationOffset = 180;
  }

  return camera;
};

export default createFollowCamera;
