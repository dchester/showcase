module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      javascript: {
        options: { separator: ';' },
        src: [
          'components/underscore/underscore.js',
          'components/jquery/jquery.js',
          'components/jquery-ui/ui/jquery.ui.core.js',
          'components/jquery-ui/ui/jquery.ui.widget.js',
          'components/jquery-ui/ui/jquery.ui.mouse.js',
          'components/jquery-ui/ui/jquery.ui.sortable.js',
          'components/bootstrap/js/bootstrap.js',
          'components/EpicEditor/epiceditor/js/epiceditor.js',
          'components/swig/index.js',
          'components/dropzone/downloads/dropzone.js',
          'public/js/lib/Showcase.js',
          'public/js/lib/Showcase.Collection.js',
          'public/js/lib/Showcase.Form.Input.js'
        ],
        dest: 'public/dist/js/global.js'
      },
      css: {
        src: [
          'components/bootstrap/css/bootstrap.min.css',
          'components/font-awesome/css/font-awesome.min.css',
          'components/dropzone/downloads/css/basic.css',
          'components/jquery-ui/themes/base/jquery-ui.css'
        ],
        dest: 'public/dist/css/dist.css'
      }
    },
    copy: {
      main: {
        files: [ { expand: true, cwd: 'components/font-awesome/font/', src: ['**'], dest: 'public/dist/font/' } ]
      },
      epic: {
        files: [ { expand: true, cwd: 'components/EpicEditor/epiceditor/themes/', src: ['**'], dest: 'public/dist/epic/themes/' } ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['concat', 'copy']);

};
