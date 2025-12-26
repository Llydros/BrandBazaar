import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export interface ObjectViewerOptions {
  modelName: string;
  scale?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

export default class ObjectViewer {
  container: HTMLElement;
  modelName!: string;

  scale = 1;
  autoRotate = false;
  autoRotateSpeed = 1;

  // stores absolute transform values for textures (not relative tiling/offset)
  textureTransforms: Record<string, { size: number, offset: number }> = {};

  // to cache initial configs before the model is loaded
  cachedColorConfigs: Record<string, string> = {};
  cachedTextureConfigs: Record<string, { texture: THREE.Texture, transparent: boolean }> = {};

  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  controls!: OrbitControls;
  animationId?: number;

  model!: THREE.Object3D;
  lightDirectional!: THREE.DirectionalLight;
  lightAmbient!: THREE.AmbientLight;
  stars!: THREE.Points;
  skybox!: THREE.Mesh;

  textureLoader = new THREE.TextureLoader();

  constructor(container: HTMLElement, options: ObjectViewerOptions) {
    this.container = container;
    this.modelName = options.modelName;

    if (options.scale) this.scale = options.scale;
    if (options.autoRotate !== undefined)
      this.autoRotate = options.autoRotate;
    if (options.autoRotateSpeed)
      this.autoRotateSpeed = options.autoRotateSpeed;

    this.init();
  }

  public init() {
    // create scene, camera, renderer
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.setClearColor(0x000000);
    this.container.appendChild(this.renderer.domElement);

    this.createStarfield();
    this.createSkybox();

    this.camera.position.set(-10, 10, 0);

    this.controls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.controls.target.set(0, 0, 0);
    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = Math.PI * 0.5;
    this.controls.minDistance = 4;
    this.controls.maxDistance = 20;
    this.controls.autoRotate = this.autoRotate;
    this.controls.autoRotateSpeed = this.autoRotateSpeed;
    this.controls.update();

    // lighting
    this.lightAmbient = new THREE.AmbientLight(0xffffff, 0.3);
    this.lightDirectional = new THREE.DirectionalLight(0xffffff, 0.7);
    this.lightDirectional.position.set(5, 10, 7.5);

    this.scene.add(this.lightDirectional);
    this.scene.add(this.lightAmbient);

    this.loadModel();
    this.animate();
  }


  private createStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const count = 2000;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < positions.length; i++) {
      positions[i] = (Math.random() - 0.5) * 2000;
    }

    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      sizeAttenuation: false,
    });

    this.stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.stars);
  }

  private createSkybox() {
    const skybox = new THREE.SphereGeometry(500, 32, 32);
    const skyboxMaterial = new THREE.MeshBasicMaterial({
      map: this.textureLoader.load("textures/skybox.jpg"),
      color: 0xff00ff,
      side: THREE.BackSide,
    });
    const skyboxMesh = new THREE.Mesh(skybox, skyboxMaterial);
    this.skybox = skyboxMesh;
    this.scene.add(skyboxMesh);
  }

  private async loadModel() {

    const loader = new GLTFLoader();
    loader.load(`models/${this.modelName}.glb`, (gltf) => {
      this.model = gltf.scene;
      this.model.scale.set(this.scale, this.scale, this.scale);

      this.model.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.material = new THREE.MeshStandardMaterial();
        }
      });

      for (const [partName, color] of Object.entries(this.cachedColorConfigs)) {
        this.applyColor(partName, color);
      }
      this.cachedColorConfigs = {};

      for (const [partName, { texture, transparent }] of Object.entries(this.cachedTextureConfigs)) {
        this.applyTexture(partName, texture, transparent);
      }
      this.cachedTextureConfigs = {};

      this.scene.add(this.model);

      const box = new THREE.Box3().expandByObject(this.model);
      box.getCenter(this.controls.target);

      this.controls.autoRotate = this.autoRotate;
      this.controls.autoRotateSpeed = this.autoRotateSpeed;
    });
  }

  public animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls.update();

    const skyBoxMaterial = this.skybox.material as THREE.MeshBasicMaterial;
    skyBoxMaterial.color.offsetHSL(0.0001, 0, 0);

    this.renderer.render(this.scene, this.camera);
  };

  public updateScale(scale: number) {
    this.scale = scale;
    this.model.scale.set(this.scale, this.scale, this.scale);
  }

  // Applies color to the mesh
  public applyColor(partName: string, color: string) {
    if (!this.model) {
      // cache the config if the model is not loaded yet
      this.cachedColorConfigs[partName] = color;
      return;
    }

    const mesh = this.model.getObjectByName(partName);
    if (!(mesh instanceof THREE.Mesh)) {
      console.warn(`ObjectViewer: No mesh is named as ${partName}`);
      return;
    }

    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.color.set(color);
  }

  // Applies texture to the mesh
  public applyTexture(partName: string, texture: THREE.Texture, isTransparent: boolean) {
    if (!this.model) {
      // cache the config if the model is not loaded yet
      this.cachedTextureConfigs[partName] = { texture, transparent: isTransparent };
      return;
    }

    const mesh = this.model.getObjectByName(partName);
    if (!(mesh instanceof THREE.Mesh)) {
      console.warn(`ObjectViewer: No mesh is named as ${partName}`);
      return;
    }

    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.map = texture;
    mat.transparent = isTransparent;
    mat.needsUpdate = true;
  }

  public applyTextureByUrl(partName: string, url: string, isTransparent: boolean = false, flipY: boolean = false) {
    this.textureLoader.load(url,
      (texture) => {
        texture.flipY = flipY;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        this.applyTexture(partName, texture, isTransparent);
      }
    );

    // unload previous texture if any
    const mesh = this.model?.getObjectByName(partName);
    if (mesh instanceof THREE.Mesh) {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat.map) {
        mat.map.dispose();
      }
    }
  }

  private updateTextureTilingAndOffset(mesh: THREE.Mesh) {
    const mat = mesh.material as THREE.MeshStandardMaterial;
    const transform = this.textureTransforms[mesh.name];
    if (!(mat.map && transform)) return;

    const size = 1 / transform.size;
    const offsetX = 0.5 - 0.5 * size - transform.offset * size;
    const offsetY = 0.5 - 0.5 * size;

    mat.map.repeat.set(size, size);
    mat.map.offset.set(offsetX, offsetY);
    mat.needsUpdate = true;
  }

  public setTextureSize(partName: string, size: number) {
    if (!this.model) return;

    const mesh = this.model.getObjectByName(partName);
    if (!(mesh instanceof THREE.Mesh)) {
      console.warn(`ObjectViewer: No mesh is named as ${partName}`);
      return;
    }

    this.textureTransforms[partName] = this.textureTransforms[partName] || { size: 1, offset: 0 };
    this.textureTransforms[partName].size = size;

    this.updateTextureTilingAndOffset(mesh);
  }

  public setTextureOffset(partName: string, offset: number) {
    if (!this.model) return;

    const mesh = this.model.getObjectByName(partName);
    if (!(mesh instanceof THREE.Mesh)) {
      console.warn(`ObjectViewer: No mesh is named as ${partName}`);
      return;
    }

    this.textureTransforms[partName] = this.textureTransforms[partName] || { size: 1, offset: 0 };
    this.textureTransforms[partName].offset = offset;

    this.updateTextureTilingAndOffset(mesh);
  }

  public onCanvasResize() {
    this.camera.aspect =
      this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
  }

  public destroy() {
    if (this.animationId)
      cancelAnimationFrame(this.animationId);

    if (this.stars) {
      this.stars.geometry.dispose();
      (this.stars.material as THREE.Material).dispose();
    }

    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
