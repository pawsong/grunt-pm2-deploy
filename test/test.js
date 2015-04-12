'use strict';

/* global describe, it */

var expect = require('chai').expect;

var grunt = require('grunt'),
    async = require('async'),
    path = require('path'),
    fs = require('fs'),
    runTask = require('grunt-run-task'),
    format = require('util').format;

var sshSrv = require('./lib/sshServer');

runTask.loadTasks('tasks');

var ROOT_PATH = path.resolve(__dirname, '..');

describe('pm2deploy', function () {

  before(function (done) {

    require('../Gruntfile')(grunt);

    // Run ssh server
    sshSrv(ROOT_PATH, function (err, port) {
      if (err) {
        return done(err);
      }

      // Set ssh port as grunt config
      grunt.config.set('pm2deploy.options.defaultConfig.port', '' + port);
      done();
    });
  });

  it('should generate config file for given env', function (done) {

    runTask.task('pm2deploy:development', grunt.config.get('pm2deploy')).run(done);
  });

});

