import babel from 'rollup-plugin-babel';

import pkg from './package.json';

const external = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies)];

export default [
    {
        input: 'index.js',
        external,
        plugins: [
            babel({
                exclude: ['node_modules/**'],
            }),
        ],
        output: [
            { file: pkg.main, format: 'cjs', sourcemap: true },
            { file: pkg.module, format: 'es', sourcemap: true },
        ],
    },
];
