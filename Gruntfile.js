module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: { separator: ';' },
      dist: {
        src: [
          'components/jquery/jquery.js',
          'components/jquery-sortable/jquery.sortable.js',
          'components/bootstrap/js/bootstrap.js'
        ],
        dest: 'public/dist/global.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('default', ['concat']);

};
