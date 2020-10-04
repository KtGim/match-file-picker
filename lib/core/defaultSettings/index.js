module.exports = (function() {
    let instance = null;
    const initConfigs = function () {
        return {
            // 匹配的文件后缀名称
            matchFileExt: [
                '.js',
                '.jsx',
                '.ts',
                '.tsx'
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
            ignorePaths: [
                
            ],
            // 当前目录下 需要包含的目录
            moduleNames: [],
            rootContainer: {}, // 保存解析后的数据信息
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