module.exports = function (grunt) {
    grunt.initConfig({
        watch: {
            files: [
                '../src/AccelHandler.js'
            ],
            tasks: 'min'
        },
        min: {
            '../src/AccelHandler.js': ['js/AccelHandler.min.js']
        }
    });

    grunt.registerTask('default', 'min');
};
