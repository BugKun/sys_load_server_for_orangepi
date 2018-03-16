# sysLoadServer
监听整个系统的CPU和内存使用率

## 注意
* Linux的各种系统也可以使用，但是可能无法获取CPU温度。

### 直接使用
> 直接Download下载<br>
> 安装Node.js<br>
> 解压并定位到目录<br>
> 命令行 npm i<br>
> 命令行 npm start<br>
> 打开浏览器并输入网址：监听对象的IP地址 + 端口号<br>

### 个人设置
> 打开 index.js 并找到代码
```JavaScript
/*可修改的设置*/
var Token = "abcd", //Token验证的字符串
    port = 8080; //服务器绑定的端口
    
```
> 根据自己的需要就行修改即可。
