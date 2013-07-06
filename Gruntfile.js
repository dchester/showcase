module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      javascript: {
        options: { separator: ';' },
        src: [
          'components/underscore/underscore.js',
          'components/swig/swig.js',
          'components/jquery/jquery.js',
          'components/jquery-sortable/jquery.sortable.js',
          'components/bootstrap/js/bootstrap.js'
        ],
        dest: 'public/dist/js/global.js'
      },
      css: {
        src: [
          'components/bootstrap/css/bootstrap.min.css',
          'components/font-awesome/css/font-awesome.min.css'
        ],
        dest: 'public/dist/css/dist.css'
      }
    },
    copy: {
      main: {
        files: [ { expand: true, cwd: 'components/font-awesome/font/', src: ['**'], dest: 'public/dist/font/' } ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['concat', 'copy']);

};
