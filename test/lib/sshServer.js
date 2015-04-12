var fs = require('fs'),
    path = require('path'),
    spawn = require('child_process').spawn;

var ssh2 = require('ssh2'),
    utils = ssh2.utils,
    Server = ssh2.Server;

module.exports = function (cwd, done) {

  new Server({
    privateKey: fs.readFileSync(__dirname + '/ssh_host_rsa_key')
  }, function(client) {

    // Accept everyone for test purpose
    client.on('authentication', function(ctx) {
      ctx.accept();
    }).on('ready', function() {

      client.on('session', function(accept, reject) {

        var session = accept();

        // Allow to run any command
        session.once('exec', function(accept, reject, info) {
          
          var stream = accept();
          var sh = spawn('sh', ['-c', info.command], {
            cwd: cwd
          });

          console.log('cmd: %s', info.command);

          sh.stdout.on('data', function (data) {
            stream.write(data); 
          });

          sh.stderr.on('data', function (data) {
            stream.write(data);
          });

          sh.on('close', function (code) {
            stream.exit(code);
            stream.end();
          });
        });
      });
    });
  }).listen(0, '127.0.0.1', function() {
    done(null, this.address().port);
  });
};
