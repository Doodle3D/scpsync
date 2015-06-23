'use strict';

/*****************************************
 * setup
 */

/*****************************************
 * copy ssh key
 * cat ~/.ssh/id_rsa.pub | ssh wifibox 'cat >> /etc/dropbear/authorized_keys'
 *
 * make global executable node npm package
 * http://www.anupshinde.com/posts/how-to-create-nodejs-npm-package/
 */

//--requires
var chokidar = require('chokidar');
var scp = require('scp');
var exec = require('ssh-exec');
var fs = require('fs');
var jsesc = require('jsesc');
var program = program = require('commander');
//var config = require('config');

//--export
module.exports = ScpSync;

//--console
var log = console.log.bind(console);

//--vars
var settings = {
  sourcepath: undefined,
  destinationpath: undefined,
  user: undefined,
  remoteip: undefined,
  hostname: undefined
}


/*****************************************
 * main
 */
function ScpSync() {
  if (!(this instanceof ScpSync)) return new ScpSync();

  var self = this;

  //--init cli
  this.init(function() {
    //--initial transfer of files from source to remote dir
    self.transfer('.');

    //--setup watcher
    self.watcher = chokidar.watch('.', {
      ignored: /[\/\\]\./,
      persistent: true,
      cwd: settings.sourcepath,
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
    .option('-s, --sourcepath <sourcepath>', 'specify source folder')
    .option('-d, --destination <destination>', 'specify destination folder')
    .option('-u, --user <user>', 'specifiy remote user name')
    .option('-i, --remoteip <remoteip>', 'specifiy host ip x.x.x.x')
    .option('-n, --hostname <hostname>', 'specifiy ssh hostname')
    .parse(process.argv);

  //--source
  if (program.sourcepath === undefined || program.sourcepath === '.') {
    settings.sourcepath = process.cwd() + '/';
    console.error("source (cwd):", settings.sourcepath);
    // return 1;
  } else {
    settings.sourcepath = program.sourcepath;
    log('source:', settings.sourcepath);
  }

  //--destination
  if (program.destination) {
    settings.destinationpath = program.destination;
    log('destination:', settings.destinationpath);
  } else {
    console.error("no destination specified");
    return 1;
  }

  //--user
  if (program.user) {
    settings.user = program.user;
    log('user:', settings.user);
  } else {
    console.error("no user specified");
    return 1;
  }

  //--hostip
  if (program.remoteip) {
    settings.remoteip = program.remoteip;
    log('remoteip:', settings.remoteip);
  } else {
    console.error("no remoteip specified");
    return 1;
  }

  //--hostname
  if (program.hostname) {
    settings.hostname = program.hostname;
    log('hostname:', settings.hostname);
  } else {
    console.error("no hostname specified");
    return 1;
  }

  //--make sure destination path exists
  var cmd = 'mkdir -p ' + settings.destinationpath;
  log('[note] mkdir cmd: ', cmd);

  var mkdir = exec(cmd, {
    user: settings.user,
    host: settings.remoteip,
  }).pipe(process.stdout);

  //--wait some seconds for mkdir -p to have completed
  setTimeout(function() {
    return cb();
  }, 3000);
};

ScpSync.prototype.transfer = function(filepath) {
  var self = this;
  log('[note] transfer from: ', settings.sourcepath + filepath);

  if (filepath === '') {
    filepath = '.';
  }

  var options = {
    user: settings.user,
    host: settings.hostname,
    port: '22',
    file: jsesc(settings.sourcepath + filepath, {
      'quotes': 'double',
      'wrap': true
    }),
    path: jsesc(settings.destinationpath + filepath, {
      'quotes': 'double',
      'wrap': true
    })
  }

  if (options.path.indexOf(' ') >= 0) {
    log('[abort] whitespaces not allowed');
    return;
  } else {
    // log(options);
    //log('[note] transfer to: ', settings.destinationpath + filepath);
    log('[note] transfer to: ', options.path);

    scp.send(options, function (err) {
      if (err) log('Transfer error: ' + err);
      else log('[ok] transferred: ' + options.path);
    });
  }

};

ScpSync.prototype.remove = function(filepath) {
  var self = this;
  log('remove: ', filepath);

  var removepath = jsesc(settings.destinationpath + filepath, {
    'quotes': 'double',
    'wrap': true
  });
  var cmd = 'rm -r ' + removepath;
  log('remove cmd: ', cmd);

  var rm = exec(cmd, {
    user: settings.user,
    host: settings.remoteip
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
//   fs.writeFile(sourcepath + 'test folder.txt', '', function(err) {
//     if (err) console.log(err);
//     console.log('created file');
//   });
// }, 5000);
//
// setTimeout(function() {
//   console.log('unlink file...');
//   fs.unlink(sourcepath + 'test folder.txt')
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
