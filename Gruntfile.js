/* NOTES
 * https://github.com/sindresorhus/grunt-shell
 * http://gruntjs.com/api/grunt.util#grunt.util.spawn
 * http://gruntjs.com/creating-tasks#why-doesn-t-my-asynchronous-task-complete
 */

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-shell');

  function execute(async) {
    var settings = {
      source: '../customfeeds/doodle3d-firmware/src/',
      destination: '/tmp/usr/share/lua/wifibox/',
      user: 'root',
      remoteip: '192.168.5.1',
      hostname: 'wifibox'
    };

    var options = {
      cmd: 'scpsync', //global
      // cmd: 'bin/scpsync', //local
      grunt: false,
      opts: {stdio: 'inherit'},
      args: [
        '-s', settings.source,
        '-d', settings.destination,
        '-u', settings.user,
        '-i', settings.remoteip,
        '-n', settings.hostname
        ]
    };

    function callback(error, result, code) {
      console.log('done');

      if (error) {
        console.log('error:', error);
      }
    }

    /* http://gruntjs.com/api/grunt.util#grunt.util.spawn */
    var child = grunt.util.spawn(options, callback);
  }

  grunt.registerTask('default', function() {
    /* http://gruntjs.com/creating-tasks#why-doesn-t-my-asynchronous-task-complete */
    var async = this.async();
    execute(async);
  });

}
