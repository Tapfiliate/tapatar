/*global module:false*/

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // concat
        concat: {
            options: {
                separator: ';',
            },
            dist: {
                src: ['license.txt', 'src/tapatar-source.js', 'src/sources/*.js', 'src/tapatar.js'],
                dest: 'dist/<%= pkg.codename %>.js'
            }
        },
        // Copy
        copy: {
            main: {
                files: [
                    {
                        src: 'dist/<%= pkg.codename %>.js',
                        dest: 'demo/<%= pkg.codename %>.js'
                    },
                    {
                        src: 'src/img/*',
                        dest: 'dist/img/',
                        expand: true,
                        flatten: true,
                        filter: 'isFile'
                    },
                    {
                        src: 'src/img/*',
                        dest: 'demo/img/',
                        expand: true,
                        flatten: true,
                        filter: 'isFile'
                    },
                ]
            }
        },
        // Uglify
        uglify: {
            options: {
                report: 'min'
            },
            target: {
                files: {
                    'dist/<%= pkg.codename %>.min.js': 'dist/<%= pkg.codename %>.js',
                }
            }
        },
        // LESS
        less: {
            main: {
                files: {
                    'dist/<%= pkg.codename %>.css': 'src/<%= pkg.codename %>.less',
                    'demo/<%= pkg.codename %>.css': 'src/<%= pkg.codename %>.less'
                }
            },
            min: {
                options: {
                    report: 'min',
                    cleancss: true
                },
                files: {
                    'dist/<%= pkg.codename %>.min.css': 'src/<%= pkg.codename %>.less',
                }
            }
        },
        watch: {
          scripts: {
            files: ['src/*', 'src/sources/*', 'src/img/*'],
            tasks: ['concat', 'copy', 'uglify', 'less'],
            options: {
              spawn: false,
            },
          },
        }
    });

    // Load tasks
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Default task.
    grunt.registerTask('default', [ 'concat', 'copy', 'less', 'uglify', 'watch']);
};
