'use strict';

const sass = require('sass');
const esbuild = require('esbuild');
const fs = require('fs');

const isProd = process.argv.includes('--production');
const isWatch = process.argv.includes('--watch');

function buildCss() {
	// public.min.css
	const pub = sass.compile('assets/src/public.scss', { style: isProd ? 'compressed' : 'expanded' });
	fs.writeFileSync('assets/css/public.min.css', pub.css);

	// admin.min.css = timepicker CSS prepended to compiled admin SCSS
	const admin = sass.compile('assets/src/admin.scss', { style: isProd ? 'compressed' : 'expanded' });
	const timepickerCss = fs.readFileSync('node_modules/timepicker/jquery.timepicker.min.css', 'utf8');
	fs.writeFileSync('assets/css/admin.min.css', timepickerCss + '\n' + admin.css);

	console.log('CSS built');
}

function buildJs() {
	const bundles = [
		{
			files: [
				'node_modules/timepicker/jquery.timepicker.min.js',
				'assets/src/maps.js',
				'assets/src/admin.js',
			],
			out: 'assets/js/admin.min.js',
		},
		{
			files: [
				'node_modules/mark.js/dist/jquery.mark.js',
				'assets/js/bootstrap.dropdown.js',
				'assets/src/maps.js',
				'assets/src/public.js',
			],
			out: 'assets/js/public.min.js',
		},
	];

	for (const { files, out } of bundles) {
		const combined = files.map(f => fs.readFileSync(f, 'utf8')).join('\n;\n');
		const result = esbuild.transformSync(combined, { minify: isProd, loader: 'js' });
		fs.writeFileSync(out, result.code);
	}

	console.log('JS built');
}

function build() {
	try {
		buildCss();
	} catch (e) {
		console.error('CSS error:', e.message);
	}
	try {
		buildJs();
	} catch (e) {
		console.error('JS error:', e.message);
	}
}

if (isWatch) {
	build();
	fs.watch('assets/src', { recursive: true }, (_, filename) => {
		if (/\.(scss|js)$/.test(filename ?? '')) {
			console.log(`Changed: ${filename}`);
			build();
		}
	});
	console.log('Watching assets/src for changes...');
} else {
	build();
}
