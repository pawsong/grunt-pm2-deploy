'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        'test/**/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    pm2deploy: {
      options: {
        ecosystemFile: 'ecosystem.json'
      }
    },

    // Unit tests.
    mochaTest: { 
      options: {
        timeout: 60 * 1000
      },
      test: ['test/test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('lint', ['jshint']);
  grunt.registerTask('test', ['mochaTest']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['lint', 'test']);
};
