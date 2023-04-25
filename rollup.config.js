import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';

export default [
  {
    input: ['src/index.ts'],
    plugins: [commonjs(), typescript()],
    external: [],
    output: [
      {
        dir: 'dist',
        format: 'cjs',
      },
      {
        dir: 'esm',
        format: 'es',
      },
    ],
  },
];
