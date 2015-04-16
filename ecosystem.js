'use strict';

module.exports = {
  apps: [{
    name: "grunt-pm2-deploy",
    script: "test/fixtures/server.js",
    env_test : {
      "PORT": 10123,
      "NODE_ENV": "test"
    }
  }],
  deploy: {
    test: {
      user: "node",
      host: "127.0.0.1",
      ref: "origin/master",
      repo: "https://github.com/gifff/grunt-pm2-deploy.git",
      path: "/tmp/grunt-pm2-deploy/test",
      "post-deploy": "npm install && node_modules/pm2/bin/pm2 startOrRestart ecosystem.json --env test"
    }
  }
};
