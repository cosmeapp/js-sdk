(function(F, undefined){

// __inline('plupload/plupload.full.min.js');
// __inline('plupload/i18n/zh_CN.js');
// __inline('qiniu.js');
if (typeof plupload === 'undefined') {
    throw new Error('QiniuUploader requires plupload');
}
if (typeof Qiniu === 'undefined') {
    throw new Error('QiniuUploader requires qiniu js-sdk');
}

function QiniuUploader(cfg){
    var self = this;
    if (!(self instanceof QiniuUploader)) {
        return new QiniuUploader(cfg);
    }
    var defaults = {
        runtimes: 'html5,html4',
        max_file_size: '10mb',
        browse_button: 'pickfiles',
        container: 'container',
        drop_element: 'container',
        dragdrop: true,
        chunk_size: '4mb',
        unique_names: false,
        save_key: true,
        uptoken_url: $('#uptoken_url').val(),
        domain: $('#domain').val(),
        get_new_uptoken: false,
        auto_start: true,
        init: {
            Error: function(){

            },
            FileUploaded: function(uploader, file, info){
                // info 为 "{"hash":"FuhLJned9sAifJiitsLUf8QieMwk","key":"Icon-60@3x.png"}"
                // debugger;
            }
        }

    }
    this.config = $.extend(true, defaults, cfg);
    this._init();
}
QiniuUploader.prototype = {
    _init: function(){
        var config = this.config;
        var uploader = Qiniu.uploader(config);
        this.uploader = uploader;
        uploader.bind('FilesAdded', function(uploader, files){

        });
        uploader.bind('BeforeUpload', function(uploader, file){
            // 处理分块
        });
        uploader.bind('UploadProgress', function(uploader, file){
            // 进度条
        });
        uploader.bind('UploadComplete', function(uploader, files){

        });
        /* bind 的参数很init FileUploaded  参数是不一样的。
        info response: "{"hash":"FuhLJned9sAifJiitsLUf8QieMwk","key":"Icon-60@3x.png"}"
        responseHeaders: "Pragma: no-cache
        ↵Content-Type: application/json
        ↵Cache-Control: no-store, no-cache, must-revalidate
        ↵"
        status: 200
        */
        uploader.bind('FileUploaded', function(uploader, file, info){

        });
        uploader.bind('Error', function(uploader, error, errorMsg){

        });
    }
}

// F.Qiniu = Qiniu;
F.QiniuUploader = QiniuUploader;

})(F);