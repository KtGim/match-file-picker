module.exports = (function() {
    let instance = null;
    const initConfigs = function () {
        return {
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
                    '@babel/preset-react'
                ],
                plugins: [
                    ['@babel/plugin-transform-runtime', { corejs: 3, helpers: true, regenerator: true }],
                    ['@babel/plugin-proposal-decorators', { legacy: true }],
                    ['@babel/plugin-proposal-class-properties', { loose: true }]
                ]
            },
            // 匹配 import 为样式名的排除
            ignoresExt: [],
            // 包含 某种 路径的字段 忽略掉  => /src/page/
            ignorePaths: [
                
            ],
            // 当前目录下 需要包含的目录
            moduleNames: [],
            // 去除某个子目录
            excludeModulesName: [],
            rootContainer: {}, // 保存解析后的数据信息
            inquirerOptions: { // 结果输出方式
                outputType: false,
            }
        }
    }
    return {
        getInstance() {
            if (!instance) {
                instance = initConfigs();
            }
            return instance;
        }
    };
}())