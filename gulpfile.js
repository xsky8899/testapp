var gulp = require('gulp');
var gutil = require('gulp-util');
var chalk = require('chalk');
var fs=require('fs');
var _=require('underscore');
var path = require('path');
var amdOptimize = require('amd-optimize');
var concat = require('gulp-concat');
var rimraf = require('gulp-rimraf');
var uglify = require('gulp-uglify');
var through2 = require('through2');
var ejs = require('gulp-ejs');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var runSequence = require('run-sequence');
var zip = require('gulp-zip');

var pkg = require('./package.json');
var BUILD_TIMESTAMP = gutil.date(new Date(), 'yyyymmddHHMMss');
pkg.build = BUILD_TIMESTAMP;

// 设置默认工作目录为./www
process.chdir('www');

// 获取env
var argv = process.argv.slice(2);
env = 'TEST';

(function() {
    if((envIndex = argv.indexOf('-env'))!=-1) {
        env = argv[envIndex+1];
    }
})();

gutil.log(
    'Working directory :',
    chalk.magenta(__dirname + '/www')
);

var paths = {
    src:'.',
    dest:'../dist',
    output:'../output',
    templates:'../templates'
}

var handleEnv = function () {
    return through2.obj(function(file, enc, cb) {
        return cb(null, file);
    });
}

/*
* 清空目标工程目录
*/
gulp.task('clean', function() {
    return gulp.src(paths.dest+'/*', { read: false })
        .pipe(rimraf({ force: true }));
});

/**
 * 清空dist目录不必要文件
 */
gulp.task('cleanDist', function() {
    return gulp.src([paths.dest+'/less', paths.dest+'/src'])
        .pipe(rimraf({ force: true}));
});

/*
* 拷贝文件到目标工程目录
*/
gulp.task('copy', function() {
    return gulp.src([
        paths.src+'/**/*',
        '!'+paths.src+'/less',
        '!'+paths.src+'/web-server.js'
    ])
    .pipe(handleEnv())
    .pipe(gulp.dest(paths.dest));
});

/*
* 拷贝源文件文件到目标工程目录
*/
gulp.task('source', function() {_
    return gulp.src(paths.src+'/js/**/*.js')
        .pipe(gulp.dest(paths.dest+'/src/js'));
});
/*
* 编译ejs页面
*/
gulp.task('ejs',function() {
  console.log(pkg.version,BUILD_TIMESTAMP)
    return gulp.src([paths.templates + '/**/*.ejs','!' + paths.templates + '/include/**/*.ejs'])
        .pipe(ejs({
            ctx: '',
            _build: {
                pkg: pkg,
                version: pkg.version,
                ts: BUILD_TIMESTAMP
            },
            data:{},
            delimiter:'@'
    }, {
        root:__dirname+'/templates'
    }))
    .pipe(gulp.dest('.',{cwd:paths.dest}));
})

/*
* 编译less
*/
gulp.task('less', function () {
    return gulp.src(paths.src+'/less/*.less')
        .pipe(less({
            paths: [ path.join(__dirname, 'less', 'include') ]
        }))
        .pipe(minifyCSS())
        .pipe(gulp.dest(paths.src+'/css'));
});

/*
* 编译压缩css
*/
gulp.task('minifycss', function () {
    return gulp.src(paths.src+'/css/**/*.css')
        .pipe(minifyCSS())
        .pipe(gulp.dest(paths.dest+'/css'));
});

/*
* 编译压缩js
*/
gulp.task('uglifyjs', function () {
    return gulp.src([
            paths.dest+'/js*/**/*.js',
            paths.dest+'/libs*/config.js'
        ])
        .pipe(handleEnv())
        .pipe(uglify({output:{max_line_len:120}}).on('error',gutil.log))
        .pipe(gulp.dest(paths.dest));
});

/*
* require js 优化
*/
gulp.task('js_optimize', function() {
    // 优化common
    gulp.src(paths.src+'/js/**/*.js')
        .pipe(amdOptimize('C', {
            configFile : paths.src+'/libs/config.js',
            exclude:['zepto','underscore','swipe','fastclick']
        }))
        .pipe(handleEnv())
        // 合并
        .pipe(concat('common.js'))
        .pipe(uglify().on('error',gutil.log))
        // 输出
        .pipe(gulp.dest(paths.dest+'/js/common'));

    // 优化zepto
    gulp.src(paths.src+'/libs/**/*.js')
        .pipe(amdOptimize('zepto', {
            configFile : paths.src+'/libs/config.js'
        }))
        // 合并
        .pipe(concat('zepto.js'))
        .pipe(uglify().on('error',gutil.log))
        // 输出
        .pipe(gulp.dest(paths.dest+'/libs'));
});

/*
* 打包zip
*/
gulp.task('archive', function () {
    return gulp.src(paths.dest+'/**/*')
        .pipe(zip(pkg.name + '_v_' + pkg.version.replace(/\./g,'_') + '_' + env.toLowerCase() + '_'+BUILD_TIMESTAMP+'.zip'))
        .pipe(gulp.dest(paths.output));
});

gulp.task('watch', function() {
    gulp.watch(paths.src+'/less/**/*.less', ['less']);
});

/*
* 开始构建
*/
gulp.task('build', function (callback) {
    runSequence(
        'clean',
        'copy',
        'ejs',
        'source',
        'js_optimize',
        'uglifyjs',
        'less',
        'minifycss',
        'cleanDist',
        'archive',
        function (error) {
            if (error) {
                console.log(error.message);
            } else {
                console.log('RELEASE FINISHED SUCCESSFULLY');
            }
            callback(error);
        });
});
