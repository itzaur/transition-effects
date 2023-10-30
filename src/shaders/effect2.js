import { Vector2 } from 'three';

/**
 * Dot screen shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

const RGBShader = {
  name: 'RGBShader',

  uniforms: {
    tDiffuse: { value: null },
    tSize: { value: new Vector2(256, 256) },
    uProgress: { value: 0 },
    angle: { value: 1.57 },
    scale: { value: 1.0 },
  },

  vertexShader: /* glsl */ `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

  fragmentShader: /* glsl */ `

		uniform float uProgress;
		uniform float angle;
		uniform float scale;
		uniform vec2 tSize;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;


		void main() {
      vec2 _uv = vUv;

      vec4 cr = texture2D(tDiffuse, _uv + vec2(0.1, 0.0) * uProgress);
      vec4 cg = texture2D(tDiffuse, _uv );
      vec4 cb = texture2D(tDiffuse, _uv - vec2(0.1, 0.0) * uProgress);

      gl_FragColor = vec4(cr.r, cg.g, cb.b, 1.0);
		}`,
};

export { RGBShader };
