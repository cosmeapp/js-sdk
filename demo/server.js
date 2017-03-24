var qiniu = require('qiniu');
var express = require('express');
var config = require('./cfg.js');
var app = express();
var cors = require('cors');

app.configure(function() {
    app.use(express.static(__dirname + '/'));
});


app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

// https://www.zhihu.com/question/27533465
// http://blog.csdn.net/marujunyy/article/details/8852017
// https://cnodejs.org/topic/51dccb43d44cbfa3042752c8
// http://stackoverflow.com/questions/32500073/request-header-field-access-control-allow-headers-is-not-allowed-by-itself-in-pr
// http://stackoverflow.com/questions/25727306/request-header-field-access-control-allow-headers-is-not-allowed-by-access-contr
// http://frend.cc/javascript/2015/07/02/cross-origin.html
app.use(cors());
// app.all('*', function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "X-Requested-With");
//     res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
//     res.header("X-Powered-By",' 3.2.1')
//     res.header("Content-Type", "application/json;charset=utf-8");
//     next();
// });

// //allow custom header and CORS
// app.all('*',function (req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
//   res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

//   if (req.method == 'OPTIONS') {
//     res.send(200); /*让options请求快速返回*/
//   }
//   else {
//     next();
//   }
// });

// Add headers
// app.use(function (req, res, next) {

//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', '*');

//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', true);

//     // Pass to next layer of middleware
//     next();
// });

// app.use(express.urlencoded());

app.use(express.urlencoded());
app.use('/bower_components', express.static(__dirname + '/../bower_components'));
app.use('/src', express.static(__dirname + '/../src'));

app.use('/js', express.static(__dirname + '/js'));


app.get('/uptoken', function(req, res, next) {

    /**
     * Request header field If-Modified-Since is not allowed by Access-Control-Allow-Headers in preflight response.
     */

    // Website you wish to allow to connect
    // res.setHeader('Access-Control-Allow-Origin', '*');

    // // Request methods you wish to allow
    // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // // Request headers you wish to allow
    // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // // Set to true if you need the website to include cookies in the requests sent
    // // to the API (e.g. in case you use sessions)
    // res.setHeader('Access-Control-Allow-Credentials', true);


    // res.header("Cache-Control", "max-age=0, private, must-revalidate");
    // res.header("Pragma", "no-cache");
    // res.header("Expires", 0);

    var token = uptoken.token();
    if (token) {
        res.json({
            uptoken: token,
            domain: config.Domain
        });
    }
});

app.post('/downtoken', function(req, res) {

    var key = req.body.key,
        domain = req.body.domain;

    //trim 'http://'
    if (domain.indexOf('http://') != -1) {
        domain = domain.substr(7);
    }
    //trim 'https://'
    if (domain.indexOf('https://') != -1) {
        domain = domain.substr(8);
    }
    //trim '/' if the domain's last char is '/'
    if (domain.lastIndexOf('/') === domain.length - 1) {
        domain = domain.substr(0, domain.length - 1);
    }

    var baseUrl = qiniu.rs.makeBaseUrl(domain, key);
    var deadline = 3600 + Math.floor(Date.now() / 1000);

    baseUrl += '?e=' + deadline;
    var signature = qiniu.util.hmacSha1(baseUrl, config.SECRET_KEY);
    var encodedSign = qiniu.util.base64ToUrlSafe(signature);
    var downloadToken = config.ACCESS_KEY + ':' + encodedSign;

    if (downloadToken) {
        res.json({
            downtoken: downloadToken,
            url: baseUrl + '&token=' + downloadToken
        })
    }
});

app.get('/', function(req, res) {
    res.render('index.html', {
        domain: config.Domain,
        uptoken_url: config.Uptoken_Url
    });
});

app.get('/multiple', function(req, res) {
    res.render('multiple.html', {
        domain: config.Domain,
        uptoken_url: config.Uptoken_Url
    });
});

app.get('/amd', function(req, res) {
    res.render('requirejs-qiniu.html', {
        domain: config.Domain,
        uptoken_url: config.Uptoken_Url
    });
});



app.get('/custom', function(req, res) {
    res.render('../custom.html', {
        domain: config.Domain,
        uptoken_url: config.Uptoken_Url
});

app.get('/formdata', function(req, res) {
    var token = uptoken.token();
    res.render('formdata.html', {
        domain: config.Domain,
        uptoken: token
    });
});

app.get('/performance', function(req, res) {
    var token = uptoken.token();
    res.render('performance.html', {
        uptoken: token

    });
});

qiniu.conf.ACCESS_KEY = config.ACCESS_KEY;
qiniu.conf.SECRET_KEY = config.SECRET_KEY;

var uptoken = new qiniu.rs.PutPolicy(config.Bucket_Name);


app.listen(config.Port, function() {
    console.log('Listening on port %d\n', config.Port);
    console.log('▽ ▽ ▽ ▽ ▽ ▽ ▽ ▽ ▽ ▽ ▽ ▽ ▽  Demos  ▽ ▽ ▽ ▽ ▽ ▽ ▽ ▽ ▽ ▽ ▽ ▽ ▽ ▽ ▽ ▽')
    console.log(' ▹▹▹▹▹▹▹▹▹▹▹▹▹▹▹▹  Upload: http://127.0.0.1:%d   ◁ ◁ ◁ ◁ ◁ ◁ ◁', config.Port);
    console.log(' ▹▹▹▹▹▹▹  Multiple upload: http://127.0.0.1:%d/multiple  ◁ ◁ ◁', config.Port);
    console.log(' ▹▹▹▹▹▹▹  Formdata upload: http://127.0.0.1:%d/formdata  ◁ ◁ ◁', config.Port);
    console.log(' ▹▹▹▹▹▹▹  Up  Performance: http://127.0.0.1:%d/performance ◁ ◁', config.Port);
    console.log('△ △ △ △ △ △ △ △ △ △ △ △ △ △ △ △ △ △ △ △ △ △ △ △ △ △ △ △ △ △ △ △ △\n');
});
