module.exports = {
    extends: [
        'airbnb-base',
        'plugin:jest/recommended',
    ],
    plugins: [
        'import',
        'jest',
    ],
    env: {
        node: true,
        'jest/globals': true,
    },
    overrides: [
        {
            files: ["lib/**/*js", "test/**/*.js", "*.js"],
            rules: {
                indent: ['error', 4],
                semi: ['error', 'always'],
                'no-cond-assign': ['error', 'always'],
                'no-console': 'off',
                'max-len': 'off',
                'global-require': 'off',
                'import/no-dynamic-require': 'off',
                'comma-dangle': false,
                'no-use-before-define': 'off',
                'no-plusplus': 'off',
                'no-unused-expressions': 'off'
            }
        }
    ]
};