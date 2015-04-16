'use strict';

/* global describe, it, before, after */

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

  function cleanUp (done) {

    async.series([

      // Delete pm2 process
      function (callback) {
        pm2.connect(callback);
      },
      function (callback) {
        pm2.delete('grunt-pm2-deploy', function () {
          callback();
        });
      },
      function (callback) {
        pm2.disconnect(callback);
      },

      // Remove deployed files
      function (callback) {
        rimraf('/tmp/grunt-pm2-deploy', callback);
      }
    ], function (err) {
      done(err);
    });
  }

  function testServerResponse (done) {

    async.waterfall([

      function (callback) {
        request('http://127.0.0.1:10123', callback);
      },
      function (response, body, callback) {
        if (response.statusCode !== 200) {
          return callback(
            new Error('Invalid statusCode: ' + response.statusCode)
          );
        }

        try {
          body = JSON.parse(body);
          expect(body).to.be.deep.equal({
            env: 'test'
          });
        } catch(e) {
          return callback(e);
        }

        return callback();
      }
    ], done);
  }

  before(function (done) {

    async.waterfall([

      cleanUp,

      // Start ssh server
      function (callback) {
        sshSrv(ROOT_PATH, callback);
      },

      // Set ssh port as grunt config
      function (port, callback) {

        require('../Gruntfile')(grunt);

        grunt.config.set('pm2deploy.options.defaultConfig.port', '' + port);
        callback();
      }
    ], done);
  });

  describe('with ecosystem.json', function () {

    before(function () {
      grunt.config.set('pm2deploy.options.ecosystemFile', 'ecosystem.json');
    });

    describe('#grunt-task', function () {
      it('should deploy server', function (done) {
        runTask.task('pm2deploy:test', grunt.config.get('pm2deploy')).run(done);
      });
    });

    describe('#deployed-server', function () {
      it('should return correct response', function (done) {
        testServerResponse(done);
      });
    });

    after(function (done) {
      cleanUp(done);
    });
  });

  describe('with ecosystem.js', function () {

    before(function () {
      grunt.config.set('pm2deploy.options.ecosystemFile', 'ecosystem.js');
    });

    describe('#grunt-task', function () {
      it('should deploy server', function (done) {
        runTask.task('pm2deploy:test', grunt.config.get('pm2deploy')).run(done);
      });
    });

    describe('#deployed-server', function () {
      it('should return correct response', function (done) {
        testServerResponse(done);
      });
    });

    after(function (done) {
      cleanUp(done);
    });
  });
});

