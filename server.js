var http = require('http')
const fs = require('fs')
const WebSocket = require("ws")

/**
 * user存放登陆的用户
 * all_user所有登陆的用户
 */
let user = {}
let all_user = []
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
    // 首先登陆的对象，后续如果有相同的用户直接覆盖
    let object = decodeURI(req.url.match(/(?<=\?)[^:]+?(?=:|$)/))
    // 将所有连接者存储
    user[object] = ws
    // 存储所有登陆用户
    all_user.push(object)
    // 广播
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(
                {
                    nickname: all_user,
                    type: "user"
                }));
        }
    })
    ws.on("message", (obj) => {
        console.log("前台发的送消息" + JSON.parse(obj).nickname);
        // 广播群聊
        if (JSON.parse(obj).object == "群聊") {
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(
                        {
                            num: JSON.parse(obj).num,
                            nickname: JSON.parse(obj).nickname,
                            msg: JSON.parse(obj).msg,
                            object: JSON.parse(obj).object
                        }));
                }
            })
        }
        let message = {
            num: JSON.parse(obj).num,
            nickname: JSON.parse(obj).nickname,
            msg: JSON.parse(obj).msg,
            object: JSON.parse(obj).object
        }
        //单聊
        if (user[JSON.parse(obj).object]) {
            if (user[JSON.parse(obj).object].readyState === 1) {
                user[JSON.parse(obj).object].send(
                    JSON.stringify(message)
                )
                ws.send(
                    JSON.stringify(message)
                )
            }
        }
    })
})

server.listen(8080, () => {
    console.log('服务已开启 http://localhost:8080');
})












