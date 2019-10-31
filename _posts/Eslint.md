## 为Vue项目上Eslint进行前端代码规范


之前前端团队中实习生出现过几次比较低级的bug，并且项目体积上来后代码质量堪忧，项目维护起来复杂度高了很多，于是决定引入eslint进行代码规范。

之前使用过vscode的eslint插件来进行代码检查和自动格式化，感觉体验一般，特别是团队中各种编辑器都有，根本无法统一，于是使用下面方式：

### 根目录创建eslintrc.js文件，添加eslint规则
下面是示例：
```
module.exports = {
    env: {
        browser: true,
        es6: true
    },
    extends: ['eslint:recommended', 'plugin:vue/essential'],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
    },
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module'
    },
    plugins: ['vue'],
    rules: {
        indent: ['error', 4], // 4格缩进
        'linebreak-style': ['error', 'unix'], // unix换行
        quotes: ['error', 'single'], // 字符串使用单引号
        semi: ['error', 'never'], // 句末不使用分号
        'dot-notation': 0, // 点表达式
        'no-return-assign': 0, // 箭头函数可以省略大括号
        'vue/no-unused-vars': 0, // 变量定义未使用
        'no-unused-vars': 0, // 变量定义未使用
        'no-empty': 0, // 空代码块
        'no-undef': 0, // 未定义变量
        'no-prototype-builtins': 0, // 禁止直接使用 Object.prototypes 的内置属性
        'vue/no-side-effects-in-computed-properties': 0, // 计算属性里直接修改data里面的值 =====1
        'vue/no-parsing-error': 0, // iview 组件标签
        'vue/require-prop-type-constructor': 0, // 会修改代码，不能使用
        'vue/no-use-v-if-with-v-for': 0, // v-if v-for同时使用
        'vue/require-v-for-key': 1, // v-for的时候给个key
        'no-constant-condition': 1, // if的条件里面不直接使用常量
    }
}

```


### 安装eslint相关依赖

在package.json中添加如下依赖：
```
"eslint": "^6.5.1",
"eslint-config-standard": "^14.1.0",
"eslint-friendly-formatter": "^4.0.1",
"eslint-loader": "^3.0.2",
"eslint-plugin-import": "^2.18.2",
"eslint-plugin-node": "^10.0.0",
"eslint-plugin-promise": "^4.2.1",
"eslint-plugin-standard": "^4.0.1",
"eslint-plugin-vue": "^5.2.3",
```
然后执行
```
npm install
```

### 将eslint加入webpack配置中

在webpack.base.config.js中加入如下规则：

```
{
    test: /\.(js|vue)$/,
    loader: 'eslint-loader',
    enforce: 'pre',
    include: [path.resolve(__dirname, 'src')], // 指定检查的目录
    options: { // 这里的配置项参数将会被传递到 eslint 的 CLIEngine
        formatter: require('eslint-friendly-formatter') // 指定错误报告的格式规范
    }
},
```
然后执行
```
npm run dev
```
可以看到终端将所有不符合eslint规则的代码段抛了出来，可以执行下面命令对一些简单格式错误通过下面命令自动格式化：
```
find src |egrep '\.(vue|js)$'|xargs ./node_modules/eslint/bin/eslint.js --fix
```

这样eslint就成功加入到项目啦。
