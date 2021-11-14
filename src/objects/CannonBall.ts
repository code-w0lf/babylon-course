import {
  Scene,
  Vector3,
  Mesh,
  StandardMaterial,
  Texture,
  PhysicsImpostor,
  ActionManager,
  ExecuteCodeAction,
} from "@babylonjs/core";
import Assets from "../scene/Assets";
import Dude from "./Dude";

class CannonBall {
  static count = 0;

  constructor(
    position: Vector3,
    front: Vector3,
    scene: Scene,
    dudes: Dude[],
    assets: Assets
  ) {
    const cannonBall = Mesh.CreateSphere(
      "cannon_" + CannonBall.count,
      32,
      2,
      scene
    );

    cannonBall.position = new Vector3(position.x, position.y + 1, position.z);
    cannonBall.position.addInPlace(front.multiplyByFloats(5, 5, 5));

    const material = new StandardMaterial("Fire", scene);
    material.diffuseTexture = new Texture("models/cannon/Fire.jpg", scene);
    cannonBall.material = material;

    cannonBall.physicsImpostor = new PhysicsImpostor(
      cannonBall,
      PhysicsImpostor.SphereImpostor,
      { mass: 1 },
      scene
    );
    const force = new Vector3(
      front.x * 100,
      (front.y + 0.1) * 100,
      front.z * 100
    );
    cannonBall.physicsImpostor.applyImpulse(
      force,
      cannonBall.getAbsolutePosition()
    );

    cannonBall.actionManager = new ActionManager(scene);
    dudes.forEach((dude) => {
      cannonBall.actionManager.registerAction(
        new ExecuteCodeAction(
          {
            trigger: ActionManager.OnIntersectionEnterTrigger,
            parameter: dude.boundry,
          },
          () => {
            dude.kill(assets);
            cannonBall.dispose();
          }
        )
      );
    });

    CannonBall.count += 1;

    setTimeout(() => cannonBall.dispose(), 3000);
  }
}

export default CannonBall;
