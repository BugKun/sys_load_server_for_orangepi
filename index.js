var express = require("express"),
    compress = require("compression"),
    app = express(),
    server = require("http").createServer(app),
    io = require("socket.io").listen(server),
    os = require("os"),
    osUtils = require("os-utils"),
    path = require('path'),
    fs = require("fs"),
    interval = -1,
    cpuInfo = "CPU：" + os.cpus()[0].model.replace(/(^\s*)|(\s*$)/g, "") + " @" + os.cpus()[0].speed + "Mhz ×" + os.cpus().length;

app.use(compress());
app.use(express.static(path.join(__dirname, '/static')));



/*可修改的设置*/
var Token = "abcd", //Token验证的字符串
    port = 8080; //服务器绑定的端口






server.listen(port);
console.log("Server is now running in localhost: " + port);

function Client(socket) {
    var self = this;
    this.socket = socket;
    this.timeout;

    this.timeoutProc = function timeoutProc() {
        console.log('timeouted');
        self.socket.emit('DisconnectReq');
    };
    this.datain = function(data) {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(this.timeoutProc, 15000);
    }
    this.timeout = setTimeout(this.timeoutProc, 15000);
}

function getSysInfo(cb) {
    var cpuUsage = null, memInfo = null;
    function callback() {
        if(cpuUsage && memInfo) cb(cpuUsage, memInfo);
    }
    function updateCPU(_cb) {
        osUtils.cpuUsage(function (value) {
            _cb(value);
        });
    }
    updateCPU(function (_cpuUsage) {
        cpuUsage = _cpuUsage * 100.0;
        callback();
    });
    function getMemFree(_cb) {
        require('child_process').exec('free', function(error, stdout, stderr) {
            var lines = stdout.split("\n");
            var memInfoTitle = lines[0].replace( /[\s\n\r]+/g,' ').split(/\s/);
            var memInfoValue = lines[1].replace( /[\s\n\r]+/g,' ').split(/\s/);
            memInfoTitle.shift();
            memInfoValue.shift();
            var memInfo = {};
            for (var i in memInfoTitle){
                memInfo[memInfoTitle[i]] = memInfoValue[i] * 1024;
            }
            _cb(memInfo);
        });
    }
    getMemFree(function (_memInfo) {
        memInfo = _memInfo;
        callback();
    });
}

function sysInfo() {
    var totalMem = os.totalmem();
    var temperature = Number(fs.readFileSync('/sys/class/thermal/thermal_zone0/temp','utf-8')) || 0;
    getSysInfo(function (cpuUsage, memInfo) {
        var freeMem = memInfo.available;
        io.sockets.emit("sysInfo", {
            cpuUsage,
            freeMem,
            totalMem,
            temperature
        });
    });
}

io.sockets.on('connection', function (sockets) {//连接事件
    console.log('已连接' + io.eio.clientsCount + '个用户！');
    var client = new Client(sockets);
    sockets.on('disconnect', function(){
        console.log('当前还剩下：' + io.eio.clientsCount + '个用户连接！');
        if(io.eio.clientsCount === 0 && interval !== -1) {
            clearInterval(interval);
            interval = -1;
        }
        delete client;
    });
    if(!sockets.request._query.Token || sockets.request._query.Token !== Token) {
        console.log("Token错误，阻止连接！");
        io.sockets.emit("TokenAccess", false);
        delete client;
        return false;
    }else{
        io.sockets.emit("TokenAccess", true);
    }
    io.sockets.emit("cpuInfo", cpuInfo);
    sysInfo();
    if (interval < 0) {
        interval = setInterval(sysInfo, 1000);//每隔1s取系统数据
    }
});
