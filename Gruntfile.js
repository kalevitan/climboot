/******************************************************
 * PATTERN LAB PHP
 * EDITION-PHP-DRUPL-STANDARD + GRUNT = :)
 * The grunt wrapper around patternlab-node core, providing tasks to interact with the core library and move supporting frontend assets.
******************************************************/


module.exports = function (grunt) {

  var path = require('path'),
      argv = require('minimist')(process.argv.slice(2));

  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  // Project scripts and libraries
  var jsLibs = [
    './node_modules/popper.js/dist/umd/popper.js', // req by bootstrap
    './node_modules/bootstrap/dist/js/bootstrap.js'
  ];

  /******************************************************
   * PATTERN LAB CONFIGURATION
  ******************************************************/

  //read all paths from our namespaced config file
  var config = require('./patternlab-config.json');

  function paths() {
    return config.paths;
  }


  grunt.initConfig({

    /******************************************************
     * SHELL TASKS
    ******************************************************/
    shell: {
      patternlab: {
        command: 'php '+ paths().root +'/core/console --generate'
      }
    },
    /******************************************************
     * SASS TASKS
    ******************************************************/
    sass_globbing: {
      dev: {
        files: {
          'components/source/css/partials/_base.scss' : 'components/source/_patterns/00-base/**/*.scss',
          'components/source/css/partials/_components.scss' : 'components/source/_patterns/01-components/**/*.scss',
          'components/source/css/partials/_layouts.scss' : 'components/source/_patterns/02-layouts/**/*.scss',
          'components/source/css/partials/_templates.scss' : 'components/source/_patterns/03-templates/**/*.scss',
          'components/source/css/partials/_pages.scss' : 'components/source/_patterns/04-pages/**/*.scss'
        }
      }
    },
    sass: {
      dist: {
        options: {
          sourceMap: true,
          outputStyle: 'expanded',
        },
        files: {
          'components/source/css/style.css': 'components/source/css/style.scss'
        }
      }
    },
    /******************************************************
     * JS TASKS
    ******************************************************/
    uglify: {
      dist: {
        options: {
          beautify: true,
          mangle : false,
          compress : false,
          sourceMap: true
        },
        files: {
          'components/source/js/libs/libs.min.js' : jsLibs,
          'components/source/js/app/app.min.js': 'components/source/_patterns/**/*.js'
        }
      }
    },
    /******************************************************
     * SERVER AND WATCH TASKS
    ******************************************************/
    watch: {
      all: {
        files: [
          path.resolve(paths().source.css + '**/*.css'),
          path.resolve(paths().source.styleguide + 'css/*.css'),
          path.resolve(paths().source.patterns + '**/*'),
          path.resolve(paths().source.fonts + '/*'),
          path.resolve(paths().source.images + '/*'),
          path.resolve(paths().source.data + '/*'),
          path.resolve(paths().source.js + '/*.js'),
          path.resolve(paths().source.root + '/*.ico')
        ],
        tasks: ['default', 'bsReload:css']
      }
    },
    browserSync: {
      dev: {
        options: {
          server:  path.resolve(paths().public.root),
          watchTask: true,
          watchOptions: {
            ignoreInitial: true,
            ignored: '*.html'
          },
          snippetOptions: {
            // Ignore all HTML files within the templates folder
            blacklist: ['/index.html', '/', '/?*']
          },
          plugins: [
            {
              module: 'bs-html-injector',
              options: {
                files: [path.resolve(paths().public.root + '/index.html'), path.resolve(paths().public.styleguide + '/styleguide.html')]
              }
            }
          ],
          notify: {
            styles: [
              'display: none',
              'padding: 15px',
              'font-family: sans-serif',
              'position: fixed',
              'font-size: 1em',
              'z-index: 9999',
              'bottom: 0px',
              'right: 0px',
              'border-top-left-radius: 5px',
              'background-color: #1B2032',
              'opacity: 0.4',
              'margin: 0',
              'color: white',
              'text-align: center'
            ]
          }
        }
      }
    },
    bsReload: {
      css: path.resolve(paths().public.css + '/*.css')
    }
  });

  /******************************************************
   * COMPOUND TASKS
  ******************************************************/

  grunt.registerTask('compile', ['sass_globbing:dev', 'sass:dist', 'uglify:dist']);
  grunt.registerTask('default', ['compile', 'shell:patternlab']);
  grunt.registerTask('pl:watch', ['compile', 'shell:patternlab', 'watch:all']);
  grunt.registerTask('pl:serve', ['compile', 'shell:patternlab', 'browserSync', 'watch:all']);

};
