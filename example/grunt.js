module.exports = function (grunt) {
    grunt.initConfig({
        watch: {
            files: [
                '../src/AccelHandler.js'
            ],
            tasks: 'min'
        },
        min: {
            'js/AccelHandler.min.js': ['../src/AccelHandler.js']
        }
    });

    grunt.registerTask('default', 'min');
};
