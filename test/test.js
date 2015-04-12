'use strict';

var expect = require('chai').expect;

var grunt = require('grunt'),
    async = require('async'),
    path = require('path'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    spawn = require('child_process').spawn,
    runTask = require('grunt-run-task'),
    format = require('util').format;

runTask.loadTasks('tasks');

var ROOT_PATH = path.resolve(__dirname, '..');

var sshSrv = require('./lib/sshServer');

/* global describe, it */

describe('pm2deploy', function () {

  before(function (done) {

    require('../Gruntfile')(grunt);

    // Run ssh server
    sshSrv(ROOT_PATH, function (err, port) {
      if (err) {
        return done(err);
      }

      grunt.config.set('pm2deploy.options.defaultConfig.port', '' + port);
      done();
    });
  });

  it('should generate config file for given env', function (done) {
    runTask.task('pm2deploy:development', grunt.config.get('pm2deploy')).run(function () {
      console.log(arguments); 
    });
  });

});

