### Symmetra

> 基于ant Design、dva、roadhog搭建的脚手架，目的快速搭建类商家后台项目，其中包括了在商家端体系中不断的沉淀的util(用于处理复杂场景的tools和中间层)、eslint配置、roadhog配置、webpack.config、tsconfig。

### 工具安装

mac获取权限请使用`sudo`

##### Yeoman、Grunt、Bower

    npm install -g yo grunt-cli bower

##### 3、Generator-Symmetra

    npm install -g generator-symmetra

### 初始化一个项目

在gitlab中新建项目(比如`trvale-seller-test`)，并在本地checkout出目录，进入到`trvale-seller-test`目录中，执行
    yo symmetra

根据提示完成初始化任务:

![图片描述][1]

后台项目架子初始化完成，目录结构如下：(这是暂时的架构要和@石濑对接，计划在7月中旬确定最后的目录结构)


    ├── build/
    ├── grunt/
        └── exec.js     // grunt自动化任务配置文件
    ├── Gruntfile.js
    └── src/
        ├── components/
            ├── common     // 公共组件 -> 后续将以tnpm方式模块化
            └── xxx        // 业务组件
        ├── models/        // 业务逻辑
        ├── routes/        // 路由以及入口文件
        ├── services/      // 服务api
        ├── tests/         // 测试
        ├── utils/         // 工具
        ├── index.html     // spa的html
        ├── index.jsx      // router文件
        ├── index.js       // dva入口文件
        └── index.less     // 对全局影响的less文件
    ├── .roadhogrc         // roadhog配置文件
    ├── webpack.config.js  // 用于补足roadhog的配置缺陷

### 商家后台项目本地开发及发布

在当前项目根目录下执行

1、 本地开发启动服务

    grunt dev

2、 拉取最新分支基于当前分支的最大版本号，以及(`major`、`minor`)

    grunt newbranch

3、 发布到预发支持`nobuild`

    grunt prepub:<message>

4、 发布到正式支持`nobuild`

    grunt publish:<message>

### 依赖的技术

社区开源项目：
grunt
yeoman
bower
Less

  [1]: https://img.alicdn.com/tfs/TB1mV_.SXXXXXb5XpXXXXXXXXXX-1140-1068.png