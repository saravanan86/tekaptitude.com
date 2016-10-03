// Assigning modules to local variables
var gulp = require('gulp');
var less = require('gulp-less');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var util = require('gulp-util');
var clean = require('gulp-clean');
var pkg = require('./package.json');

var PROD_FOLDER = 'www/vendor/';
var DEV_FOLDER = 'web/vendor/';
var UIB_FOLDER = 'web/uib/';
var destFolder = PROD_FOLDER;

// Set the banner content
var banner = ['/*!\n',
    ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n',
    ' */\n',
    ''
].join('');

// Default task
gulp.task('default', ['less', 'minify-css', 'minify-js', 'copy']);

// Less task to compile the less files and add the banner
gulp.task('less', function() {
    return gulp.src('less/grayscale.less')
        .pipe(less())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(gulp.dest('css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify CSS
gulp.task('minify-css', function() {
    return gulp.src('css/grayscale.css')
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify JS
gulp.task('minify-js', function() {
    return gulp.src('js/grayscale.js')
        .pipe(uglify())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('js'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Copy Bootstrap core files from node_modules to vendor directory
gulp.task('angular-bootstrap', function() {

        gulp.src(['node_modules/angular-ui-bootstrap/template/**'])
            .pipe(gulp.dest(UIB_FOLDER+'template'));

        return gulp.src(['node_modules/angular-ui-bootstrap/dist/*.js'])
            .pipe(gulp.dest(DEV_FOLDER+'angular-bootstrap'));

});

gulp.task('bootstrap', function() {

    return gulp.src(['node_modules/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
        .pipe(gulp.dest(DEV_FOLDER+'bootstrap'));

});

// Copy jQuery core files from node_modules to vendor directory
gulp.task('jquery', function() {

    return gulp.src(['node_modules/jquery/dist/jquery.js','node_modules/jquery/dist/jquery.min.js'])
            .pipe(gulp.dest(DEV_FOLDER+'jquery'));

});

gulp.task('jquery-easing', function() {

    return gulp.src(['node_modules/jquery-easing/dist/jquery*.js'])
        .pipe(gulp.dest(DEV_FOLDER+'jquery-easing'));

});

//Copy Angular files from node_modules to vendor directory
gulp.task( 'angular', function(){

    return gulp.src(['node_modules/angular/angular.js', 'node_modules/angular/angular.min.js',
                'node_modules/angular-route/angular-route.js', 'node_modules/angular-route/angular-route.min.js',
                'node_modules/angular-animate/angular-animate.js','node_modules/angular-animate/angular-animate.min.js',
                'node_modules/angular-cookies/angular-cookies.js','node_modules/angular-cookies/angular-cookies.min.js'])
            .pipe(gulp.dest(DEV_FOLDER+'angular'));

} );

// Copy Font Awesome core files from node_modules to vendor directory
gulp.task('fontawesome', function() {
    var destFolder = ( util.env.buildType == 'prod' ? PROD_FOLDER : DEV_FOLDER );
    return gulp.src([
            'node_modules/font-awesome/**',
            '!node_modules/font-awesome/**/*.map',
            '!node_modules/font-awesome/.npmignore',
            '!node_modules/font-awesome/*.txt',
            '!node_modules/font-awesome/*.md',
            '!node_modules/font-awesome/*.json'
        ])
        .pipe(gulp.dest(destFolder+'font-awesome'))
});

gulp.task( 'clean', function(  ){

    return gulp.src( util.env.buildType == 'prod' ? PROD_FOLDER : DEV_FOLDER , {read: false})
        .pipe(clean());

} );

// Copy all dependencies from node_modules
gulp.task('copy', [ 'bootstrap', 'angular-bootstrap', 'jquery', 'jquery-easing', 'fontawesome', 'angular'], function(){


});

gulp.task( 'build',['copy'] );

/*gulp.task( 'build',[ 'copy' ], function(){

});*/

// Watch Task that compiles LESS and watches for HTML or JS changes and reloads with browserSync
gulp.task('dev', ['browserSync', 'less', 'minify-css', 'minify-js'], function() {
    //gulp.watch('less/*.less', ['less']);
    //gulp.watch('css/*.css', ['minify-css']);
    //gulp.watch('js/*.js', ['minify-js']);
    // Reloads the browser whenever HTML or JS files change
    //gulp.watch('*.html', browserSync.reload);
    //gulp.watch('js/**/*.js', browserSync.reload);
});

