/*****************************************
 * INSTALL:
 * npm install
 *
 * USAGE:
 * node index.js
 *
 * NOTE:
 * work in progress: https://www.npmjs.com/package/ssh-exec
 */

/*****************************************
 * requires
 */
var chokidar = require('chokidar');
var scp = require('scp');

/*****************************************
 * vars
 */
var rootpath = {
  local: 'customfeeds/doodle3d-firmware/src/',
  remote: '/tmp/testing/usr/share/lua/wifibox/',
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
  log('transfer: ', filepath);

  if (filepath === '') {
    filepath = '.';
  }

  var options = {
    user: 'root',
    host: 'wifibox',
    port: '22',
    file: '"' + rootpath.local + filepath + '"',
    path: '"' + rootpath.remote + filepath + '"'
  }

  scp.send(options, function (err) {
    if (err) console.log('Transfer error: ' + err);
    else console.log('Transferred to: ' + options.path);
  });
}

/*****************************************
 * watcher events
 */
watcher
  .on('change', transfer)
  // .on('add', transfer)
  .on('unlink', function(path) {
    log('remove: ', path);
  })
  // More events.
  .on('addDir', transfer)
  .on('unlinkDir', function(path) {
    log('remove dir: ', path);
  })
  .on('error', function(error) {
    log('error: ', error);
  })
  .on('ready', function() {
    log('Initial scan complete. Ready for changes.');
  })
  .on('raw', function(event, path, details) {
    //log('Raw event info:', event, path, details);
  });


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
