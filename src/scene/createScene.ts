import { Engine, Scene, Vector3, CannonJSPlugin } from "@babylonjs/core";
import * as Cannon from "cannon";
import createGround from "./createGround";
import createLights from "./createLights";

const createScene = (engine: Engine, canvas: HTMLCanvasElement): Scene => {
  const scene = new Scene(engine);

  const gravity = new Vector3(0, -9.81, 0);
  const plugin = new CannonJSPlugin(true, 10, Cannon);

  scene.enablePhysics(gravity, plugin);

  const light = createLights(scene);

  //const sphere = Mesh.CreateSphere("sphere", 32, 2, scene);
  const ground = createGround(scene);

  return scene;
};

export default createScene;
