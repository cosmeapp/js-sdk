/**
 * 七牛图片上传封装
 *
 * @author huixisheng
 * @date 2016-05-10 10:00:59
 *
 * @todo
 * - 复制图片地址
 * - 750以上图片裁剪.max_file_width: 1242
 * - 过滤相同图片
 *   - http://stackoverflow.com/questions/19261122/underscore-js-find-unique-values-in-array-of-objects-return-unique-items-and-th
 *   - http://www.planabc.net/2009/12/26/array_uniq/
 *   - http://www.codeceo.com/article/javascript-delete-array.html
 *   - https://segmentfault.com/q/1010000000197274
 *   - http://www.it610.com/article/1244718.htm
 */

define('uploadProgress',['jquery', 'artDialog', 'artTemplate'], function($, artDialog, artTemplate){

    var LOADING_IMG = 'http://static.cosmeapp.com/nodeqn/0e6e0f46d7-128-128.gif';
    var HINT = {
        'FileUploaded': '图片上传',
        'tokenError': '获取下载token失败',
        'ratioError': '图片比例不正确'
    };
    // 报错信息
    var ERROR = {

    };
    /**
     * [UploadProgress description]
     * @method  UploadProgress
     * @author huixisheng
     * @version [version]
     * @date    2016-05-10
     * @param   {Object}       file {"id":"o_1aid0hfovd6o1ahnuna1baa6hs9","name":"5-3.jpg","type":"image/jpeg","size":83563,"origSize":83563,"loaded":0,"percent":0,"status":1,"lastModifiedDate":"2016-03-16T03:40:26.000Z"}
     * @param   {Object}       up   {"id":"o_1aid0g2sm1468pe5ipn1sog1isk1","uid":"o_1aid0g2sm1468pe5ipn1sog1isk1","state":1,"features":{"chunks":true,"multipart":true,"multi_selection":true,"dragdrop":true},"runtime":"html5","files":[{"id":"o_1aid0hfovd6o1ahnuna1baa6hs9","name":"5-3.jpg","type":"image/jpeg","size":83563,"origSize":83563,"loaded":0,"percent":0,"status":1,"lastModifiedDate":"2016-03-16T03:40:26.000Z"}],"settings":{"runtimes":"html5,html4","max_retries":0,"chunk_size":2097152,"multipart":true,"multi_selection":true,"file_data_name":"file","flash_swf_url":"js/Moxie.swf","silverlight_xap_url":"js/Moxie.xap","filters":{"mime_types":[{"title":"Image files","extensions":"jpg,gif,png"}],"prevent_duplicates":true,"max_file_size":"2mb"},"resize":{"enabled":false,"preserve_headers":true,"crop":false},"send_chunk_number":true,"rw":5,"rh":3,"uptoken_url":"/uptoken","domain":"http://huixisheng.qiniudn.com/","input_name":"image","max_file_width":1242,"max_file_size":"2mb","dragdrop":true,"unique_names":false,"save_key":true,"auto_start":true,"browse_button":[{"moxie_o_1aid0g2ne1thou5eobs1g1prva0":"o_1aid0hcckdk713uo8fbna3err4"}],"container":{"moxie_o_1aid0g2ne1thou5eobs1g1prva0":"o_1aid0hcclv7seq81ta711dadom5"},"drop_element":[{"moxie_o_1aid0g2ne1thou5eobs1g1prva0":"o_1aid0hcclv7seq81ta711dadom5"}],"init":{},"url":"http://upload.qiniu.com","multipart_params":{"token":""},"required_features":{"select_file":true}},"total":{"size":83563,"loaded":0,"uploaded":0,"failed":0,"queued":1,"percent":0,"bytesPerSec":0}}
     * @public
     */
    function UploadProgress(file, up, itemRenderData){
        var container = up.getOption('container');
        var multi_selection = up.getOption('multi_selection');

        var $item = $('#' + file.id);
        var $container = $(container);
        if( !$container.length ){
            throw new Error('请设置config[\'container\']');
        }

        var $itemContainer = $container.find('.qiniu-list');
        if( !$itemContainer.length ){
            $itemContainer = $('<div class="qiniu-list" />').appendTo($container);
        }

        this.file = file;
        this.uploader = up;
        this.$container = $container;
        this.$itemContainer = $itemContainer;
        this.setInput();

        if( !$item.length ){
            itemRenderData = itemRenderData || {}
            var data = {
                'image': [{
                    'key': file.id,
                    'url': 'http://static.cosmeapp.com/nodeqn/0e6e0f46d7-128-128.gif'
                }]
            };
            var data = $.extend(true, data, itemRenderData);
            var tplItem = '{{each image}}<div data-key="{{$value.key}}" id="{{$value.key}}" class="qiniu-item"><a href="{{$value.url}}" target="_blank"><img src="{{$value.url}}"></a><button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button><p node-type="hinttext" class="bg-danger"></p><div class="progress" style="display: none;"><div class="progress-bar progress-bar-info progress-bar-striped" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style="width: 0%"><span class="sr-only">0% Complete</span></div></div></div>    {{/each}}';
            var render = artTemplate.compile(tplItem);
            var html = render(data);
            // var html = artTemplate('qiniu-item', data);
            if( !multi_selection ){
                $itemContainer.html('');
                this.$input.val('');
            }
            $item = $(html).appendTo($itemContainer);
            this.$item = $item;

            this.setStatus('等待中，正在上传...', 'bg-info');
            this.bindUploadCancel();
        } else{
            this.$item = $item;
        }

        // @todo 根据file.id 初始化一次？
        // return this;
    }

    UploadProgress.prototype = {
        // 设置进度条
        setProgress: function(percentage, speed){
            var file = this.file;
            var uploaded = file.loaded;
            var $item = this.$item;
            var chunk_size = plupload.parseSize(this.uploader.getOption('chunk_size'));

            var size = plupload.formatSize(uploaded).toUpperCase();
            var formatSpeed = plupload.formatSize(speed).toUpperCase();
            var progressbar = $item.find('.progress').show().find('.progress-bar-info');
            var text = size + "/" + plupload.formatSize(file.size).toUpperCase() +  " 速度:" + formatSpeed + "/s";
            this.setStatus(text, 'bg-info', true);
            percentage = parseInt(percentage, 10);
            if (file.status !== plupload.DONE && percentage === 100) {
                percentage = 100;
            }
            progressbar.attr('aria-valuenow', percentage).css('width', percentage + '%');

        },
        /**
         * [setComplete description]
         * @method  setComplete
         * @author huixisheng
         * @version [version]
         * @date    2016-05-10
         * @param   {String}    info   {"hash":"FhvkzAG_avUB1VmaC1JWZyRVeLIh","key":"FhvkzAG_avUB1VmaC1JWZyRVeLIh"}
         * @param   {[type]}    params [description]
         * @public
         */
        setComplete: function(info){
            var uploader = this.uploader;
            var result = $.parseJSON(info);
            var imageInfo = Qiniu.imageInfo(result.key);
            var rw = uploader.getOption('rw');
            var rh = uploader.getOption('rh');
            var domain = uploader.getOption('domain');
            var url = domain + result.key;
            imageInfo.key = result.key;
            imageInfo.url = url;

            var $item = this.$item;
            if( rw ){
                if( rw * imageInfo['height'] != rh * imageInfo['width'] ){
                    var d = artDialog({
                      'title': '提示信息',
                      'content': '亲，图片比例不对。请上传比例为' + rw + ':' +  rh
                      // 'timer': 2000
                    });
                    d.showModal();
                    this.setStatus('图片比例不对', 'bg-danger');
                } else {
                    $item.find('img').attr('src', url);
                    $item.find('a').attr('href', url);
                    this.setStatus('上传完成', 'bg-success');
                    $item.find('.progress').hide();
                    $item.attr('data-key', result.key);
                    this.setInputValues(imageInfo);
                }
            }

            // @todo 添加回调
        },
        // 绑定事件
        bindUploadCancel: function(){
            var uploader = this.uploader;
            var $container = this.$container;
            var file = this.file;
            var self = this;

            $container.on('click', '.close', function(){
                var $item = $(this).parents('.qiniu-item');
                var key = $item.attr('data-key') || '';
                self.setInputValues(key);
                if( file['name'] ){
                    uploader.removeFile(file);
                }
                $item.off().remove();
            });
        },
        // 设置状态
        setStatus: function(text, classList, showProgress){
            var $item = this.$item;
            $item.find('[node-type="hinttext"]').show().attr('class', '').addClass(classList).text(text);
            if( showProgress ){
                $item.find('.progress').show();
            } else {
                $item.find('.progress').hide();
            }

        },
        setError: function(errorMsg){
            this.setStatus('上传出错', 'bg-danger');
            var d = artDialog({
                title: '上传图片出错',
                content: '如何有问题请联系开发人员<br>' + errorMsg || ''
            });
            d.showModal();
        },
        setInput: function(){
            var uploader = this.uploader;
            var inputName = uploader.getOption('input_name');
            var $container = this.$container;
            var $input = $container.find('[name="' + inputName + '"]');
            if( !$input.length ){
                $input = $('<input type="hidden" name="' + inputName + '" />').appendTo($container)
            }
            this.$input = $input;
        },
        // value == key 移除
        // value 是对象添加
        // value 是数组就合并
        // @todo 去重
        setInputValues: function(value){
            var uploader = this.uploader;
            var $container = this.$container;
            var inputName = uploader.getOption('input_name');
            var $input = $container.find('[name="' + inputName + '"]');
            var multi_selection = uploader.getOption('multi_selection');
            var content = $.trim($input.val()) || '[]';
            var list = JSON.parse(content);
            if( $.type(value) == 'object' ){
                if( !multi_selection ){
                    list = value;
                } else {
                    list.push(value);
                }

            }
            if( $.isArray(value) ){
                list = list.concat(value);
            }
            if( typeof value === "string" ){
                list.forEach(function(item, index){
                    if( item['key'] == value ){
                        list.splice(index, 1);
                    }
                });
            }
            $input.val(JSON.stringify(list));
        }
    }
    return UploadProgress;
});


define('qiniu-upfile',['jquery', 'qiniu-sdk', 'uploadProgress'], function($, qiniu, UploadProgress){

    var defaultInit = {
        'FilesAdded': function(up, files) {
            // "[{"id":"o_1a8vl9ivs6pai76fid1pp3ekq9","name":"B03发帖.jpg","type":"image/jpeg","size":220858,"origSize":220858,"loaded":0,"percent":0,"status":2,"lastModifiedDate":"2015-12-30T02:42:45.000Z","speed":0}]"
            plupload.each(files, function(file) {
                var progress = new UploadProgress(file, up);
            });

        },
        'BeforeUpload': function(up, file) {
            //查看分块进度;
        },
        'UploadProgress': function(up, file) {
            var progress = new UploadProgress(file, up);
            progress.setProgress(file.percent + "%", file.speed);
        },
        'UploadComplete': function(up, file) {
            // debugger;
        },
        // 初始化2次会被重置掉
        // op.init.FileUploaded = function() {};
        'FileUploaded': function(up, file, info) {
            // var progress = new UploadProgress(file, up);
            // progress.setComplete(info);
        },
        'Error': function(up, err, errTip) {
            var progress = new UploadProgress(err.file, up);
            progress.setError(errTip || '');
        },
        // 'Key': function(up, file) {
        //     var key = "12344";
        //     // do something with key
        //     return key
        // }
    };

    function QiniuUpfile(cfg){
        var settings = {
            rw: 5,
            rh: 3,
            uptoken_url: '/ajax/upload-token/',
            domain: 'http://static.cosmeapp.com/',
            // uptoken_url: '/uptoken',
            // domain: 'http://huixisheng.qiniudn.com/',
            input_name: 'image',
            max_file_width: 1242,// 图片的最大宽度
            runtimes: 'html5,html4',
            multi_selection: false,
            // browse_button: $('.qiniu-upfile-btn')[0],
            // container: $('.qiniu-container')[0],
            // drop_element: $('.qiniu-container')[0],
            max_file_size: '2mb',
            // @todo 资源上传
            // flash_swf_url: 'js/plupload/Moxie.swf',
            dragdrop: true,
            chunk_size: '4mb',
            //上传失败最大重试次数
            max_retries: 3,

            // downtoken_url: '/downtoken',
            // unique_names: true,
            unique_names: false,
            save_key: true,
            // x_vars: {
            //     'id': '1234',
            //     'time': function(up, file) {
            //         var time = (new Date()).getTime();
            //         // do something with 'time'
            //         return time;
            //     },
            // },
            filters : {
                // https://github.com/qiniu/js-sdk/issues/117
                max_file_size : '2mb',
                prevent_duplicates: true,
                //Specify what files to browse for
                mime_types: [
                    // {title : "flv files", extensions : "flv"} //限定flv后缀上传格式上传
                    // {title : "Video files", extensions : "flv,mpg,mpeg,avi,wmv,mov,asf,rm,rmvb,mkv,m4v,mp4"}, //限定flv,mpg,mpeg,avi,wmv,mov,asf,rm,rmvb,mkv,m4v,mp4后缀格式上传
                    {title : "Image files", extensions : "jpg,gif,png"}, //限定jpg,gif,png后缀上传
                    // {title : "Zip files", extensions : "zip"} //限定zip后缀上传
                ]
            },
            auto_start: true
        }
        var config = $.extend(true, settings, cfg);

        config.init = defaultInit;
        this.config = config;
        // var qjs = new QiniuJsSDK();

        var uploader = Qiniu.uploader(config);
        this.uploader = uploader;
        uploader.bind('FileUploaded', function(up, file, reulst) {
            var progress = new UploadProgress(file, up);
            var info = reulst.response;
            progress.setComplete(info);
            // debugger;
            // console.log('hello man,a file is uploaded');
        });
        // this.preview()

    }
    QiniuUpfile.prototype = {
        init: function(){

        },
        preview: function(){
            var uploader = this.uploader;
            var renderData = this.config['render_data'];
            if( $.isArray(renderData) && renderData.length > 0  ){
                var file = {};
                var itemRenderData = {};
                itemRenderData.image = renderData;
                var progress = new UploadProgress(file, uploader, itemRenderData);
                progress.setInputValues(renderData);
                progress.setStatus('上传完成', 'bg-success');
            }
        }
    }

    function initQiniu(){
        var config = {};
        $(document).ready(function(){
            var $qiniulist = $('[role="mz-qiniu"]');
            $qiniulist.each(function(){
                var $this = $(this);
                var dataMzQiniu = $this.attr('data-mz-qiniu') || '[]';
                var render_data = JSON.parse(dataMzQiniu);
                var browse_button = $this.find('.qiniu-upfile-btn')[0];
                var container = $this[0];
                var drop_element = $this[0];
                config.browse_button = browse_button;
                config.container = container;
                config.drop_element = drop_element;
                config.render_data = render_data;
                var cfg = JSON.parse($this.attr('config-mz-qiniu') || '{}');
                config = $.extend(true, config, cfg);

                var qiniuUpfile = new QiniuUpfile(config);
                qiniuUpfile.preview();
            });
        });
    }
    initQiniu();
    // [{"format":"jpeg","width":755,"height":453,"colorModel":"ycbcr","key":"FqZ4E26SsVfEiEc6R5i5gKJESDH1","url":"http://huixisheng.qiniudn.com/FqZ4E26SsVfEiEc6R5i5gKJESDH1"}]

    return QiniuUpfile;

});

