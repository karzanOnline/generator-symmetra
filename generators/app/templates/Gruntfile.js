/**
 * Created by 自羽 on 2017/6/29.
 */
var path = require('path'),
  fs = require('fs'),
  exec = require('child_process').exec,
  spawn = require('child_process').spawn,
  gruntConfig =require('./grunt/exec');

// a：二维数组，index，比较第几个
// return：返回保留比较后的结果组成的二维数组
function findMax(a, index) {
  var t = [];
  var b = [];
  var r = [];
  for (var i = 0; i < a.length; i++) {
    t.push(Number(a[i][index]));
  }
  var max = Math.max.apply(this, t);
  for (var i = 0; i < a.length; i++) {
    if (a[i][index] === max) {
      b.push(i);
    }
  }
  for (var i = 0; i < b.length; i++) {
    r.push(a[b[i]]);
  }
  return r;
}

// 得到最大的版本号
function getBiggestVersion(A) {
  var a = [];
  var b = [];
  var t = [];
  var r = [];
  if (!A) {
    return [0, 0, 0];
  }
  for (var i = 0; i < A.length; i++) {
    if (A[i].match(/^\d+\.\d+\.\d+$/)) {
      var sp = A[i].split('.');
      a.push([
        Number(sp[0]), Number(sp[1]), Number(sp[2])
      ]);
    }
  }

  var r = findMax(findMax(findMax(a, 0), 1), 2);
  return r[0];
}

function getBranchVersion(callback) {
  exec('git rev-parse --abbrev-ref HEAD', function (err, stdout, stderr, cb) {
    var reg = /daily\/(\S+)/,
      match = stdout.match(reg);

    if (!match) {
      console.log('当前分支为 master 或者名字不合法(daily/x.y.z)，建议切换到daily分支' +
        '\n创建新daily分支：grunt newbranch' +
        '\n只执行构建：grunt build');
      callback(stdout.trim());

    } else {
      /*
       grunt.log.write(('当前分支：' + match[1]).green);
       grunt.config.set('currentBranch', match[1]);
       */
      callback(match[1]);
    }
  });
}

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-exec');

  var task = grunt.task;

  // -------------------------------------------------------------
  // 任务配置
  // -------------------------------------------------------------

  grunt.initConfig(gruntConfig(grunt));


  grunt.registerTask('dev', '开启 Dev 开发模式', function () {
    console.log('本地开发开启');

    let done = this.async();

    let worker = spawn('npm', ['start']);

    worker.stdout.on('data', function (data) {
      grunt.log.write(data)
    });

    worker.on('error', function (error) {
      grunt.log.write(error);
      done()
    });

  });

  // 创建新分支
  grunt.registerTask('newbranch', '获取当前最大版本号,创建新的分支', function (type, msg) {
    var done = this.async();

    // 获取当前分支
    exec('git branch -a & git tag', function (err, stdout, stderr, cb) {
      var versions = stdout.match(/\d+\.\d+\.\d+/ig),
        r = getBiggestVersion(versions);
      if (!r || !versions) {
        r = '0.1.0';
      } else if (type == 'major') {
        r[0]++;
        r[1] = 0;
        r[2] = 0;
        r = r.join('.');
      } else if (type == 'minor') {
        r[1]++;
        r[2] = 0;
        r = r.join('.');
      } else {
        r[2]++;
        r = r.join('.');
      }
      grunt.log.write(('新分支：daily/' + r).green);
      grunt.config.set('currentBranch', r);
      task.run(['exec:new_branch', 'exec:npm_outdated']);
      done();
    })
  });

  // 预发布资源文件
  grunt.registerTask('prepub', '预发布', function (type, msg) {

    var done = this.async();
    // 只传入一个参数时，即为 msg
    if (type && (type !== 'nobuild') && !msg) {
      msg = type;
      type = null;
    }
    getBranchVersion(function (version) {
      grunt.log.write(('当前分支：' + version).green);
      grunt.config.set('currentBranch', version);

      if(type !== 'nobuild') {
        task.run('build');
      }
      var tasks = [
        'exec:add',
        'exec:commit:' + msg||'noMessage',
        'exec:prepub'
      ];
      task.run(tasks);
      done();
    });
  });

  // 正式发布资源文件
  grunt.registerTask('publish', '正式发布', function (msg) {
    var done = this.async();
    getBranchVersion(function (version) {
      grunt.log.write(('当前分支：' + version).green);
      grunt.config.set('currentBranch', version);
      //task.run(['exec:pull']);
      if(msg!=='nobuild') {
        task.run(['build']);
        task.run(['exec:add', 'exec:commit:' + msg]);
        task.run(['exec:prepub']);
      }
      task.run(['exec:tag', 'exec:publish']);
      done();
    })
  });

  // 默认构建任务
  grunt.registerTask('build', '默认构建流程', function (type) {
    grunt.log.write('本地构建开始'.green);

    let done = this.async();
    let worker = spawn('npm', ['run', 'build']);

    worker.stdout.on('data', function (data) {
      grunt.log.write(data)
    });

    worker.on('error', function (error) {
      grunt.log.write(error);
      done()
    });

    worker.on('exit', function () {
      done()
    });

  });

  grunt.registerTask('default', '默认构建流程', function () {
    task.run(['build']);
  });
};
