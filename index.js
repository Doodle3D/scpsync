'use strict';

/*****************************************
 * NOTE:
 * work in progress: https://www.npmjs.com/package/ssh-exec
 */

/*****************************************
 * requires
 */
var chokidar = require('chokidar');
var scp = require('scp');
var SSH = require('simple-ssh');
var exec = require('ssh-exec');
var fs = require('fs');
var jsesc = require('jsesc');

/*****************************************
 * vars
 */
var rootpath = {
  local: '../customfeeds/doodle3d-firmware/src/',
  //remote: '/tmp/testing/usr/share/lua/wifibox/'
  remote: '/usr/share/lua/wifibox/'
}

/*****************************************
 * display current directory tree
 */
// chokidar.watch(rootpath.local).on('all', function(event, path) {
//   console.log(event, path);
// });

/*****************************************
 * setup watcher
 */
var watcher = chokidar.watch('.', {
  ignored: /[\/\\]\./,
  persistent: true,
  cwd: rootpath.local,
  ignoreInitial: true
});

/*****************************************
 * bind console to log function
 */
var log = console.log.bind(console);

/*****************************************
 * initial transfer of files from local to remote dir
 */
transfer('.');

/*****************************************
 * transfer function
 */
function transfer(filepath) {
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
}

/*****************************************
 * transfer function
 */
function remove(filepath) {
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

  //--also working alternative:
  // var ssh = new SSH({
  //     host: '192.168.5.1',
  //     user: 'root',
  //     agent: process.env.SSH_AUTH_SOCK,
  //     agentForward: true
  // });
  //
  // ssh.exec('rm -r ' + remotepath, {
  //   out: function(stdout) {
  //     console.log('remote stdout: ', stdout);
  //   },
  //   err: function(stderr) {
  //     console.log('remote stderr: ', stderr)
  //   }
  // }).start();
  //
  // ssh.on('error', function(err) {
  //   console.log('Oops, something went wrong.');
  //   console.log(err);
  //   ssh.end();
  // });
}

/*****************************************
 * watcher events
 */
watcher
  .on('change', transfer)
  .on('add', transfer)
  .on('unlink', remove)
  // More events.
  .on('addDir', transfer)
  .on('unlinkDir', remove)
  .on('error', function(error) {
    log('error: ', error);
  })
  .on('ready', function() {
    log('Initial scan complete. Ready for changes...');
  })
  .on('raw', function(event, path, details) {
    //log('Raw event info:', event, path, details);
  });

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
