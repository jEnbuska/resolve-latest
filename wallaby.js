module.exports = function (wallaby) {
    return {
        files: [
            'dist/**/*.js',
            'src/**/*.js',
            'package.json', // <--
        ],
        tests: ['tests/**/*test.js'],
        env: {
            type: 'node',
            runner: 'node'
        },
        testFramework: 'jest',
        compilers: {
            'src/**/*.js': wallaby.compilers.babel(),
            'dist/**/*.js': wallaby.compilers.babel(),
        }
    };
};
