'use strict';

/*****************************************
 * setup
 */

//--requires
var chokidar = require('chokidar');
var scp = require('scp');
var exec = require('ssh-exec');
var fs = require('fs');
var jsesc = require('jsesc');
var program = program = require('commander');

//--export
module.exports = ScpSync;

//--console
var log = console.log.bind(console);

//--vars
var rootpath = {
  local: '../customfeeds/doodle3d-firmware/src/',
  remote: '/usr/share/lua/wifibox/'
  // local: '../customfeeds/print3d/src/script/',
  // remote: '/usr/libexec/'
}


/*****************************************
 * main
 */
function ScpSync() {
  if (!(this instanceof ScpSync)) return new ScpSync();

  //--init cli
  this.initCli();

  //--initial transfer of files from local to remote dir
  this.transfer('.');

  //--setup watcher
  this.watcher = chokidar.watch('.', {
    ignored: /[\/\\]\./,
    persistent: true,
    cwd: rootpath.local,
    ignoreInitial: true
  });

  //--watcher events
  this.watcher
    .on('change', this.transfer)
    .on('add', this.transfer)
    .on('unlink', this.remove)
    // More events.
    .on('addDir', this.transfer)
    .on('unlinkDir', this.remove)
    .on('error', function(error) {
      log('error: ', error);
    })
    .on('ready', function() {
      log('Initial scan complete. Ready for changes...');
    })
    .on('raw', function(event, path, details) {
      //log('Raw event info:', event, path, details);
    });
}

/*****************************************
 * functions
 */
ScpSync.prototype.initCli = function(cb) {
  var self = this;

  program
    .version('1.0.0')
    .usage('[options] [dir]')
    .option('-l, --local <source>', 'specify source folder')
    .option('-r, --remote <destination>', 'specify destination folder')
    .parse(process.argv);

  if (program.local) {
    console.log("local:", program.local)
  } else {
    console.log("cwd:", process.cwd())
  }

  if (program.remote) {
    console.log("remote:", program.remote)
  } else {
    console.log("no destination specified");
  }
};

ScpSync.prototype.transfer = function(filepath) {
  var self = this;
  // log('transfer: ', filepath);

  if (filepath === '') {
    filepath = '.';
  }

  var options = {
    user: 'root',
    host: 'wifibox',
    port: '22',
    file: jsesc(rootpath.local + filepath, {
      'quotes': 'double',
      'wrap': true
    }),
    path: jsesc(rootpath.remote + filepath, {
      'quotes': 'double',
      'wrap': true
    })
  }

  log(options);

  scp.send(options, function (err) {
    if (err) console.log('Transfer error: ' + err);
    else console.log('Transferred to: ' + options.path);
  });
};

ScpSync.prototype.remove = function(filepath) {
  var self = this;
  //  log('remove: ', filepath);

  var remotepath = jsesc(rootpath.remote + filepath, {
    'quotes': 'double',
    'wrap': true
  });
  var cmd = 'rm -r ' + remotepath;
  log('remove cmd: ', cmd);

  var rm = exec(cmd, {
    user: 'root',
    host: '192.168.5.1'
  }).pipe(process.stdout)

  rm.on('end', function() {
    console.log('rm end');
  });
  rm.on('error', function(err) {
    console.log('rm err: ', err);
  });
};





/*****************************************
 * test with filename containing space
 */
// setTimeout(function() {
//   fs.writeFile(rootpath.local + 'test folder.txt', '', function(err) {
//     if (err) console.log(err);
//     console.log('created file');
//   });
// }, 5000);
//
// setTimeout(function() {
//   console.log('unlink file...');
//   fs.unlink(rootpath.local + 'test folder.txt')
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
