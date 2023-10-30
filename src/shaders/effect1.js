import { Vector2 } from 'three';

/**
 * Dot screen shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

const DotScreenShader = {
  name: 'DotScreenShader',

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
            
            if(_uv.x < 0.25) {
                _uv.x = _uv.x - 0.0 * uProgress;
            } else if(_uv.x < 0.5) {
                _uv.x = _uv.x - 0.25 * uProgress;
            } else if(_uv.x < 0.75) {
                _uv.x = _uv.x - 0.5 * uProgress;
            } else {
                _uv.x = _uv.x - 0.65 * uProgress;
            }

			vec4 color = texture2D( tDiffuse, _uv );

			gl_FragColor = color;

		}`,
};

export { DotScreenShader };
