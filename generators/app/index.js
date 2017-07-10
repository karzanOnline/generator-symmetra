// /generators/app/index.js

// 创建 yeoman generator 的核心功能模块.
const Generator = require('yeoman-generator');

// 文件读写模块.
const fs = require('fs');
// 路径模块
const path = require('path');
const inquirer = require('inquirer');
const mkdirp = require('mkdirp').sync;
const util = require('util');
const colors = require('colors');
const shell = require('shelljs');
const pwd = process.cwd();


module.exports = class extends Generator {

    /** 构造函数 */
    constructor(args, opts) {
        // 继承必须.
        super(args, opts);

        // 获取 AppName，使用路径尾.
        this.appName = path.basename(process.cwd());
        // 设置 Author.
        this.appAuthor = "ziyu";
    }

    /**
     * 初始化方法.
     */
    initializing() {
        this.log("symmetra开始构建项目...");
        let done = this.async();

        this.pkg = require('../../package.json');

        let pkgJSON = {};
        try {
            pkgJSON = require(path.resolve(process.cwd(), 'package.json'));
        } catch (e) {

        }
        if (!pkgJSON.author || typeof pkgJSON.author == 'string') {
            let gitUser = this.user.git;
            if (pkgJSON.author) {
                let parts = /(.*)<(.*)\>/g.exec(pkgJSON.author);
                if (parts) {
                    pkgJSON.author = {
                        name: (parts[1] || '').trim(),
                        email: (parts[2] || '').trim()
                    };
                }
            } else {
                pkgJSON.author = {
                    name: gitUser.name() || '',
                    email: gitUser.email() || ''
                };
            }
        }
        if (!pkgJSON.name) {
            pkgJSON.name = 'tmp';
        }
        this.pkgJSON = pkgJSON;
        done();
    }

    /**
     * prompt users for options
     */
    prompting () {
        let done = this.async();
        console.log('********prompting*********');

        let pkgJSON = this.pkgJSON;

        // have Yeoman greet the user.
        // console.log(this.yeoman);
        let folderName = path.basename(process.cwd());

        let prompts = [
            {
                name: 'projectName',
                message: '项目名',
                default: folderName,
                validate: function (input) {
                    return !!input.trim() || '请输入项目名!';
                }
            },
            {
                name: 'projectDesc',
                message: '项目描述',
                default: function (answers) {
                    return answers.projectName || folderName;
                },
                validate: function (input) {
                    return !!input.trim() || '请输入项目描述!';
                }
            },
            {
                name: 'author',
                message: '作者名(花名)',
                default: pkgJSON.author.name
            },
            {
                name: 'email',
                message: '作者 Email',
                default: pkgJSON.author.email,
                validate: function (input) {
                    return /^.+@.+\..+$/.test(input.trim()) || '请输入合法的 Email 地址!';
                }
            },
            {
                name: 'groupName',
                message: '项目所在 Gitlab 分组',
                default: 'trip',
                validate: function (input) {
                    return !!input.trim() || '请输入分组名!';
                }
            },
            {
                name: 'version',
                message: '初始版本号',
                default: '0.1.0',
                validate: function (input) {
                    return /^\d+\.\d+\.\d+$/.test(input.trim()) || '请输入合法的版本号!';
                }
            },
            {
                name: 'createDir',
                message: '是否创建目录',
                type: 'confirm',
                default: function (answers) {
                    // 如果项目名就是目录名, 认为在当前目录下创建项目, 不需要创建目录
                    return answers.projectName != folderName;
                }
            },
            {
                name: 'npm_install',
                message: '是否自动执行' + ' tnpm i'.yellow + ' 以安装依赖',
                type: 'confirm',
                default: true
            }
        ];
        /*
         * projectName：驼峰名称,比如 ProjectName
         * packageName：原目录名称，比如 project-name
         **/
        inquirer.prompt(prompts, function (answer) {
            this.projectName = answer.projectName;// project-name

            // this.projectComponentName = parseMojoName(this.projectName); //ProjectName
            this.projectDesc = answer.projectDesc;
            this.author = answer.author;
            this.email = answer.email;
            this.version = answer.version;
            this.groupName = answer.groupName;
            this.currentBranch = 'master';
            this.npm_install = answer.npm_install;

            if (answer.createDir) {
                // 如果需要创建目录
                mkdirp(this.projectName);
                this.destinationRoot(path.join(pwd, this.projectName));
            }

            let date = new Date();
            this.date = [date.getFullYear(), (date.getMonth() + 1), date.getDate()].join('-');
            done();

        }.bind(this));
    }


    /**
     * 写入配置
     */
    configuring() {
        this.log('写入配置...')

        // 获取 package 配置模板.
        let defaultSettings = this.fs.readJSON( this.templatePath('package.json') );
        // 做新 package 配置文件.
        let packageSettings = {
            name: this.appName,
            private: true,
            version: '0.0.1',
            description: `${this.appName} - Generated by generator-symmetra`,
            main: 'index.js',
            scripts: defaultSettings.scripts,
            repository: defaultSettings.repository,
            keywords: [],
            author: this.appAuthor,
            devDependencies: defaultSettings.devDependencies,
            dependencies: defaultSettings.dependencies
        };

        // 写入 package.json.
        this.fs.writeJSON(this.destinationPath('package.json'), packageSettings);
        this.log('写入配置done~~~')
    }

    /**
     * 写入文件
     */
    writing() {

        // 创建 build 空目录.
        fs.mkdirSync('build');
        /* 拷贝所需的文件. */

        this.fs.copy(
            this.templatePath("src"),
            this.destinationPath("src")
        );
        this.fs.copy(
            this.templatePath("grunt"),
            this.destinationPath("grunt")
        );
        this.fs.copy(
            this.templatePath("gitignore_tmpl"),
            this.destinationPath(".gitignore")
        );
        this.fs.copy(
            this.templatePath("webpack.config.js"),
            this.destinationPath("webpack.config.js")
        );
        this.fs.copy(
            this.templatePath("roadhogrc_tmpl"),
            this.destinationPath(".roadhogrc")
        );
        this.fs.copy(
            this.templatePath("Gruntfile.js"),
            this.destinationPath("Gruntfile.js")
        );

    }

    /**
     * 安装方法
     */
    install() {
        // 安装 package 安装.
        // this.installDependencies({ bower: false });
        console.log('\n>> Install bower & npm Dependencies.'.blue);

        // bower install
        this.bowerInstall('', function () {
            console.log('\n>> Bower dependencies installed.\n'.green);
        });

        // tnpm install
        if (!shell.which('tnpm')) {
            console.log('No tnpm found, to be installed...'.yellow);
            shell.exec('npm install -g tnpm --registry=http://registry.npm.alibaba-inc.com');
        }
        if (this.npm_install) {
            this.runInstall('tnpm', '', function () {
                console.log('\n>> Npm dependencies installed.\n'.green);
            });
        } else {
            console.log('\n>> Please manually run "tnpm i" before `grunt`\n'.yellow);
        }

    }

};