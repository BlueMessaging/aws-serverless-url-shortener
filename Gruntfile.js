/**
 * Created by jluna on 05/03/2015.
 */
module.exports = function(grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Project configuration.
    grunt.initConfig({

        clean: {
            options: {
                force: true
            },
            files: ['dist/**/*']
        },

        pkg: grunt.file.readJSON('package.json'),
        revision: {
            options: {
                property: 'meta.revision',
                ref: 'HEAD',
                short: true
            }
        },
        copy: {
            default: {
                files: [{
                    expand: true,
                    cwd: './',
                    src: [
                        '**/*.js',
                        '**/*.json',
                        '!admin.js',
                        '!**/Gruntfile.json',
                        '!**/*grunt*/**/*.*'
                    ],
                    dest: 'dist/'
                }]
            },
            admin: {
                files: [{
                    expand: true,
                    cwd: './',
                    src: [
                        '**/*.js',
                        '**/*.json',
                        '!index.js',
                        '!**/Gruntfile.json',
                        '!**/*grunt*/**/*.*',
                        '!**/*random*/**/*.*'
                    ],
                    dest: 'dist/'
                }]
            }
        },
        compress: {
            default: {
                options: {
                    archive: 'dist/url-shortener.zip'
                },
                files: [
                    {cwd: 'dist/', src: ['**/*', '!**/url-shortener.zip'], dest: '/'}
                ]
            },
            admin: {
                options: {
                    archive: 'dist/admin-url-shortener.zip'
                },
                files: [
                    {cwd: 'dist/', src: ['**/*', '!**/*zip'], dest: '/'}
                ]
            }
        }
    });

    grunt.registerTask('build', ['clean',  'copy', 'compress']);
    grunt.registerTask('build:admin', ['clean',  'copy:admin', 'compress']);

};
