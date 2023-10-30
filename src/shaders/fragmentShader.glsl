uniform sampler2D uTexture;
uniform vec2 uScale;
uniform sampler2D uAlpha;

varying vec2 vUv;

void main() {
    vec2 _uv = (vUv - vec2(0.5)) / uScale + vec2(0.5);

    vec4 textureColor = texture2D(uTexture, _uv);

    gl_FragColor = textureColor;
}