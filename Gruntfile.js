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
  const jsLibs = [
    './node_modules/bootstrap-sass/assets/javascripts/bootstrap.js'
  ];
  const jsApp = [
    './components/source/js/app/*.js'
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
          'components/source/js/libs.min.js' : jsLibs,
          'components/source/js/app.min.js': [jsApp, 'components/source/_patterns/**/*.js'],
        }
      }
    },
    /******************************************************
     * COPY TASKS
    ******************************************************/
    copy: {
      main: {
        files: [
          { expand: true, cwd: path.resolve(paths().source.js), src: '**/*.js', dest: path.resolve(paths().public.js) },
          { expand: true, cwd: path.resolve(paths().source.js), src: '**/*.js.map', dest: path.resolve(paths().public.js) },
          { expand: true, cwd: path.resolve(paths().source.css), src: '**/*.css', dest: path.resolve(paths().public.css) },
          { expand: true, cwd: path.resolve(paths().source.css), src: '**/*.css.map', dest: path.resolve(paths().public.css) },
          { expand: true, cwd: path.resolve(paths().source.images), src: '**/*', dest: path.resolve(paths().public.images) },
          { expand: true, cwd: path.resolve(paths().source.fonts), src: '**/*', dest: path.resolve(paths().public.fonts) },
          { expand: true, cwd: path.resolve(paths().source.root), src: 'favicon.ico', dest: path.resolve(paths().public.root) },
          { expand: true, cwd: path.resolve(paths().source.styleguide), src: ['*', '**'], dest: path.resolve(paths().public.root) },
          // slightly inefficient to do this again - I am not a grunt glob master. someone fix
          { expand: true, flatten: true, cwd: path.resolve(paths().source.styleguide, 'styleguide', 'css', 'custom'), src: '*.css)', dest: path.resolve(paths().public.styleguide, 'css') }
        ]
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
          path.resolve(paths().source.data + '*.json'),
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
      css: path.resolve(paths().public.root + '**/*.css')
    }
  });

  /******************************************************
   * COMPOUND TASKS
  ******************************************************/

  grunt.registerTask('compile', ['sass_globbing:dev', 'sass:dist', 'uglify:dist']);
  grunt.registerTask('default', ['shell:patternlab', 'compile','copy:main']);
  grunt.registerTask('pl:watch', ['shell:patternlab', 'compile','copy:main', 'watch:all']);
  grunt.registerTask('pl:serve', ['shell:patternlab', 'compile', 'copy:main', 'browserSync', 'watch:all']);

};
