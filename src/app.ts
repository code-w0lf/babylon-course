import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
  Scene,
  Engine,
  SceneLoader,
  Mesh,
  Skeleton,
  IParticleSystem,
  Vector3,
  AbstractAssetTask,
  MeshAssetTask,
  Camera,
} from "@babylonjs/core";
import createCanvas from "./utils/createCanvas";
import createScene from "./scene/createScene";
import addPointerLock from "./utils/addPointerLock";
import Tank from "./objects/Tank";
import createFollowCamera from "./cameras/createFollowCamera";
import Dude from "./objects/Dude";
import Assets from "./scene/Assets";

class App {
  private _canvas: HTMLCanvasElement;
  private _engine: Engine;
  private _scene: Scene;
  private _settings: any = { isLocked: false };
  private _controls = {
    upPressed: false,
    downPressed: false,
    leftPressed: false,
    rightPressed: false,
    bPressed: false,
    rPressed: false,
    tPressed: false,
    yPressed: false,
  };

  private _tankCamera: Camera;
  private _dudeCamera: Camera;

  public dudes: Dude[] = [];
  public tank: Tank;
  public assets: Assets;

  constructor() {
    this._canvas = createCanvas();
    this._engine = new Engine(this._canvas, true);
    this._scene = createScene(this._engine, this._canvas);
    this.assets = new Assets(
      this._scene,
      this.onProgressLoadingAssets.bind(this),
      this.onFinishLoadingAssets.bind(this)
    );

    document.addEventListener("keydown", (event) =>
      this.setControls(event, true)
    );
    document.addEventListener("keyup", (event) =>
      this.setControls(event, false)
    );

    // Allows the pointer to rotate the camera when we click the left mouse button
    this._scene.onPointerDown = () =>
      addPointerLock(this._scene, this._canvas, this._settings);

    this.tank = new Tank(this._scene, this._controls);
    this._tankCamera = createFollowCamera(this._scene, this.tank.mesh);

    this._scene.activeCamera = this._tankCamera;

    window.addEventListener("resize", () => {
      this._engine.resize();
    });

    this.assets.loadAllAssets();
  }

  private onImported = (
    newMeshes: Mesh[],
    particleSystems: IParticleSystem[],
    skeletons: Skeleton[]
  ) => {
    newMeshes[0].position = new Vector3(0, 0, 5);
    newMeshes[0].name = "heroDude";
    newMeshes[0].scaling = new Vector3(0.2, 0.2, 0.2);

    this.dudes.push(new Dude(newMeshes[0], 1, this._scene));
    this._scene.beginAnimation(skeletons[0], 0, 100, true, 1.0);

    this._dudeCamera = createFollowCamera(this._scene, this.dudes[0].mesh);

    for (var i = 0; i < 10; i++) {
      const clone = Dude.doClone(newMeshes[0], skeletons, i);
      this.dudes.push(new Dude(clone, 1, this._scene));
      this._scene.beginAnimation(clone.skeleton, 0, 120, true, 1.0);
    }
  };

  private onProgressLoadingAssets(
    remainingCount: number,
    totalCount: number,
    lastFinishedTask: AbstractAssetTask
  ) {
    console.log(remainingCount, "Remaining");
    this._engine.loadingUIText =
      "We are loading the scene. " +
      remainingCount +
      " out of " +
      totalCount +
      " items still need to be loaded.";
  }

  private onFinishLoadingAssets(tasks: AbstractAssetTask[]) {
    this.onImported([this.assets.dude], null, this.assets.dudeSkeleons);

    this._engine.runRenderLoop(this.runRenderLoop);
  }

  private runRenderLoop = () => {
    this.tank.move(this._controls);
    this.tank.fireCannon(this._controls, this.dudes, this.assets);
    this.tank.fireLazer(this._controls, this.dudes, this.assets);

    if (this.dudes && this.dudes.length > 0) {
      for (const dude of this.dudes) {
        if (dude.name !== "heroDude_0") {
          dude.follow(this.tank.mesh);
        }
      }
    }

    this._scene.render();
  };

  private setControls(event: any, isPressed: boolean) {
    if (event.key == "w" || event.key == "W") {
      this._controls.upPressed = isPressed;
    }
    if (event.key == "s" || event.key == "S") {
      this._controls.downPressed = isPressed;
    }
    if (event.key == "a" || event.key == "A") {
      this._controls.leftPressed = isPressed;
    }
    if (event.key == "d" || event.key == "D") {
      this._controls.rightPressed = isPressed;
    }
    if (event.key == "b" || event.key == "B") {
      this._controls.bPressed = isPressed;
    }
    if (event.key == "r" || event.key == "R") {
      this._controls.rPressed = isPressed;
    }
    if (event.key == "t" || event.key == "T") {
      //this._controls.tPressed = isPressed;
      this._scene.activeCamera = this._tankCamera;
    }
    if (event.key == "y" || event.key == "Y") {
      // this._controls.tPressed = isPressed;
      this._scene.activeCamera = this._dudeCamera;
    }
  }
}

new App();
