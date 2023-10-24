const https = require('https');  // 创建https服务器
const fs = require('fs');        // fs，读取文件系统，用于读取证书
const socketIO = require('socket.io');  // WebSocket库，实现实时通信

// 读取SSL证书和密钥，这些证书用于HTTPS服务器
const options = {
    key: fs.readFileSync('keys/server_key.pem'),
    cert: fs.readFileSync('keys/server_crt.pem'),
}

// 构建https服务器
const apps = https.createServer(options);

const SSL_PORT = 8443;

apps.listen(SSL_PORT);  // 指定https服务器监听的端口为8443


// 使用socketIO在上面创建的HTTPS服务器上监听WebSocket连接
const io = socketIO.listen(apps);

// socket监听连接
io.sockets.on('connection', (socket) => {
    console.log('连接建立');

    // 创建/加入房间
    // 当收到客户端名为createAndJoinRoom的消息时，执行
    socket.on('createAndJoinRoom', (message) => {
        const { room } = message;   // 从收到的消息中解构出room属性，<=> const room = message.room
        console.log('Received createAndJoinRoom：' + room);
        // 判断room是否存在
        const clientsInRoom = io.sockets.adapter.rooms[room];   // 获取房间内的客户端
        // 在socket.io中，adapter属性负责存储和检索所有连接的socket实例及其相关信息，包括房间等。
        // [room]从rooms对象中获取指定名为room的房间的信息。

        const numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;   // 获取房间内客户端数量，如果房间不存在则为0
        // clientsInRoom.sockets: 从clientsInRoom中获取sockets属性。这个属性包含了在该房间内的所有socket实例。
        // Object.keys(clientsInRoom.sockets): 获取clientsInRoom.sockets对象的所有属性名keys，返回一个数组。
        // Object.keys(clientsInRoom.sockets).length: 获取数组长度，即房间内客户端数量。

        console.log('Room ' + room + ' now has ' + numClients + ' client(s)');  // 打印房间内客户端数量
        if (numClients === 0) {
            // room 不存在 不存在则创建（socket.join）
            // 加入并创建房间
            socket.join(room);  // 将当前socket实例加入指定房间room
            console.log('Client ID ' + socket.id + ' created room ' + room);

            // 发送消息至客户端 [id,room,peers]
            const data = {
                id: socket.id, //socket id
                room: room, // 房间号
                peers: [], // 其他连接
            };
            socket.emit('created', data);   
            // 当前的socket实例发送一个created事件，并附带data数据。这告诉客户端它已经创建了一个新的房间。
        } else {
            // room 存在
            // 加入房间中
            socket.join(room);
            console.log('Client ID ' + socket.id + ' joined room ' + room);

            // joined告知房间里的其他客户端 [id,room]
            io.sockets.in(room).emit('joined', {
                id: socket.id, //socket id
                room: room, // 房间号
            });
            // 使用socket.io的in方法选中指定的房间，并向房间内的所有客户端发送一个joined事件，告知它们有一个新的客户端加入了房间。


            // 发送消息至客户端 [id,room,peers]
            const data = {
                id: socket.id, //socket id
                room: room, // 房间号
                peers: [], // 其他连接
            };
            // 查询其他连接
            const otherSocketIds = Object.keys(clientsInRoom.sockets);  // 获取房间内所有客户端的socket id
            // for循环遍历所有客户端的socket id，将其添加到data.peers中(除了当前socket id)
            for (let i = 0; i < otherSocketIds.length; i++) {
                if (otherSocketIds[i] !== socket.id) {
                    data.peers.push({
                        id: otherSocketIds[i],
                    });
                }
            }
            socket.emit('created', data);
            // 告诉客户端它已经加入了一个已存在的房间，并为它提供了房间内其他客户端的信息。
        }
    });

    // 退出房间，转发exit消息至room其他客户端 [from,room]
    socket.on('exit', (message) => {
        console.log('Received exit: ' + message.from + ' message: ' + JSON.stringify(message));
        const { room } = message;
        // 关闭该连接
        socket.leave(room);
        // 转发exit消息至room其他客户端
        const clientsInRoom = io.sockets.adapter.rooms[room];
        if (clientsInRoom) {
            const otherSocketIds = Object.keys(clientsInRoom.sockets);
            for (let i = 0; i < otherSocketIds.length; i++) {
                const otherSocket = io.sockets.connected[otherSocketIds[i]];
                // io.sockets.connected是一个对象，其中存储了服务器上的所有活跃sockets。
                // 通过提供socket ID (otherSocketIds[i])，我们可以从这个对象中获取特定的socket实例。
                // 这里的otherSocket就代表了一个特定的客户端的连接。
                otherSocket.emit('exit', message);
                // 在Socket.io中，每一个socket实例都有一个emit方法，该方法允许服务器向这个特定的socket（即特定的客户端）发送一个事件。
                // otherSocket.emit('exit', message);的用意是向特定的otherSocket这个客户端发送一个exit事件。这是为了告诉房间中的其他客户端有人退出了房间。

                // 1. 注意和上面创建加入房间区分，如果使用 socket.emit('exit', message);，
                // 它会向当前处理该事件的客户端（即触发这个服务器端代码执行的客户端）发送一个exit事件。
                // 2. 注意和下面的广播区分，如果使用 socket.broadcast.emit('exit', message);，
                // 它会向除了当前处理该事件的客户端（即触发这个服务器端代码执行的客户端）之外的所有客户端发送一个exit事件。

            }
        }
    });

    // socket关闭
    socket.on('disconnect', function (reason) {
        const socketId = socket.id;
        console.log('disconnect: ' + socketId + ' reason:' + reason);
        const message = {
            from: socketId,
            room: '',
        };
        socket.broadcast.emit('exit', message);
    });



    // 转发offer消息至room其他客户端 [from,to,room,sdp]
    socket.on('offer', (message) => {
        // const room = Object.keys(socket.rooms)[1];
        console.log('收到offer: from ' + message.from + ' room:' + message.room + ' to ' + message.to);
        // 根据id找到对应连接
        const otherClient = io.sockets.connected[message.to];
        if (!otherClient) {
            return;
        }
        // 转发offer消息至其他客户端
        otherClient.emit('offer', message);
    });

    // 转发answer消息至room其他客户端 [from,to,room,sdp]
    socket.on('answer', (message) => {
        // const room = Object.keys(socket.rooms)[1];
        console.log('收到answer: from ' + message.from + ' room:' + message.room + ' to ' + message.to);
        // 根据id找到对应连接
        const otherClient = io.sockets.connected[message.to];
        if (!otherClient) {
            return;
        }
        // 转发answer消息至其他客户端
        otherClient.emit('answer', message);
    });

    // 转发candidate消息至room其他客户端 [from,to,room,candidate[sdpMid,sdpMLineIndex,sdp]]
    socket.on('candidate', (message) => {
        console.log('收到candidate: from ' + message.from + ' room:' + room + ' to ' + message.to);
        // 根据id找到对应连接
        const otherClient = io.sockets.connected[message.to];
        if (!otherClient) {
            return;
        }
        // 转发candidate消息至其他客户端
        otherClient.emit('candidate', message);
    });
});



