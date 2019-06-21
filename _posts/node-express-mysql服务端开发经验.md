---
title: node+express框架中连接使用mysql经验总结
date: 2018-11-03 11:18:55
tags: node
---
最近在学习node.js，做了一个练手项目，使用node.js+express框架，配合mysql数据库和前端vue框架开发一个多人文档编辑系统。

[node.js环境下express+mysql的服务端项目示例](https://github.com/lihao336991/node-express-mysql)
<hr/>

首先是环境搭建：

node环境下
    
    $ npm install -g express-generator
    $ express -e project
<!--more-->

进入项目文件根目录安装依赖模块

    $ npm install
    $ DEBUG=node-blog:* npm start
看看项目目录都有什么

![](https://user-gold-cdn.xitu.io/2018/11/8/166f27bb357d70b7?w=208&h=391&f=png&s=17022)


看看生成的工程目录里面都有什么，

**bin：存放可执行文件**

**node_modules：存放 package.json 中安装的模块，当你在 package.json 添加依赖的模块并安装后，存放在这个文件夹下**

**public：存放 image、css、js 等前端资源文件**

**routes：存放路由文件**

**views：存放视图文件或者说模版文件**

**app.js：启动文件，或者说入口文件**

**package.json：存储着工程的信息及模块依赖，当在 dependencies 中添加依赖的模块时，运行npm install ，npm 会检查当前目录下的**

**package.json，并自动安装所有指定的模块**

下面开始安装数据库，这里我选择的是mysql。

    npm install mysql --save-dev

安装完毕之后，开始配置数据库。

```
//mysql配置文件
mysql = {

        host: "xx.xxx.xx.xxx", //这是数据库的地址

        user: "xxx", //需要用户的名字

        password: "xxx", //用户密码 ，如果你没有密码，直接双引号就是

        database: "xxx" //数据库名字

    } //好了，这样我们就能连接数据库了
    
    module.exports = mysql; //用module.exports暴露出这个接口，
```
mysql连接池配置：
```
//mysql连接池配置文件
var mysql = require('mysql');
var $dbConfig = require('../config/mysql');//注意改成自己项目中mysql配置文件的路径

// 使用连接池，避免开太多的线程，提升性能
var pool = mysql.createPool($dbConfig);

/**
 * 对query执行的结果自定义返回JSON结果
 */
function responseDoReturn(res, result, resultJSON) {
    if (typeof result === 'undefined') {
        res.json({
            code: '201',
            msg: 'failed to do'
        });
    } else {
        res.json(result);
    }
};

/**
 * 封装query之sql带不占位符func
 */
function query(sql, callback) {
    pool.getConnection(function(err, connection) {
        connection.query(sql, function(err, rows) {
            callback(err, rows);
            //释放链接
            connection.release();
        });
    });
}

/**
 * 封装query之sql带占位符func
 */
function queryArgs(sql, args, callback) {
    pool.getConnection(function(err, connection) {
        connection.query(sql, args, function(err, rows) {
            callback(err, rows);
            //释放链接
            connection.release();
        });
    });
}

//exports
module.exports = {
    query: query,
    queryArgs: queryArgs,
    doReturn: responseDoReturn
}
```

操作数据库的过程比较灵活，我是使用模块化的思想，将一张数据表封装成一个模块暴露出去，通过该模块获取这张表的增删改查SQL语句。下面贴上示例代码：
```
let express = require('express');
let mysql = require('../common/basicConnection');

let qibu_task = {
    index: '',
    value: '',
    list: `SELECT * from qibu_task;`, //列表查询
    insert(args) {
        qibu_task.index = '';
        qibu_task.value = '';
        args = filter(['id', 'task', 'name', 'created_at'], args)
        for (let key in args) {
            qibu_task.index = `${qibu_task.index}${key},`
            let re = /^[0-9]+.?[0-9]*/;
            if (re.test(args[key])) {
                qibu_task.value = `${qibu_task.value}${args[key]},`
            } else {
                qibu_task.value = `${qibu_task.value}'${args[key]}',`
            }
        }
        qibu_task.index = qibu_task.index.substr(0, qibu_task.index.length - 1);
        qibu_task.value = qibu_task.value.substr(0, qibu_task.value.length - 1);

        return `INSERT INTO qibu_task (${qibu_task.index}) VALUES(${qibu_task.value})`;
    }, //按需增加
    select(index, value) {
        return `SELECT * from qibu_task where ${index}=${value};` //按需查询
    },
    delete(index, value) {
        return `DELETE from qibu_task where ${index}=${value};` //按需删除
    },
    update(index, args) { //提交修改
        if (index in args) {
            qibu_task.value = '';
            args = filter(['id', 'task', 'name', 'created_at'], args)
            for (let key in args) {
                let re = /^[0-9]+.?[0-9]*/;
                if (re.test(args[key])) {
                    qibu_task.value = `${qibu_task.value}${key}=${args[key]},`
                } else {
                    qibu_task.value = `${qibu_task.value}${key}='${args[key]}',`
                }
            }
            qibu_task.value = qibu_task.value.substr(0, qibu_task.value.length - 1)
            return `UPDATE qibu_task SET ${qibu_task.value} WHERE ${index}=${args[index]};`
        }
    },
};
//参数过滤
function filter(arguments, obj) {
    let newObj = {}
    arguments.forEach(every => {
        if (every in obj) {
            newObj[every] = obj[every]
        }
    });
    return newObj;
};
module.exports = qibu_task;
```
然后就可以在路由返回时进行数据库操作啦。具体代码就不贴啦。路由可以识别get、post方法，修改和删除通过传递参数模拟。

## 更新
项目中觉得对每张数据表单独写增删改查语句效率太低，所以对数据表SQL语句生成的过程进行了一些修改，通过构造函数构造出DBSQL类来生成想要的数据表的SQL语句，在路由中new一个DBSQL实例即可，具体代码已经上传github。


<hr/>
到这里整个服务端配置就差不多了。除此之外，项目还有socket.io的使用，就另外再说吧。下面贴上github地址，观众老爷们走过路过赏个start呗^.^

[node.js环境下express+mysql的服务端项目示例](https://github.com/lihao336991/node-express-mysql)
