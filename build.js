const fs = require('fs');
const sass = require('sass');
const esbuild = require('esbuild');

function ensureDirs() {
	for (const dir of ['assets/css', 'assets/js']) {
		fs.mkdirSync(dir, {recursive: true});
	}
}

function buildCSS() {
	const sassOptions = {
		style: 'compressed',
		// These are mostly needed because we use Bootstrap 3, if we switched to Bootstrap 5 these wouldn't be needed
		silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'slash-div', 'if-function'],
	};

	console.log('Building CSS...');
	const timepickerCss = fs.readFileSync('node_modules/timepicker/jquery.timepicker.min.css', 'utf8');
	const adminResult = sass.compile('assets/src/admin.scss', sassOptions);
	fs.writeFileSync('assets/css/admin.min.css', `${timepickerCss}\n${adminResult.css}`);

	const publicResult = sass.compile('assets/src/public.scss', sassOptions);
	fs.writeFileSync('assets/css/public.min.css', publicResult.css);
}

async function buildJS() {
	console.log('Building JS...');
	const adminBundle = [
		'node_modules/timepicker/jquery.timepicker.min.js',
		'assets/src/maps.js',
		'assets/src/admin.js',
	]
		.map((f) => fs.readFileSync(f, 'utf8'))
		.join('\n');
	const adminResult = await esbuild.transform(adminBundle, {minify: true});
	fs.writeFileSync('assets/js/admin.min.js', adminResult.code);

	const publicBundle = [
		'node_modules/mark.js/dist/jquery.mark.js',
		'assets/js/bootstrap.dropdown.js',
		'assets/src/maps.js',
		'assets/src/public.js',
	]
		.map((f) => fs.readFileSync(f, 'utf8'))
		.join('\n');
	const publicResult = await esbuild.transform(publicBundle, {minify: true});
	fs.writeFileSync('assets/js/public.min.js', publicResult.code);
}

let building = false;
let queued = false;

async function build() {
	if (building) {
		queued = true;
		return;
	}

	building = true;

	try {
		ensureDirs();
		buildCSS();
		await buildJS();
	} catch (error) {
		console.error('Build failed:', error.message);
	} finally {
		building = false;
		if (queued) {
			queued = false;
			build();
		}
	}
}

if (process.argv.includes('--watch')) {
	build();
	console.log('Watching for changes...');
	fs.watch('assets/src', {recursive: true}, (_event, filename) => {
		console.log(`Changed: ${filename}`);
		build();
	});
} else {
	build().catch((error) => {
		console.error(error);
		process.exit(1);
	});
}