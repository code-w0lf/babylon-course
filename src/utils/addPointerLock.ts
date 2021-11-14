import { Scene } from "@babylonjs/core";

const addPointerLock = (
  scene: Scene,
  canvas: HTMLCanvasElement,
  settings: any
) => {
  scene.onPointerDown = () => {
    if (!settings.isLocked) {
      console.log("Requesting pointer lock");
      canvas.requestPointerLock();
    }
  };

  document.addEventListener("pointerlockchange", pointerLockedListner);

  function pointerLockedListner() {
    const element = document.pointerLockElement || null;

    if (element) {
      settings.isLocked = true;
    } else {
      settings.isLocked = false;
    }
  }
};

export default addPointerLock;
