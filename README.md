# grunt-pm2-deploy

Deploy node application with pm2-deploy
  
[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]

## What this is

- A simple grunt task for [pm2 deployment system](https://github.com/Unitech/PM2/blob/master/ADVANCED_README.md#deployment)
- This task executes `pm2 deploy` command. Task target will be used as the environment.
- If remote server has to be [setup](https://github.com/Unitech/PM2/blob/master/ADVANCED_README.md#getting-started-with-deployment), this task does it.

## Usage

As for this ecosystem.json,

```json
{
  "apps" : [{
    "name"      : "API",
    "script"    : "app.js",
    "env": {
      "COMMON_VARIABLE": "true"
    },
    "env_production" : {
      "NODE_ENV": "production"
    }
  },{
    "name"      : "WEB",
    "script"    : "web.js"
  }],
  "deploy" : {
    "production" : {
      "user" : "node",
      "host" : "212.83.163.1",
      "ref"  : "origin/master",
      "repo" : "git@github.com:repo.git",
      "path" : "/var/www/production",
      "post-deploy" : "pm2 startOrRestart ecosystem.json --env production"
    },
    "dev" : {
      "user" : "node",
      "host" : "212.83.163.1",
      "ref"  : "origin/master",
      "repo" : "git@github.com:repo.git",
      "path" : "/var/www/development",
      "post-deploy" : "pm2 startOrRestart ecosystem.json --env dev",
      "env"  : {
        "NODE_ENV": "dev"
      }
    }
  }
}
```

these commands are available:

```shell
$ grunt pm2deploy:production # deploy using production env
$ grunt pm2deploy:dev # deploy using dev env
```

## Installation

```bash
$ npm install grunt-pm2-deploy --save-dev
```

## pm2deploy task
_Run this task with the `grunt pm2deploy` command._

### Options

#### ecosystemFile

  Type: `String`  
  Default: 'ecosystem.json'

  ecosystem file name. `require`-able files (*.js, *.json) can be used.

## Tests

  To run the test suite, first install the dependencies, then run `npm test`:

```bash
$ npm install
$ npm test
```

## License

  [MIT](LICENSE)
  
[npm-image]: https://img.shields.io/npm/v/grunt-pm2-deploy.svg
[npm-url]: https://npmjs.org/package/grunt-pm2-deploy
[travis-image]: https://travis-ci.org/gifff/grunt-pm2-deploy.svg?branch=master
[travis-url]: https://travis-ci.org/gifff/grunt-pm2-deploy
