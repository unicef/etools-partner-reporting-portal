import defaultConfig from './rollup.config.js';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import license from 'rollup-plugin-license';
import terser from '@rollup/plugin-terser';
import path from 'path';
import {generateSW} from 'rollup-plugin-workbox';
import {workboxConfig} from './workbox-config.js';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to remove before doing new src
const deleteConfig = {
    targets: ['src/*']
};

// Extract license comments in separate file LICENSE.txt
const licenseConfig = {
    thirdParty: {
        output: path.join(__dirname, 'src', 'LICENSE.txt'),
        includePrivate: true
    }
};

// Used for minify JS
const terserConfig = {
    format: {
        comments: false
    }
};


// Extra files to copy in src directory ./src
const copyConfig = {
    targets: [
        {src: 'manifest.json', dest: 'src'},
        {src: 'version.json', dest: 'src'},
        {src: 'upgrade-browser.html', dest: 'src'},
        {src: 'assets', dest: 'src'},
        {src: 'index.html', dest: 'src'},
        {src: 'node_modules/numeral/min', dest: 'src/node_modules/numeral'}
    ]
};


const config = {
    ...defaultConfig,
    plugins: [
        del(deleteConfig),
        ...defaultConfig.plugins,
        license(licenseConfig),
        terser(terserConfig),
        copy(copyConfig),
        generateSW(workboxConfig)
    ],
    preserveEntrySignatures: false
};

export default config;
