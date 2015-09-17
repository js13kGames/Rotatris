module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['src/**/*.js', 'test/**/*.js'],
      options: {
        undef: true,
        unused: true,
        browser: true,
        globals: {
          define: false,
          require: false,
          QUnit: false
        }
      }
    },
    requirejs: {
      compile: {
        options: {
          baseUrl: "src/",
          name: "../bower_components/almond/almond",
          include: ['view/app.js'],
          out: "app.js",
          optimize: 'uglify2'/*,
          generateSourceMaps: true,
          preserveLicenseComments: false,
          useSourceUrl: true          */
        }
      }
    },
    cssmin: {
      options: {
        shorthandCompacting: false,
      },
      target: {
        files: {
          'style.min.css': ['style.css']
        }
      }
    },
    compress: {
      main: {
        options: {
          archive: 'submission.zip'
        },
        files: [
          { src: ['app.js', 'style.min.css', 'index.html'], dest: '.' }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.registerTask('default', ['jshint', 'requirejs', 'cssmin', 'compress']);

};
