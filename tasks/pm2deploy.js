'use strict';

var fs = require('fs'),
    path = require('path'),
    format = require('util').format,
    exec = require('child_process').exec,
    async = require('async'),
    deploy = require('pm2-deploy'),
    extend = require('extend');

module.exports = function(grunt) {

  grunt.registerTask('pm2deploy',
    'Deploy application with `pm2 deploy` command',
    function (target) {

      var done = this.async();

      var options = this.options({
        defaultConfig: {},
        ecosystemFile: 'ecosystem.json',
      });

      var ecosystemFile = path.resolve(options.ecosystemFile);

      // Check if files exist
      if (!fs.existsSync(ecosystemFile)) {
        grunt.log.warn('Cannot find ecosystem file: %s',
                       options.ecosystemFile);
        return false;
      }

      var ecosystem = extend(true, {}, options.ecosystem, require(ecosystemFile));

      var deployConf = ecosystem.deploy;
      if (!target || !deployConf[target]) {

        grunt.log.warn(
          'Target is invalid. Target must be an env in ecosystem file'
        );

        grunt.log.warn(
          'Available targets: [ %s ]', Object.keys(deployConf).join(', ')
        );

        return false;
      }

      Object.keys(options.defaultConfig).forEach(function (key) {
        if (deployConf[target][key] === undefined) {
          deployConf[target][key] = options.defaultConfig[key];
        }
      });

      async.series([

        // Ensure the remote server is set up
        function (callback) {

          grunt.log.ok('Ensure all remote servers are set up...');

          var targetConf = deployConf[target];

          var hosts = Array.isArray(targetConf.host) ? targetConf.host
                                                     : [targetConf.host];

          var port = targetConf.port || '22';

          async.eachSeries(hosts, function (host, cb) {

            var cmd = format('ssh -o "StrictHostKeyChecking no" -p %s %s@%s ' +
                             '"[ -d %s/current ] || echo setup"',
                             port, targetConf.user, host, targetConf.path);

            exec(cmd, function (err, stdout, stderr) {

              if (err) {
                grunt.log.warn('cmd failed: %s', cmd);
                grunt.log.warn(stderr);
                return cb(new Error(format('exit code = %d', err.code)));
              }

              var needToSetup = stdout.indexOf('setup') !== -1;

              if (!needToSetup) {
                return cb();
              }

              grunt.log.ok('Set up app on remote location: %s@%s:%s',
                           targetConf.user, host, targetConf.path);

              var confArg = extend(true, {}, deployConf);
              confArg[target].host = host;
              deploy.deployForEnv(confArg, target, ['setup'], cb);
            });
          }, callback);
        },

        // Deploy
        function (callback) {

          grunt.log.ok('Deploy app to remote servers...');

          deploy.deployForEnv(deployConf, target, [], function (err) {
            if (typeof err === 'number') {
              err = new Error('exit code = ' + err);
            }

            return callback(err);
          });
        }

      ], done);

    });

};

