import typescript from 'rollup-plugin-typescript2';

import pkg from './package.json';

const external = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies)];

export default [
    {
        input: 'src/index.ts',
        external,
        plugins: [
            typescript({
                tsconfig: 'tsconfig.package.json',
            }),
        ],
        output: [
            { file: pkg.main, format: 'cjs', sourcemap: true },
            { file: pkg.module, format: 'es', sourcemap: true },
        ],
    },
];
