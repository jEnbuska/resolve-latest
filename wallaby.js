module.exports = function (wallaby) {
    return {
        files: [
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
        }
    };
};
