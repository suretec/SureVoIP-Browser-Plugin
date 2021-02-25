import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import buble from '@rollup/plugin-buble';
import copy from 'rollup-plugin-copy';
import license from 'rollup-plugin-license';
import manifestJson from 'rollup-plugin-manifest-json';
import manifestData from './public/manifest.json';
//import { terser } from 'rollup-plugin-terser';

const isChrome = process.env.TARGET_BROWSER === 'chrome';
const outDir = `build/${process.env.TARGET_BROWSER || 'chrome'}`;
//console.log(` isChrome=${isChrome}; outDir=${outDir}`);

const splitPerms = (data) => {
  const perms = data["permissions"];
  if (!perms) return [undefined, undefined];
  const pred = perm => /^(?:http|\*)/.test(perm);
  return [
    perms.filter(perm => !pred(perm)),
    perms.filter(perm => pred(perm))
  ];
};
const [perms, hostPerms] = splitPerms(isChrome? manifestData : {});

const manifestSpecData = isChrome? {
  "manifest_version": 3,
  "background": {
    "service_worker": manifestData["background"]["scripts"].toString()
  },
  "browser_action": undefined,
  "action": manifestData["browser_action"],
  "permissions": perms,
  "host_permissions": hostPerms,
  "web_accessible_resources": [{
    "resources": manifestData["web_accessible_resources"],
    "matches": [],
    "extension_ids": []
  }]
} : {};

export default {
  input: {
    background: 'src/background.js',
    content: 'src/SureVoIP.js'
  },
  output: {
    dir: outDir,
    format: 'cjs'
  },
  plugins: [
    replace({
      'process.env.CHROME': JSON.stringify(isChrome),
    }),    
    resolve(),
    commonjs(),
    buble({
      transforms: { dangerousForOf: true },
      include: [ 'src/*.js' ]
    }),
    license({
      sourcemap: false,
      banner: {
        content: { file: 'src/license.tpl.txt' }
      }
    }),
    copy({
      flatten: false,
      targets: [
        {
          src: [ 'public/**/*', '!public/manifest.json' ],
          dest: outDir
        }
      ]
    }),
    manifestJson({
      input: 'public/manifest.json',
      manifest: manifestSpecData
    })
  ]
};
