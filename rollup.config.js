import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import buble from '@rollup/plugin-buble';
import copy from 'rollup-plugin-copy';
import license from 'rollup-plugin-license';
//import { terser } from 'rollup-plugin-terser';

export default {
  input: {
    background: 'src/background.js',
    content: 'src/SureVoIP.js'
  },
  output: {
    dir: 'build/chrome/js',
    format: 'cjs'
  },
  plugins: [
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
          dest: [ 'build/chrome', 'build/firefox' ]
        },
        {
          src: 'public/manifest.json',
          dest: 'build/chrome'
        },
        {
          src: 'public/manifest.json',
          dest: 'build/firefox',
          transform: (contents) => contents.toString().replace(/[,]\s*"persistent"\:\s*false/, '')
        }
      ]
    }),
    copy({
      targets: [
        {
          src: [ 'build/chrome/js/*', '!build/chrome/js/jquery*' ],
          dest: 'build/firefox/js'
        }
      ],
      hook: 'writeBundle'
    })
  ]
};
