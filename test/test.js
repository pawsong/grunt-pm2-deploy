'use strict';

/* global describe, it */

var expect = require('chai').expect;

var grunt = require('grunt'),
    rimraf = require('rimraf'),
    async = require('async'),
    pm2 = require('pm2'),
    path = require('path'),
    runTask = require('grunt-run-task'),
    request = require('request');

var sshSrv = require('./lib/sshServer');

runTask.loadTasks('tasks');

var ROOT_PATH = path.resolve(__dirname, '..');

describe('pm2deploy', function () {

  describe('#grunt-task', function () {

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

    it('should deploy server', function (done) {

      runTask.task('pm2deploy:test', grunt.config.get('pm2deploy')).run(done);
    });
  });

  describe('#deployed-server', function () {

    it('should return correct response', function (done) {
      
      request('http://127.0.0.1:10123', function (err, response, body) {
        if (err) {
          return done(err); 
        }

        if (response.statusCode !== 200) {
          return done(new Error('Invalid statusCode: ' + response.statusCode)); 
        }

        try {
          body = JSON.parse(body);
          expect(body).to.be.deep.equal({
            env: 'test' 
          });
        } catch(e) {
          return done(e); 
        }

        return done();
      })
    });
  });

  after(function (done) {

    async.series([

      // Delete pm2 process
      function (callback) {
        pm2.connect(callback);
      },
      function (callback) {
        pm2.delete('grunt-pm2-deploy', callback);
      },
      function (callback) {
        pm2.disconnect(callback);
      },

      // Remove deployed files
      function (callback) {
        rimraf('/tmp/grunt-pm2-deploy', callback);
      }
    ], done);
  });
});

