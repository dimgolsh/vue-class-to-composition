import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
	plugins: [nodePolyfills()],
	base: './',
	build: {
		outDir: 'demo-dist',
	},
});
