import {
  AbstractAssetTask,
  AssetsManager,
  BinaryFileAssetTask,
  Mesh,
  Scene,
  Skeleton,
  Sound,
} from "@babylonjs/core";

class Assets {
  private _scene: Scene;
  private _assetsManager: AssetsManager;
  private _dudeLoaded: boolean;

  public dude: Mesh;
  public dudeSkeleons: Skeleton[];

  public laserSound: Sound;
  public cannonSound: Sound;
  public dieSound: Sound;

  constructor(
    scene: Scene,
    onProgress: (
      remainingCount: number,
      totalCount: number,
      task: AbstractAssetTask
    ) => void,
    onFinish: (tasks: AbstractAssetTask[]) => void
  ) {
    this._scene = scene;
    this._assetsManager = new AssetsManager(scene);

    this._assetsManager.onProgress = onProgress;
    this._assetsManager.onFinish = onFinish;
  }

  private initDude() {
    const meshTask = this._assetsManager.addMeshTask(
      "dude_loader",
      "him",
      "models/dude/",
      "Dude.babylon"
    );

    meshTask.onSuccess = (task) => {
      this.dude = task.loadedMeshes[0] as Mesh;
      this.dudeSkeleons = task.loadedSkeletons;
      this._dudeLoaded = true;
    };
  }

  private initSounds() {
    const binaryTask1 = this._assetsManager.addBinaryFileTask(
      "laserSoundTask",
      "sounds/laser.wav"
    );
    binaryTask1.onSuccess = (task: BinaryFileAssetTask) => {
      this.laserSound = new Sound("laserSound", task.data, this._scene, null, {
        loop: false,
      });
    };

    const binaryTask2 = this._assetsManager.addBinaryFileTask(
      "cannonSoundTask",
      "sounds/cannon.wav"
    );
    binaryTask2.onSuccess = (task: BinaryFileAssetTask) => {
      this.cannonSound = new Sound("laserSound", task.data, this._scene, null, {
        loop: false,
      });
    };

    const binaryTask3 = this._assetsManager.addBinaryFileTask(
      "laserSoundTask",
      "sounds/die.wav"
    );
    binaryTask3.onSuccess = (task: BinaryFileAssetTask) => {
      this.dieSound = new Sound("laserSound", task.data, this._scene, null, {
        loop: false,
      });
    };
  }

  public loadAllAssets() {
    this.initSounds();
    this.initDude();
    this._assetsManager.load();
  }
}

export default Assets;
