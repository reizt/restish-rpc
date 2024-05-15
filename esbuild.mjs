import { buildSync } from 'esbuild';
import pkg from './package.json' assert { type: 'json' };

/**
 * Common build function
 * @param {string} input input file path
 * @param {string} output output file path
 * @param {string} format output format
 * @param {boolean} minify minify output or not
 * @param {boolean} sourcemap enable sourcemap or not
 * @param {boolean} bundleDeps bundle dependencies or not
 */
const build = (input, output, format, minify, sourcemap, bundleDeps) => {
	try {
		const start = Date.now();
		const deps = [...Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies, ...pkg.devDependencies })];
		console.log('Compiling...');
		buildSync({
			target: 'es2022',
			platform: 'node',
			format,
			color: true,
			bundle: false,
			entryPoints: [input],
			outfile: output,
			minify,
			sourcemap,
			// external: bundleDeps ? undefined : deps,
		});
		console.log(`Compiled ${Date.now() - start}ms`);
		process.exit(0);
	} catch (err) {
		console.log('Build failed!');
		console.error(err);
		process.exit(1);
	}
};

const mode = process.argv[2];
switch (mode) {
	case 'dev': {
		build('./example/index.ts', './tmp/dev-server.mjs', 'esm', false, false, false);
		break;
	}
	case 'cjs': {
		build('./src/index.ts', './lib/index.cjs', 'cjs', false, false, false);
		break;
	}
	case 'esm': {
		build('./src/index.ts', './lib/index.mjs', 'esm', false, false, false);
		break;
	}
	default:
		throw new Error(`Unknown mode: ${mode}`);
}
