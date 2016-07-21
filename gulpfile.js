'use strict';

var _ = require('lodash');
var gulp = require('gulp');
var del = require('del');
var merge = require('merge-stream');
var rename = require('gulp-rename');
var svgSprite = require('gulp-svg-sprite');
var svg2png = require('gulp-svg2png');
var cheerio = require('gulp-cheerio');
var path = require('path');
var svgmin = require('gulp-svgmin');
var sprity = require('sprity');
var iconfont = require('gulp-iconfont');
var iconfontCss = require('gulp-iconfont-css');

var runTimestamp = Math.round(Date.now()/1000);

var config = require('./config.json');

/** Android */
const ANDROID = [
    {
        name: 'mdpi',
        multiplier: 1
    },
    {
        name: 'hdpi',
        multiplier: 1.5
    },
    {
        name: 'xhdpi',
        multiplier: 2
    },
    {
        name: 'xxhdpi',
        multiplier: 3
    },
    {
        name: 'xxxhdpi',
        multiplier: 4
    }
];

/**
 * Generates PNG sprites and their corresponding CSS files and places them in sprites/png-sprite.
 *
 */
gulp.task('png-sprite', ['png-sprite:png'], function() {

    del([
        './public/sprites/png-sprite',
    ]);

    return _.map(config.colors, function(color) {
        return sprity.src({
            src: './.tmp/png-sprite/png/' + color.name + '/*.png',
            style: './png-icon.css',
            name: 'png-icon' + (color.name !== '' ? '-' + color.name : ''),
            orientation: 'binary-tree',
            prefix: (color.name !== '' ? 'png-icon--' + color.name: 'png-icon'),
            'style-indent-char': 'tab',
            'style-indent-size': 1,
            template: './resources/templates/png-sprite/css.hbs',
            dimension: [{
              ratio: 1,
              dpi: 72
            }, {
              ratio: 2,
              dpi: 192
            }]
        })
        .pipe(gulp.dest('./public/sprites/png-sprite'));
    });
});

gulp.task('png-sprite:png', ['png-sprite:svg'], function() {

    del([
        './.tmp/png-sprite/png',
    ]);

    return gulp.src('./.tmp/png-sprite/svg/**/*.svg')
        .pipe(svg2png(2, true, 1))
        .pipe(gulp.dest('.tmp/png-sprite/png'));
});

gulp.task('png-sprite:svg', function() {

    del([
        './.tmp/png-sprite/svg',
    ]);

    return _(config.colors)
        .map(function(color) {
            return gulp.src('./resources/icons/*.svg')
                .pipe(cheerio({
                    run: function($, file) {
                        $('svg').attr('fill', color.color);
                    }
                }))
                .pipe(rename(function(path) {
                    path.dirname = color.name;
                    return path;
                }));
        })
        .thru(merge)
        .value()
        .pipe(gulp.dest('.tmp/png-sprite/svg'));
});

/**
 * Generates CSS and Symbol-based SVG sprites,
 * and places them in `sprites/svg-sprite`.
 */
gulp.task('svg-sprite', [], function() {

    del([
        './public/sprites/svg-sprite',
    ]);

    gulp.src('./resources/icons/*.svg')
        .pipe(svgSprite({
            log: true,
            shape: {
                dimension: {
                    maxWidth: 24,
                    maxHeight: 24
                }
            },
            mode: {
                css: {
                    bust: false,
                    dest: './',
                    prefix: '%s',
                    sprite: './svg-icon.svg',
                    example: {
                        dest: './svg-icon.html'
                    },
                    render: {
                        css: {
                            dest: './svg-icon.css'
                        }
                    }
                },
                symbol: {
                    bust: false,
                    dest: './',
                    prefix: '%s',
                    sprite: './svg-icon-symbol.svg',
                    example: {
                        dest: './svg-icon-symbol.html'
                    }
                }
            }
        }))
        .pipe(gulp.dest('./public/sprites/svg-sprite/'));
});

/**
 * Generates imagesets for iOS development
 * and places them in `ios`.
 */
gulp.task('ios', ['ios:svg'], function() {

    del([
        './public/ios',
    ]);

    _([1, 2, 3])
        .map(function(multiplier) {
            return _(config.sizes)
                .map(function(size) {
                    return gulp.src('./.tmp/ios/svg/*.svg')
                        .pipe(svg2png(size/config.size*multiplier, true, 1))
                        .pipe(rename(function(path) {
                            path.dirname = path.basename + ((size !== config.size) ? '_' + size + 'pt' : '') + '.imageset';
                            path.basename += (multiplier > 1) ? '@' + multiplier + 'x' : '';
                            return path;
                        }))
                })
                .thru(merge)
                .value();
        })
        .thru(merge)
        .value()
        .pipe(gulp.dest('./public/ios'));

});

gulp.task('ios:svg', function() {

    del([
        './.tmp/ios/svg',
    ]);

    return _(config.colors)
        .map(function(color) {
            return gulp.src('./resources/icons/*.svg')
                .pipe(cheerio({
                    run: function($, file) {
                        $('svg').attr('fill', color.color);
                    }
                }))
                .pipe(rename(function(path) {
                    path.basename += (color.name !== '') ? '_' + color.name : '';
                    return path;
                }));
        })
        .thru(merge)
        .value()
        .pipe(gulp.dest('.tmp/ios/svg'));
});

/**
 * Generates assets for Android (drawable)
 */
gulp.task('android', ['android:svg'], function() {

    _(ANDROID).forEach(function(drawable) {
        del(['./public/drawable-' + drawable.name]);
    });

    _(ANDROID)
        .map(function(drawable) {
            return _(config.sizes)
                .map(function(size) {
                    return gulp.src('./.tmp/android/svg/*.svg')
                        .pipe(svg2png(size/config.size*drawable.multiplier, true, 1))
                        .pipe(rename(function(path) {
                            path.dirname = 'drawable-' + drawable.name;
                            path.basename += '_' + size + 'dp';
                            return path;
                        }))
                })
                .thru(merge)
                .value();
        })
        .thru(merge)
        .value()
        .pipe(gulp.dest('./public'));

});

gulp.task('android:svg', [], function() {

    del([
        './.tmp/android/svg',
    ]);

    return _(config.colors)
        .map(function(color) {
            return gulp.src('./resources/icons/*.svg')
                .pipe(cheerio({
                    run: function($, file) {
                        $('svg').attr('fill', color.color);
                    }
                }))
                .pipe(rename(function(path) {
                    path.basename += (color.name !== '') ? '_' + color.name : '';
                    return path;
                }));
        })
        .thru(merge)
        .value()
        .pipe(gulp.dest('.tmp/android/svg'));

});

/**
 * Generates simple assets for web
 */
gulp.task('web', ['web:svg'], function() {

    del([
        './public/1x_web',
        './public/2x_web'
    ]);

    _([1, 2])
        .map(function(multiplier) {
            return _(config.sizes)
                .map(function(size) {
                    return gulp.src('./.tmp/web/svg/*.svg')
                        .pipe(svg2png(size/config.size*multiplier, true, 1))
                        .pipe(rename(function(path) {
                            path.dirname = multiplier + 'x_web';
                            path.basename += '_' + size + 'dp';
                            return path;
                        }))
                })
                .thru(merge)
                .value();
        })
        .thru(merge)
        .value()
        .pipe(gulp.dest('./public'));

});

gulp.task('web:svg', [], function() {

    del([
        './.tmp/web/svg',
    ]);

    return _(config.colors)
        .map(function(color) {
            return gulp.src('./resources/icons/*.svg')
                .pipe(cheerio({
                    run: function($, file) {
                        $('svg').attr('fill', color.color);
                    }
                }))
                .pipe(rename(function(path) {
                    path.basename += (color.name !== '') ? '_' + color.name : '';
                    return path;
                }));
        })
        .thru(merge)
        .value()
        .pipe(gulp.dest('.tmp/web/svg'));

});

/**
 * Copy original svg files to the svg/design directory, and create a minified version in the svg/production directory
 */
gulp.task('svg', function() {

     del([
         './public/svg'
     ]);

     _(config.colors)
         .map(function(color) {
             return gulp.src('./resources/icons/*.svg')
                 .pipe(cheerio({
                     run: function($, file) {
                         $('svg').attr('fill', color.color);
                     }
                 }))
                 .pipe(rename(function(path) {
                     path.basename += (color.name !== '') ? '_' + color.name : '';
                     return path;
                 }));
         })
         .thru(merge)
         .value()
         .pipe(svgmin())
         .pipe(gulp.dest('./public/svg/production'));

     return gulp.src('./resources/icons/*.svg')
         .pipe(gulp.dest('./public/svg/design'))

});

/**
 * Generate an iconfont
 */
gulp.task('font', function() {

    del([
        './public/font'
    ]);

    return gulp.src('./resources/icons/*.svg')
        .pipe(rename(function(path) {
            path.basename = path.basename.replace('ic_', '').replace('_', '-');
            return path;
        }))
        .pipe(iconfontCss({
            fontName: 'ic',
            path: './resources/templates/font/ic.css',
            targetPath: 'ic.css',
            cssClass: 'ic'
        }))
        .pipe(iconfont({
            fontName: 'ic',
            appendUnicode: true,
            formats: ['svg', 'ttf', 'eot', 'woff', 'woff2'],
            timestamp: runTimestamp,
        }))
        .pipe(gulp.dest('./public/font'));
});

gulp.task('default', ['png-sprite', 'svg-sprite', 'web', 'ios', 'android', 'font'], function() {

});
