import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';


export default {
  entry: 'js/app.js',
  format: 'cjs',
  plugins: [ json(), babel() ],
  dest: 'build2/bundle.js' // equivalent to --output
};