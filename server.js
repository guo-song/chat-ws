var http = require('http')
const fs = require('fs')
const url = require('url')
const WebSocket = require("ws")

/**
 * user存放登陆的用户
 */
let user = []
let server = http.createServer((req, res) => {
    res.setHeader("content-type", "text/html;charset=utf8");

    if (req.url === '/') {
        fs.createReadStream('chat.html').pipe(res);
    }
    else {
        res.end('对不起没找到')
    }
})


const wss = new WebSocket.Server({ server })
wss.on("connection", (ws, req) => {
    console.log(req.url);
    user[req.url] = ws
    console.log("server: receive connection");
    ws.on("message", (obj) => {
        console.log(obj);
        console.log(JSON.parse(obj).num);
        if (JSON.parse(obj).num == 1) {
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(
                    {
                        num: 1,
                        "nickname": JSON.parse(obj).nickname,
                        "msg": `${JSON.parse(obj).nickname}进入聊天室`
                    }));
                }
            })
        }
        if (JSON.parse(obj).num == 2) {
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(
                    {
                        num: 2,
                        "nickname": JSON.parse(obj).nickname,
                        "msg": JSON.parse(obj).msg
                    }));
                }
            })
        }
    })
})



server.listen(8080, () => {
    console.log('服务已开启 http://localhost:8080');
})












