# match-file-picker

通过分析 ast 节点，筛选出项目中没有被使用到的文件，帮助开发者快速清理项目中的无效文件

## 安装

```shell
npm i (-g) match-file-picker
```

## 运行

全局环境中直接运行

```shell  
mf -d <dirname> # 查找失效文件
dm -d <dirname> # 删除空文件夹
```

就会开始解析 dirname 处的文件 或者 扫描 dirname 文件夹循环读取文件夹下的文件

## 支持配置

match-file-picker, 会读取当前文件夹下的 match-file.config.js 文件，从中获取到配置信息，并且将结果输出到控制台或者，输出到当前文件夹下的 .mf-results 文件夹中。本身是基于 @babel/core 生成的 ast 节点进行操作的，一次默认的配置如下

## 支持自动删除失效文件和空目录文件夹

- 建议在 webpack 或者类似构建工具中进行操作，删除了有效文件时，构建工具可以及时反馈信息
- 删除操作需要多次进行，没进行一次会删除掉部分依赖

```javascript
// lib/core/defaultSettings
module.exports = {
    // 匹配的文件后缀名称
    matchEsExt: [
        '.js',
        '.jsx',
        '.ts',
        '.tsx'
    ],
    matchStyleExt: [
        '.less',
        '.css',
        '.scss',
        '.sass'
    ],
    // 排除的目录名称
    excludesProName: [
        'antd',
        'react',
        'react-dom',
        'moment',
        'react-redux',
    ],
    // 路径印射关系
    aliasMappings: {

    },
    babelSetting: { // babel 解析配置
        sourceType: 'module',
        presets: [
            '@babel/preset-env',
            '@babel/preset-react',
            '@babel/preset-typescript'
        ],
        // legacy: true,
        plugins: []
    },
    // 匹配 import 为样式名的排除
    ignoresExt: [
        '.less',
        '.sass',
        '.css'
    ],
    // 包含 某种 路径的字段 忽略掉  => /src/page/
    ignorePaths: [ ],
    // 当前目录下 需要包含的目录
    moduleNames: [],
    // 跳过某个目录的筛选，会将同名的都进行过滤
    excludeModulesName: []
}
```

- matchEsExt: 会读取的 es 文件类型
- matchStyleExt: 项目中包含的 样式文件类型，会做简单的 导入分析
- excludesProName: 自动忽略的来源目录，当发现引用来自于这个配置项所包含的目录时，会跳过对这个节点数据的处理
- aliasMappings: 别名关系印射，项目中 配置的别名印射，最终会解析成绝对路径。
- babelSetting: babel 配置型，实际上就是 .babelrc 配置。不过此处默认会对 typescript 和 javascript 进行解析
- ignoresExt: 当检查到的文件后缀名包含在此项中，会跳过对这个节点数据的处理
- ignorePaths: 当检查到的文件名包含有此中的元素时，会对输出结果进行筛选
- moduleNames: 可以配置 dirname 下面的目录名，此时只会扫描配置中的文件夹下的文件
- excludeModulesName: 一些隐藏文件夹不要进行扫描
- 自定义的配置会被合并到默认配置中去

### 配置示例

```javascript
// dirname/match-file.config.js
module.exports = {
    // 排除查找的目录名称
    excludesProName: [
        '@ant-design',
        'classnames',
        'redux',
        'ali-oss',
        'lodash',
        'dva',
        'immutable'
    ],
    // 路径印射关系
    aliasMappings: {
        'components': './creams-web2/components',
        'containers': './creams-web2/containers',
        "authorities": "./creams-web2/authorities",
        "types": "./creams-web2/types",
        "reduxModel": "./creams-web2/reduxModel",
        "utils": "./creams-web2/utils",
        "constants": "./creams-web2/constants",
        "creams-ui": "./creams-web2/creams-ui",
        "souban-ui": "./creams-web2/souban-ui",
        "actions": "./creams-web2/actions",
        "listener": "./creams-web2/listener",
        "theme": "./creams-web2/theme",
        "router": "./creams-web2/router",
        "creamsTheme": "./creams-web2/theme/creams.less",
        "creams-web2": "./creams-web2",
        "creams-web2-temporary": "./creams-web2-temporary",
        "creams-web-AuditSetting": "./creams-web2/creams-web-AuditSetting",
        "creams-web-building-details": "./creams-web2/creams-web-building-details",
        "creams-web-contract": "./creams-web2/creams-web-contract",
        "@": "./src",
        "tempServices": "./src/services-temp",
        "creams-building": "./modules/creams-building/src",
        "creams-resource": "./modules/creams-resource/src",
        "creams-customer": "./modules/creams-customer/src",
        "creams-tenant": "./modules/creams-tenant/src",
        "creams-contract": "./modules/creams-contract/src",
        "creams-bill": "./modules/creams-bill/src",
        "creams-costContract": "./modules/creams-costContract/src",
        "creams-property": "./modules/creams-property/src",
        "creams-budget": "./modules/creams-budget/src",
        "creams-dataStatistics": "./modules/creams-dataStatistics/src",
        "creams-setting": "./modules/creams-setting/src",
        "creams-login": "./modules/creams-login/src",
        "creams-workflow": "./modules/creams-workflow/src",
        "creams-floor-plan": "./modules/creams-floor-plan/src",
        "creams-board": "./modules/creams-board/src",
        "creams-appStore": "./modules/creams-appStore/src",
    },
    // 当前目录下 需要包含的目录
    moduleNames: [
        'creams-web2',
        'modules',
        'src'
    ],
    ignorePaths: [
        '/src/pages/',
        '/src/rights/',
        '/index.stories.',
        '/type.d.',
        '/index.test.'
    ],
}
```

## 结果目录

```json
.
|____.mf-results
| |____results.txt
| |____total.txt
```
