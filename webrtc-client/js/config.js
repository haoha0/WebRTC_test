// WebRTC配置文件
const THSConfig = {
    // 信令服务器   信令是 WebRTC 中建立、管理和终止通信会话所需的过程。它用于协调通信、发送控制消息、发现其他对等体等
    // signalServer: 'wss://localhost:8443',
    signalServer: 'wss://192.168.43.175:8443',  // 地址需要修改为你的服务器地址
    // Offer/Answer模型请求配置
    offerOptions: {
      offerToReceiveAudio: true, // 请求接收音频
      offerToReceiveVideo: true, // 请求接收视频
    },
    // ICE服务器
    iceServers: {
      iceServers: [
        { urls: 'stun:stun.xten.com' }, // Safri兼容：url -> urls
      ]
    }
    // ICE (Interactive Connectivity Establishment) 是一个框架，用于使两个对等体 (通常在不同的网络或后 NAT) 能够通信。它使用 STUN 和 TURN 服务器来解决网络限制问题。
    // 这里只配置了一个 STUN 服务器 (stun:stun.xten.com)。STUN 服务器用于帮助对等体发现自己的公共 IP 地址和端口，这对于 NAT 穿越非常有用。
  }