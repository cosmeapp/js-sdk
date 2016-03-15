var path = require('path');
var cmdExtend = require('cmd-extend');
var Config = cmdExtend['Config'];


var assetsDeployPath = path.join( Config.get('server', 'online', 'rootPublic'), 'fis' );
var assetsDeployDomain = 'http://public.cosmeapp.com/fis';
var imageDeployPath = path.join( Config.get('server', 'online', 'rootStatic'), 'fis' );
var imageDeployDomain = 'http://static.cosmeapp.com/fis';
var fisUploadUrl = Config.get('server', 'online', 'fisUploadUrl');


fis.set('project.files', ['*.html', '*.md']);
fis.set('project.fileType.text', 'md');


// fis.match('*.js', {
//     useHash: true
// });

fis.match('{js/plupload/plupload.full.min.js,js/plupload/i18n/zh_CN.js,js/qiniu.js,js/m-custom.js}', {
    optimizer: fis.plugin('uglify-js'),
    useHash: true,
    useMap: true,
    packTo: '/qiniu/qiniu-js-sdk.js'
});

// 发布文件到服务器
fis.media('deploy').match('qiniu/qiniu-js-sdk.js', {
    useHash: true,
    deploy: fis.plugin('http-push', {
        receiver: fisUploadUrl,
        to: assetsDeployPath
    }),
    domain: assetsDeployDomain
});


