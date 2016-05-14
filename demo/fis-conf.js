var path = require('path');
// var cmdExtend = require('cmd-extend');
// var Config = cmdExtend['Config'];
var fd   = require('cmd-extend')['fd'];


// var assetsDeployPath = path.join( Config.get('server', 'online', 'rootPublic'), 'fis' );
// var assetsDeployDomain = 'http://public.cosmeapp.com/fis';
// var imageDeployPath = path.join( Config.get('server', 'online', 'rootStatic'), 'fis' );
// var imageDeployDomain = 'http://static.cosmeapp.com/fis';
// var fisUploadUrl = Config.get('server', 'online', 'fisUploadUrl');


fis.set('project.files', ['*.html', '*.md']);
fis.set('project.fileType.text', 'md');


// fis.match('*.js', {
//     useHash: true
// });

// fis.match('{js/plupload/plupload.full.min.js,js/plupload/i18n/zh_CN.js,js/qiniu.js,js/m-custom.js}', {
//     optimizer: fis.plugin('uglify-js'),
//     useHash: true,
//     useMap: true,
//     packTo: '/qiniu/qiniu-js-sdk.js'
// });

// // 发布文件到服务器
// fis.media('deploy').match('qiniu/qiniu-js-sdk.js', {
//     useHash: true,
//     deploy: fis.plugin('http-push', {
//         receiver: fisUploadUrl,
//         to: assetsDeployPath
//     }),
//     domain: assetsDeployDomain
// });


var qiniuVersionJs = '/qiniu-upfile/0.0.6/qiniu-upfile.js';
var qiniuVersionCss = '/qiniu-upfile/0.0.6/qiniu-upfile.css';

fis
    .media('qiniu-upfile')
    .match('qiniu-upfile.js', {
        optimizer: fis.plugin('uglify-js'),
        packTo: qiniuVersionJs
    })
    .match(qiniuVersionJs, {
        deploy: [
            fis.plugin('local-deliver', {
                to: fd['pathLocalCdns']
            }),
            // fis.plugin('local-deliver', {
            //     to: distXmod
            // }),
            fis.plugin('http-push2', {
                receiver: fd['urlUpload'],
                to: fd['pathCdns'],
                cacheDir: __dirname + '/.cache'
            })
        ]
    })
    .match('qiniu-upfile.css', {
        optimizer: fis.plugin('clean-css'),
        packTo: qiniuVersionCss
    })
    .match(qiniuVersionCss, {
        deploy: [
            fis.plugin('local-deliver', {
                to: fd['pathLocalCdns']
            }),
            // fis.plugin('local-deliver', {
            //     to: distXmod
            // }),
            fis.plugin('http-push2', {
                receiver: fd['urlUpload'],
                to: fd['pathCdns'],
                cacheDir: __dirname + '/.cache'
            })
        ]
    })


