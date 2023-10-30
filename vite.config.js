import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import { NgmiPolyfill } from 'vite-plugin-ngmi-polyfill';

export default defineConfig({
  plugins: [glsl(), NgmiPolyfill()],
});
