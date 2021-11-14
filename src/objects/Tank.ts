import {
  Color3,
  Mesh,
  MeshBuilder,
  Ray,
  RayHelper,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import Assets from "../scene/Assets";
import CannonBall from "./CannonBall";
import Dude from "./Dude";

class Tank {
  private _scene: Scene;

  public mesh: Mesh;
  public name: string;
  public speed: number;
  public front: Vector3;
  public canFireCannon: boolean = true;
  public canFireLazer: boolean = true;

  constructor(scene: Scene, controls: any) {
    this._scene = scene;

    const tank = MeshBuilder.CreateBox(
      "heroTank",
      { height: 1, depth: 6, width: 6 },
      scene
    );

    const material = new StandardMaterial("tankMaterial", scene);
    material.diffuseColor = Color3.Red();
    material.emissiveColor = Color3.Blue();

    tank.material = material;
    tank.position.y += 0.6;

    this.mesh = tank;
    this.name = "heroTank";
    this.speed = 2;
    this.front = new Vector3(0, 0, 1);

    document.addEventListener("keydown", (event) =>
      this.setControls(event, controls, true)
    );
    document.addEventListener("keyup", (event) =>
      this.setControls(event, controls, false)
    );
  }

  public fireCannon(controls: any, dudes: Dude[], assets: Assets) {
    if (!controls.bPressed) return;

    if (!this.canFireCannon) return;

    assets.cannonSound.play();
    this.canFireCannon = false;
    setTimeout(() => {
      this.canFireCannon = true;
    }, 500);

    new CannonBall(this.mesh.position, this.front, this._scene, dudes, assets);
  }

  public fireLazer(controls: any, dudes: Dude[], assets: Assets) {
    if (!controls.rPressed) return;

    if (!this.canFireLazer) return;

    assets.laserSound.play();
    this.canFireLazer = false;

    const ray = new Ray(
      this.mesh.position,
      new Vector3(this.front.x, this.front.y + 0.1, this.front.z),
      1000
    );

    const rayHelper = new RayHelper(ray);
    rayHelper.show(this._scene, Color3.Red());

    setTimeout(() => {
      this.canFireLazer = true;
      rayHelper.dispose();
    }, 200);

    const pickInfo = this._scene.pickWithRay(ray, (mesh) => {
      return mesh.name !== "heroTank";
    });

    console.log(pickInfo);

    if (pickInfo.pickedMesh?.name.startsWith("boundery")) {
      const picked = this._scene.getMeshByName(pickInfo.pickedMesh.name);
      const dude = dudes.filter((dude) => dude.boundry.name === picked.name);
      if (dude) dude[0].hit(assets);
    }
  }

  public move(controls: any) {
    if (controls.upPressed) {
      this.mesh.moveWithCollisions(
        this.front.multiplyByFloats(this.speed, this.speed, this.speed)
      );
    }
    if (controls.downPressed) {
      this.mesh.moveWithCollisions(
        this.front.multiplyByFloats(
          -1 * this.speed,
          -1 * this.speed,
          -1 * this.speed
        )
      );
    }
    if (controls.leftPressed) {
      this.mesh.rotation.y -= 0.05;
      this.front = new Vector3(
        Math.sin(this.mesh.rotation.y),
        0,
        Math.cos(this.mesh.rotation.y)
      );
    }
    if (controls.rightPressed) {
      this.mesh.rotation.y += 0.05;
      this.front = new Vector3(
        Math.sin(this.mesh.rotation.y),
        0,
        Math.cos(this.mesh.rotation.y)
      );
    }
  }

  private setControls(event: any, controls: any, isPressed: boolean) {
    if (event.key == "w" || event.key == "W") {
      controls.upPressed = isPressed;
    }
    if (event.key == "s" || event.key == "S") {
      controls.downPressed = isPressed;
    }
    if (event.key == "a" || event.key == "A") {
      controls.leftPressed = isPressed;
    }
    if (event.key == "d" || event.key == "D") {
      controls.rightPressed = isPressed;
    }
    if (event.key == "b" || event.key == "B") {
      controls.bPressed = isPressed;
    }
    if (event.key == "r" || event.key == "R") {
      controls.rPressed = isPressed;
    }
  }
}

export default Tank;
