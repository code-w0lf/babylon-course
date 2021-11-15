import {
  Mesh,
  Skeleton,
  ParticleSystem,
  Scene,
  StandardMaterial,
  Texture,
  Vector3,
  Color4,
  VertexData,
} from "@babylonjs/core";
import Assets from "../scene/Assets";

class Dude {
  private _scene: Scene;

  public mesh: Mesh;
  public boundry: Mesh;
  public speed: number;
  public name: string;
  public boundingBoxParameters: any;
  public particleSystem: ParticleSystem;
  public health: number;

  public static count: number = 0;

  constructor(mesh: Mesh, speed: number, scene: Scene) {
    this._scene = scene;
    this.mesh = mesh;
    this.speed = speed;
    this.name = mesh.name.concat("_", Dude.count.toString());
    this.health = 3;

    console.log(this.name);

    this.boundry = this._createBoundingBox();
    this.particleSystem = this._createParticleSystem();
  }

  private _createBoundingBox(): Mesh {
    this._calculateBoundingBoxParameters();
    const { lengthX, lengthY, lengthZ } = this.boundingBoxParameters;

    const boundery = Mesh.CreateBox("boundery_" + this.mesh.id, 1, this._scene);
    boundery.scaling.x = lengthX * this.mesh.scaling.x;
    boundery.scaling.y = lengthY * this.mesh.scaling.y;
    boundery.scaling.z = lengthZ * this.mesh.scaling.z * 2;
    boundery.checkCollisions = true;
    boundery.isVisible = false;
    boundery.position = new Vector3(
      this.mesh.position.x,
      this.mesh.position.y + (this.mesh.scaling.y * lengthY) / 2,
      this.mesh.position.z
    );

    const material = new StandardMaterial("boundryMaterial", this._scene);
    material.alpha = 0.5;
    boundery.material = material;

    return boundery;
  }

  private _createParticleSystem() {
    // Create a particle system
    const particleSystem = new ParticleSystem("particles", 2000, this._scene);

    //Texture of each particle
    particleSystem.particleTexture = new Texture(
      "models/dude/flare.png",
      this._scene
    );

    // Where the particles come from
    particleSystem.emitter = new Vector3(0, 0, 0); // the starting object, the emitter

    // Colors of all particles
    particleSystem.color1 = new Color4(1, 0, 0, 1.0);
    particleSystem.color2 = new Color4(1, 0, 0, 1.0);
    particleSystem.colorDead = new Color4(0, 0, 0, 0.0);

    particleSystem.emitRate = 100;

    // Set the gravity of all particles
    particleSystem.gravity = new Vector3(0, -9.81, 0);

    // Direction of each particle after it has been emitted
    particleSystem.direction1 = new Vector3(0, -1, 0);
    particleSystem.direction2 = new Vector3(0, -1, 0);

    particleSystem.minEmitPower = 6;
    particleSystem.maxEmitPower = 10;

    return particleSystem;
  }

  private _calculateBoundingBoxParameters() {
    var minX = 9999999;
    var minY = 9999999;
    var minZ = 9999999;

    var maxX = -9999999;
    var maxY = -9999999;
    var maxZ = -9999999;

    var children = this.mesh.getChildMeshes() as Mesh[];

    for (var i = 0; i < children.length; i++) {
      var positions = VertexData.ExtractFromGeometry(
        children[i].geometry
      ).positions;
      if (!positions) continue;

      var index = 0;
      for (var j = index; j < positions.length; j += 3) {
        if (positions[j] < minX) {
          minX = positions[j];
        }
        if (positions[j] > maxX) {
          maxX = positions[j];
        }
      }

      index = 1;
      for (var j = index; j < positions.length; j += 3) {
        if (positions[j] < minY) {
          minY = positions[j];
        }
        if (positions[j] > maxY) {
          maxY = positions[j];
        }
      }

      index = 2;
      for (var j = index; j < positions.length; j += 3) {
        if (positions[j] < minZ) {
          minZ = positions[j];
        }
        if (positions[j] > maxZ) {
          maxZ = positions[j];
        }
      }

      var lengthX = maxX - minX;
      var lengthY = maxY - minY;
      var lengthZ = maxZ - minZ;
    }

    this.boundingBoxParameters = {
      lengthX: lengthX,
      lengthY: lengthY,
      lengthZ: lengthZ,
    };
  }

  public static doClone(
    original: Mesh,
    skeletons: Skeleton[],
    id: number
  ): Mesh {
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

  public follow(target: Mesh) {
    this.mesh.position = new Vector3(
      this.boundry.position.x,
      this.boundry.position.y -
        (this.mesh.scaling.y * this.boundingBoxParameters.lengthY) / 2,
      this.boundry.position.z
    );
    const direction = target.position.subtract(this.mesh.position);
    const distance = direction.length();
    const dir = direction.normalize();
    const alpha = Math.atan2(-1 * dir.x, -1 * dir.z);
    this.mesh.rotation.y = alpha;

    if (distance > 30) {
      this.boundry.moveWithCollisions(
        dir.multiplyByFloats(this.speed, this.speed, this.speed)
      );
    }
  }

  public hit(assets: Assets) {
    this.health--;

    if (this.health > 0) {
      this.particleSystem.emitter = this.boundry.position;
      this.particleSystem.start();

      setTimeout(() => {
        this.particleSystem.stop();
      }, 1000);
    } else {
      assets.dieSound.play();
      this.boundry.dispose();
      this.mesh.dispose();
    }
  }

  public kill(assets: Assets) {
    this.particleSystem.emitter = this.boundry.position;
    this.particleSystem.emitRate = 500;
    this.particleSystem.start();
    assets.dieSound.play();

    setTimeout(() => {
      this.particleSystem.stop();
    }, 1000);

    this.boundry.dispose();
    this.mesh.dispose();
  }
}

export default Dude;
