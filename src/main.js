import './style.scss';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import vertexShader from './shaders/vertexShader.glsl';
// import fragmentShader from './shaders/fragmentShader.glsl';
import texture2 from '/2.jpg';
import texture5 from '/5.jpg';
import maskURL from '/mask.jpg';

import createInputEvents from 'simple-input-events';
import { DotScreenShader } from './shaders/effect1.js';
import { RGBShader } from './shaders/effect2.js';
import * as dat from 'lil-gui';
import gsap from 'gsap';

export default class Experience {
  constructor(container) {
    this.container = document.querySelector(container);

    // Sizes
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    // Parameters
    this.parameters = {
      imageAspect: null,
      imageAspect2: null,
      shaderScale: null,
      distanceX: 2500,
      distanceZ: 900,
      distanceZ2: 700,
      progress: 0,
      progress1: 0,
      runAnimation: () => {
        this.runAnimation();
      },
    };

    // GUI
    this.gui = new dat.GUI();

    this.resize = () => this.onResize();
  }

  init() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.loadTextures();
    this.addMesh();
    this.createControls();
    this.createClock();
    this.createInputEvents();
    this.createMouseEvent();
    this.addPostProcessing();
    this.getAxes();
    this.addGUI();

    this.addListeners();

    this.renderer.setAnimationLoop(() => {
      this.resize();
      this.update();
      this.render();
    });
  }

  createScene() {
    this.scene = new THREE.Scene();
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.width / this.height,
      0.1,
      3000
    );

    this.camera.position.z = this.parameters.distanceZ;
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    this.container.appendChild(this.renderer.domElement);

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  loadTextures() {
    this.textures = [texture2, texture5];

    this.texture1Scale = new THREE.TextureLoader().load(
      this.textures[0],
      (tex) => {
        this.parameters.imageAspect = tex.image.width / tex.image.height;
      }
    );
    this.texture2Scale = new THREE.TextureLoader().load(
      this.textures[1],
      (tex) => {
        this.parameters.imageAspect2 = tex.image.width / tex.image.height;
      }
    );

    this.textures = [this.texture2Scale, this.texture1Scale];

    this.textureMask = new THREE.TextureLoader().load(maskURL);
  }

  addMesh() {
    let layersCount = 3;
    this.groups = [];

    this.geometry = new THREE.PlaneGeometry(1920, 1080, 32, 32);

    this.textures.forEach((texture, j) => {
      this.group = new THREE.Group();
      this.scene.add(this.group);
      this.groups.push(this.group);

      for (let i = 0; i < layersCount; i++) {
        let material = new THREE.MeshBasicMaterial({
          map: texture,
        });

        if (i > 0) {
          material = new THREE.MeshBasicMaterial({
            map: texture,
            alphaMap: this.textureMask,
            transparent: true,
          });
        }

        let mesh = new THREE.Mesh(this.geometry, material);

        mesh.position.z = (i + 1) * 100;

        this.group.position.x = j * this.parameters.distanceX;
        this.group.add(mesh);
      }
    });
  }

  createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
  }

  createClock() {
    this.clock = new THREE.Clock();
  }

  createInputEvents() {
    this.event = createInputEvents(this.renderer.domElement);
  }

  createMouseEvent() {
    this.mouse = new THREE.Vector2();
    this.mouseTarget = new THREE.Vector2();

    this.event.on('move', ({ uv }) => {
      this.mouse.x = uv[0] - 0.5;
      this.mouse.y = uv[1] - 0.5;
    });
  }

  update() {
    this.controls.update();
  }

  render() {
    // this.renderer.render(this.scene, this.camera);
    this.composer.render();

    this.elapsedTime = this.clock.getElapsedTime();
    this.oscillator = Math.sin(this.elapsedTime * 0.1) * 0.5 - 0.5;

    this.mouseTarget.lerp(this.mouse, 0.1);

    this.groups.forEach((group) => {
      group.rotation.x = -this.mouseTarget.y * 0.2;
      group.rotation.y = -this.mouseTarget.x * 0.2;

      group.children.forEach((material, i) => {
        material.position.z = (i + 1) * 100 - this.oscillator * 200;
      });
    });
  }

  addListeners() {
    window.addEventListener('resize', this.resize);
  }

  onResize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.composer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // if (this.parameters.imageAspect > this.camera.aspect) {
    //   this.parameters.shaderScale.set(
    //     this.parameters.imageAspect / this.camera.aspect,
    //     1
    //   );
    // } else {
    //   this.parameters.shaderScale.set(
    //     1,
    //     this.camera.aspect / this.parameters.imageAspect
    //   );
    // }
  }

  addPostProcessing() {
    this.composer = new EffectComposer(this.renderer);

    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    this.effectPass = new ShaderPass(DotScreenShader);
    this.composer.addPass(this.effectPass);

    this.effectPass1 = new ShaderPass(RGBShader);
    this.composer.addPass(this.effectPass1);
  }

  getAxes() {
    this.axes = new THREE.AxesHelper();
    this.scene.add(this.axes);
  }

  runAnimation() {
    this.tl = gsap.timeline();

    this.tl.to(this.camera.position, {
      x: this.parameters.distanceX,
      duration: 1.5,
      ease: 'power4.inOut',
    });

    this.tl.to(
      this.camera.position,
      {
        z: this.parameters.distanceZ2,
        duration: 1,
        ease: 'power4.inOut',
      },
      0
    );

    this.tl.to(
      this.camera.position,
      {
        z: this.parameters.distanceZ,
        duration: 1,
        ease: 'power4.inOut',
      },
      1
    );

    this.tl.to(
      this.effectPass.uniforms.uProgress,
      {
        value: 1,
        duration: 1,
        ease: 'power3.inOut',
      },
      0
    );

    this.tl.to(
      this.effectPass.uniforms.uProgress,
      {
        value: 0,
        duration: 1,
        ease: 'power3.inOut',
      },
      1
    );

    this.tl.to(
      this.effectPass1.uniforms.uProgress,
      {
        value: 1,
        duration: 1,
        ease: 'power3.inOut',
      },
      0
    );

    this.tl.to(
      this.effectPass1.uniforms.uProgress,
      {
        value: 0,
        duration: 1,
        ease: 'power3.inOut',
      },
      1
    );
  }

  addGUI() {
    this.gui.add(this.parameters, 'runAnimation');

    this.gui.add(this.parameters, 'progress').min(0).max(1).step(0.01);
    this.gui
      .add(this.parameters, 'progress1')
      .min(0)
      .max(1)
      .step(0.01)
      .onChange((value) => {
        this.effectPass.uniforms.uProgress.value = value;
      });
  }
}

const experience = new Experience('#app');
experience.init();
