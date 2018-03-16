var api = {
        cpuInfo: "获取中...",
        getDataLength:function () {
            return option.series[0].data.length;
        },
        getDataSize:function () {
            return toDisplayMem(JSON.stringify(option).length);
        }
    },
    storageChange = {
        datazoom: {start: 0, end: 100},
        showTipPointer: null,
        legend: {
            'CPU使用率': true,
            'CPU温度': true,
            '内存使用率': true
        }
    },
    myChart = null,
    option = {
        tooltip: {
            trigger: 'axis',
            position: function (pt) {
                return [pt[0], '10%'];
            },
            formatter: function (params) {
                /*尽量保证在鼠标移动事件执行后，再执行*/
                setTimeout(function () {
                    /*由此可判断鼠标还在表格中，所以阻止tooltip关闭*/
                    storageChange.showTipPointer = params[0].dataIndex;
                },0);
                var HTML = params[0].axisValueLabel + "<br>";
                for(var i = 0;i <params.length;i++){
                    if(params[i].seriesIndex === 0){
                        HTML += params[0].seriesName + "：" + params[0].value + "%（" + api.cpuInfo + "）<br>";
                    }else if(params[i].seriesIndex === 1){
                        HTML += params[i].seriesName + "：" + params[i].value + "℃<br>";
                    }else if(params[i].seriesIndex === 2){
                        HTML += params[i].seriesName + "：" + params[i].value + "%<br>总内存：" + toDisplayMem(params[i].data.totalMem) + "<br>当前内存占用：" + toDisplayMem(params[i].data.usedMem) + "<br>剩余内存：" + toDisplayMem(params[i].data.freeMem);
                    }
                }
                return HTML;
            },
            confine: true,
            alwaysShowContent: false
        },
        title: {
            text: '系统使用率监听器',
        },
        legend: {
            left: "center",
            data: ['CPU使用率', 'CPU温度', '内存使用率'],
            selected: {
                'CPU使用率': true,
                'CPU温度': true,
                '内存使用率': true
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: []
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: 100,
            axisLabel: {
                formatter: '{value} %'
            }
        },
        toolbox: {
            show: true,
            feature: {
                dataView: {
                    readOnly: true,
                    optionToContent: function(opt) {
                        var axisData = opt.xAxis[0].data;
                        var series = opt.series;
                        var table = '<table style="width:100%;text-align:center"><tbody><tr>'
                            + '<td>时间</td>'
                            + '<td>' + series[0].name + '</td>'
                            + '<td>' + series[1].name + '</td>'
                            + '<td>' + series[2].name + '</td>'
                            + '<td>总内存</td>'
                            + '<td>当前内存占用</td>'
                            + '<td>可用内存</td>'
                            + '</tr>';
                        for (var i = 0, l = axisData.length; i < l; i++) {
                            table += '<tr>'
                                + '<td>' + axisData[i] + '</td>'
                                + '<td>' + series[0].data[i].value + '%</td>'
                                + '<td>' + series[1].data[i].value + '℃</td>'
                                + '<td>' + series[2].data[i].value + '%</td>'
                                + '<td>' + toDisplayMem(series[2].data[i].totalMem) + '</td>'
                                + '<td>' + toDisplayMem(series[2].data[i].usedMem) + '</td>'
                                + '<td>' + toDisplayMem(series[2].data[i].freeMem) + '</td>'
                                + '</tr>';
                        }
                        table += '</tbody></table>';
                        return table;
                    },
                    lang:['数据视图', '关闭']
                },
                saveAsImage: {}
            }
        },
        dataZoom: [{
            type: 'inside',
            start: 0,
            end: 100,
        },{
            type: 'slider',
            show: true,
            xAxisIndex: 0,
            start: 0,
            end: 100,
            filterMode: 'none',
            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '80%',
            handleStyle: {
                color: '#fff',
                shadowBlur: 3,
                shadowColor: 'rgba(0, 0, 0, 0.6)',
                shadowOffsetX: 2,
                shadowOffsetY: 2
            }
        }],
        series: [
            {
                name: 'CPU使用率',
                type: 'line',
                smooth: true,
                symbol: 'none',
                sampling: 'average',
                itemStyle: {
                    color: '#117dbb',
                    width: 1
                },
                areaStyle: {
                    color: '#117dbb',
                    opacity: '0.1'
                },
                data: []
            },
            {
                name: 'CPU温度',
                type: 'line',
                smooth: true,
                symbol: 'none',
                sampling: 'average',
                itemStyle: {
                    color: '#d9534f',
                    width: 1
                },
                areaStyle: {
                    color: '#d9534f',
                    opacity: '0.1'
                },
                data: []
            },
            {
                name: '内存使用率',
                type: 'line',
                smooth: true,
                symbol: 'none',
                sampling: 'average',
                itemStyle: {
                    color: '#9528b4',
                    width: 1
                },
                areaStyle: {
                    color: '#9528b4',
                    opacity: '0.1'
                },
                detail: {formatter: '{c}%'},
                data: []
            }
        ]
    };

function connectInit(token,connect,callback,handleErr) {
    if (!callback && typeof(callback) !== "function") {
        throw "callback must be a function";
        return false;
    }
    if (typeof(handleErr) !== "function") {
        throw "callback must be a function";
        return false;
    }
    var socket = io(window.location.origin + "?Token=" + token);
    socket.on('connect',function () {
        connect();
    });
    socket.on('TokenAccess', function (available) {
        if(available){
            callback();
        }else{
            socket.close();
            handleErr();
        }
    });
    socket.on('cpuInfo', function (data) {
        api.cpuInfo = data;
    });
    socket.on("error",function (error) {
        socket.close();
        if(handleErr) handleErr(error);
    });
    socket.on("cpuUpdate", function (update) {
        var usedMem = update.totalMem - update.freeMem;
        update.displayTime = new Date().toLocaleTimeString();
        option.xAxis.data.push(update.displayTime);
        option.series[0].data.push({
            value: update.cpuUsage.toFixed(2)
        });
        option.series[1].data.push({
            value: update.temperature,
        });
        option.series[2].data.push({
            value: (usedMem / update.totalMem * 100).toFixed(2),
            totalMem: update.totalMem,
            freeMem: update.freeMem,
            usedMem: usedMem
        });

        /*修复刷新数据时导致dataZoom重置*/
        option.dataZoom[0].start = option.dataZoom[1].start = storageChange.datazoom.start;
        option.dataZoom[0].end = option.dataZoom[1].end = storageChange.datazoom.end;

        option.tooltip.alwaysShowContent = (storageChange.showTipPointer === null)? false : true;
        /*还原legend的设置*/
        option.legend.selected = storageChange.legend;

        myChart.dispatchAction({
            type: 'showTip',
            seriesIndex: 0,
            dataIndex: storageChange.showTipPointer
        });

        myChart.setOption(option, true);
    });
    socket.open();
}

function animate(type) {
    var main = document.getElementById("main"),
        login = document.getElementById("login");
    switch (type){
        case "mainShow" :
            main.style.filter = "none";
            break;
        case "mainHidden" :
            main.style.filter = "blur(10px)";
            break;
        case "loginShow" :
            login.style.display = "block";
            break;
        case "loginHidden" :
            login.style.display = "none";
            break;
    }
}

function connecting() {
    var $console = document.getElementById("console");
    connectInit(document.getElementById("Token").value, function () {
        $console.innerText = '连接中...';
    }, function () {
        animate("loginHidden");
        animate("mainShow");
        myChartInit();
        console.log('连接成功！');
    }, function (err) {
        if(err){
            $console.innerText = "连接失败！";
            console.log(err);
        }else{
            animate("loginShow");
            animate("mainHidden");
            $console.innerText = "Token错误！";
        }
    });
}

document.getElementById('connect').addEventListener("click",connecting);
document.getElementById("Token").addEventListener("keyup",function(){
    if(event.keyCode == "13") {
        connecting();
    }
});


function toDisplayMem(v) {
    if (v >= (1024 * 1024 * 1024)) {
        v /= (1024 * 1024 * 1024);
        return v.toFixed(2) + "GB";
    }

    if (v >= (1024 * 1024)) {
        v /= (1024 * 1024);
        return v.toFixed(2) + "MB";
    }

    if (v >= (1024)) {
        v /= (1024);
        return v.toFixed(2) + "KB";
    }

    return v;
}

function myChartInit() {
    myChart = echarts.init(document.getElementById('main'));
    window.onresize = myChart.resize;

    myChart.on("datazoom",function(e){
        storageChange.datazoom.start = e.start;
        storageChange.datazoom.end = e.end;
    });
    myChart.on("legendselectchanged",function(e){
        storageChange.legend = e.selected;
    });
}



/*只要移动鼠标就关闭tooltip*/
document.getElementById('main').addEventListener("mousemove",function(){
    storageChange.showTipPointer = null;
});
document.getElementById('main').addEventListener("mousedown",function(){
    storageChange.showTipPointer = null;
});

