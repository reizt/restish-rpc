import { build } from 'esbuild';
import pkg from './package.json' assert { type: 'json' };

/** @type {import('esbuild').BuildOptions} */
const opts = {
	target: 'es2022',
	platform: 'node',
	format: 'esm',
	color: true,
	bundle: true,
};

const deps = Object.keys(pkg.dependencies ?? {});
const devDeps = Object.keys(pkg.devDependencies ?? {});

const mode = process.argv[2];
if (mode === 'dev') {
	opts.entryPoints = ['./example/index.ts'];
	opts.outfile = './tmp/dev-server.mjs';
	opts.minify = false;
	opts.sourcemap = true;
	opts.external = [...deps, ...devDeps];
} else {
	opts.entryPoints = ['./example/index.ts'];
	opts.outfile = './dist/index.mjs';
	opts.minify = false;
	opts.sourcemap = true;
	opts.external = [...deps, ...devDeps];
}

try {
	const start = Date.now();
	console.log('Compiling...');
	await build(opts);
	console.log(`Compiled ${Date.now() - start}ms`);
	process.exit(0);
} catch (err) {
	console.log('Build failed!');
	console.error(err);
	process.exit(1);
}
