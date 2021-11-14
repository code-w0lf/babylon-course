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
  private _controls: any = {
    upPressed: false,
    downPressed: false,
    leftPressed: false,
    rightPressed: false,
    bPressed: false,
    rPressed: false,
  };

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

    // Allows the pointer to rotate the camera when we click the left mouse button
    this._scene.onPointerDown = () =>
      addPointerLock(this._scene, this._canvas, this._settings);

    this.tank = new Tank(this._scene, this._controls);
    const camera = createFollowCamera(this._scene, this.tank.mesh);

    window.addEventListener("resize", () => {
      this._engine.resize();
    });

    this.assets.loadAllAssets();

    // this._engine.runRenderLoop(() => {
    //   tank.move(this._controls);
    //   tank.fireCannon(this._controls, this.dudes);
    //   tank.fireLazer(this._controls, this.dudes);

    //   if (this.dudes && this.dudes.length > 0) {
    //     for (const dude of this.dudes) {
    //       dude.follow(tank.mesh);
    //     }
    //   }

    //   this._scene.render();
    // });
  }

  private onImported = (
    newMeshes: Mesh[],
    particleSystems: IParticleSystem[],
    skeletons: Skeleton[]
  ) => {
    newMeshes[0].position = new Vector3(0, 0, 5);
    newMeshes[0].name = "heroDude";
    newMeshes[0].scaling = new Vector3(0.2, 0.2, 0.2);

    console.log("imported", newMeshes);

    this.dudes.push(new Dude(newMeshes[0], 1, this._scene));
    this._scene.beginAnimation(skeletons[0], 0, 100, true, 1.0);

    for (var i = 0; i < 10; i++) {
      const clone = this.doClone(newMeshes[0], skeletons, i);
      this.dudes.push(new Dude(clone, 1, this._scene));
      this._scene.beginAnimation(clone.skeleton, 0, 120, true, 1.0);
    }
  };

  private doClone(original: Mesh, skeletons: Skeleton[], id: number): Mesh {
    const xRand = Math.floor(Math.random() * 501) - 250;
    const zRand = Math.floor(Math.random() * 501) - 250;

    var clone: Mesh;

    clone = original.clone("clone_" + id);
    clone.position = new Vector3(xRand, 0, zRand);

    // No skelons in the model
    if (!skeletons) {
      return clone;
    }

    if (!original.getChildren()) {
      clone.skeleton = skeletons[0].clone("clone_sk_" + id);
      return clone;
    } else {
      if (skeletons.length === 1) {
        // This means one skeleton controls all anitmaions of children
        var clonedSkeleton = skeletons[0].clone("clone_sk_" + id);
        clone.skeleton = clonedSkeleton;

        var numChildren = clone.getChildMeshes().length;

        for (var i = 0; i < numChildren; i++) {
          clone.getChildMeshes()[i].skeleton = clonedSkeleton;
        }

        return clone;
      } else if (skeletons.length === original.getChildren().length) {
        // Each child has its own skeleton
        for (var i = 0; i < clone.getChildMeshes().length; i++) {
          clone.getChildMeshes()[i].skeleton = skeletons[i].clone(
            "clone_sk_" + id + "_" + i
          );
        }

        return clone;
      }
    }

    return clone;
  }

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
    console.log("All assets finished loading.");
    console.log("tasks", tasks[3]);

    this.onImported([this.assets.dude], null, this.assets.dudeSkeleons);

    this._engine.runRenderLoop(this.runRenderLoop);
  }

  private runRenderLoop = () => {
    this.tank.move(this._controls);
    this.tank.fireCannon(this._controls, this.dudes, this.assets);
    this.tank.fireLazer(this._controls, this.dudes, this.assets);

    if (this.dudes && this.dudes.length > 0) {
      for (const dude of this.dudes) {
        dude.follow(this.tank.mesh);
      }
    }

    this._scene.render();
  };
}

new App();
