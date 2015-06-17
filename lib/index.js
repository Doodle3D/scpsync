'use strict';

/*****************************************
 * setup
 */

/*****************************************
 * copy ssh key
 * cat ~/.ssh/id_rsa.pub | ssh wifibox 'cat >> /etc/dropbear/authorized_keys'
 **/

//--requires
var chokidar = require('chokidar');
var scp = require('scp');
var exec = require('ssh-exec');
var fs = require('fs');
var jsesc = require('jsesc');
var program = program = require('commander');
var config = require('config');

//--export
module.exports = ScpSync;

//--console
var log = console.log.bind(console);

//--vars
var pathlocal = "empty pathlocal";
var pathremote = "empty pathremote";

/*****************************************
 * main
 */
function ScpSync() {
  if (!(this instanceof ScpSync)) return new ScpSync();

  var self = this;

  //--init cli
  this.init(function() {
    //--initial transfer of files from local to remote dir
    self.transfer('.');

    //--setup watcher
    self.watcher = chokidar.watch('.', {
      ignored: /[\/\\]\./,
      persistent: true,
      cwd: pathlocal,
      ignoreInitial: true
    });

    //--watcher events
    self.watcher
      .on('change', self.transfer)
      .on('add', self.transfer)
      .on('unlink', self.remove)
      // More events.
      .on('addDir', self.transfer)
      .on('unlinkDir', self.remove)
      .on('error', function(error) {
        log('error: ', error);
      })
      .on('ready', function() {
        log('Initial scan complete. Ready for changes...');
      })
      .on('raw', function(event, path, details) {
        //log('Raw event info:', event, path, details);
      });
  });
}

/*****************************************
 * functions
 */
ScpSync.prototype.init = function(cb) {
  var self = this;

  //--program setup
  program
    .version('1.0.0')
    .usage('[options] [dir]')
    .option('-l, --local <source>', 'specify source folder')
    .option('-r, --remote <destination>', 'specify destination folder')
    // .option('-u, --user <username>', 'specifiy remote user name')
    // .option('-h, --host <remoteip>', 'specifiy host ip x.x.x.x')
    .parse(process.argv);

  //--local
  if (program.local) {
    pathlocal = program.local;
    log("local:", pathlocal);
  } else {
    // this.pathlocal = process.cwd();
    pathlocal = config.local;
    log("local (config):", pathlocal);
  }

  //--remote
  if (program.remote) {
    pathremote = program.remote;
    log("remote:", pathremote);
  } else {
    pathremote = config.remote;
    log("remote (config):", pathremote);
  }

  //--make sure remote path exists
  var cmd = 'mkdir -p ' + pathremote;
  log('[note] mkdir cmd: ', cmd);

  var output = "nothing";

  var mkdir = exec(cmd, {
    user: config.user,
    host: config.hostip,
  }).pipe(process.stdout);

  //--wait some seconds for mkdir -p to have completed
  setTimeout(function() {
    return cb();
  }, 3000);
};

ScpSync.prototype.transfer = function(filepath) {
  var self = this;
  log('[note] transfer: ', pathlocal + filepath);

  if (filepath === '') {
    filepath = '.';
  }

  var options = {
    user: config.user,
    host: config.hostname,
    port: '22',
    file: jsesc(pathlocal + filepath, {
      'quotes': 'double',
      'wrap': true
    }),
    path: jsesc(pathremote + filepath, {
      'quotes': 'double',
      'wrap': true
    })
  }

  log(options);

  scp.send(options, function (err) {
    if (err) log('Transfer error: ' + err);
    else log('[note] transferred to: ' + options.path);
  });
};

ScpSync.prototype.remove = function(filepath) {
  var self = this;
  log('remove: ', filepath);

  var remotepath = jsesc(pathremote + filepath, {
    'quotes': 'double',
    'wrap': true
  });
  var cmd = 'rm -r ' + remotepath;
  log('remove cmd: ', cmd);

  var rm = exec(cmd, {
    user: config.user,
    host: config.hostip
  }).pipe(process.stdout)

  rm.on('end', function() {
    log('rm end');
  });
  rm.on('error', function(err) {
    log('rm err: ', err);
  });
};





/*****************************************
 * test with filename containing space
 */
// setTimeout(function() {
//   fs.writeFile(pathlocal + 'test folder.txt', '', function(err) {
//     if (err) console.log(err);
//     console.log('created file');
//   });
// }, 5000);
//
// setTimeout(function() {
//   console.log('unlink file...');
//   fs.unlink(pathlocal + 'test folder.txt')
// }, 15000);

/*****************************************
 * watcher events
 * 'add', 'addDir' and 'change' events also receive stat() results as second
 * argument when available: http://nodejs.org/api/fs.html#fs_class_fs_stats
 */
// watcher.on('change', function(path, stats) {
//   if (stats) console.log('File', path, 'changed size to', stats.size);
// });


// // Watch new files.
// watcher.add('new-file');
// watcher.add(['new-file-2', 'new-file-3', '**/other-file*']);
//
// // Un-watch some files.
// watcher.unwatch('new-file*');
//
// // Only needed if watching is `persistent: true`.
// watcher.close();

// // Full list of options. See below for descriptions.
// chokidar.watch('file', {
//   persistent: true,
//
//   ignored: '*.txt',
//   ignoreInitial: false,
//   followSymlinks: true,
//   cwd: '.',
//
//   usePolling: true,
//   alwaysStat: false,
//   depth: undefined,
//   interval: 100,
//
//   ignorePermissionErrors: false,
//   atomic: true
// });
