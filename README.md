# WebRTC_test
a simple example of WebRTC

## signal-server:
### 关于证书：
```
openssl req -x509 -newkey rsa:2048 -keyout ./keys/server_key.pem -out ./keys/server_crt.pem -days 99999 -nodes 
```
当你创建一个WebRTC信令服务器时，证书是非常重要的，尤其是在涉及到真实的、生产环境中的部署时。下面列举了为什么需要证书，以及上述`openssl`命令做了什么：

1. **WebRTC 和 HTTPS 的关系**:
   - WebRTC规范要求，当你在生产环境中部署WebRTC应用时，它必须运行在HTTPS上。这是为了确保媒体和信令都是加密的，以保护用户的隐私和数据安全。
   - 为了启用HTTPS，你需要SSL/TLS证书。当你为你的信令服务器创建证书时，你实际上是为HTTPS准备的。

2. **测试和开发**:
   - 在开发和测试阶段，你可能不希望为你的信令服务器购买一个真正的证书，特别是当服务器只在本地运行时。因此，使用`openssl`来生成自签名证书是一个简单的解决方案，它为你提供了一个免费的、但不被公共认证的证书。

3. **`openssl` 命令解释**:
   - `req -x509`: 该命令生成一个自签名的X.509证书。
   - `-newkey rsa:2048`: 创建一个新的2048位的RSA密钥。
   - `-keyout ./keys/server_key.pem`: 将新创建的私钥保存到指定的路径。
   - `-out ./keys/server_crt.pem`: 将自签名的证书保存到指定的路径。
   - `-days 99999`: 证书的有效期是99999天。
   - `-nodes`: 这意味着私钥不应该被加密。这是有用的，因为它允许服务器在没有密码提示的情况下启动。

需要注意的是，自签名证书在生产环境中通常是不被浏览器所信任的，因为它没有任何第三方机构进行认证。但是，对于开发和测试目的，它是完全可以的。在生产环境中部署时，你应该考虑从一个受信任的证书颁发机构获取证书。


### package.json:
package.json文件为项目提供了结构和元数据，它描述了项目的依赖、脚本和基本信息。


### npm i 过程：
是的，当你在项目的根目录（即包含`package.json`的目录）执行`npm i`或`npm install`时，以下事情会发生：

1. **检查`package.json`**:
   - `npm`会首先检查`package.json`文件中的`dependencies`和`devDependencies`部分。

2. **创建/更新`node_modules`目录**:
   - 如果`node_modules`目录不存在，`npm`会创建它。如果目录已存在，它将继续在该目录中安装/更新包。
   - `npm`将开始下载并安装`package.json`中列出的所有依赖项（及其递归依赖项）。

3. **更新`package-lock.json`**:
   - 如果`package-lock.json`文件不存在，`npm`会创建它。
   - `package-lock.json`文件是一个完整的依赖树，它确保了你的项目有一个一致的安装和依赖结构，无论何时或在哪里运行`npm install`。这可以确保每次安装的版本都是相同的，避免了"在我机器上运行正常"这类的问题。

4. **检查安装过程中的警告和错误**:
   - 如果某个包无法下载或安装，`npm`会显示错误。
   - 有时，某些包可能有“对等依赖”（peer dependencies）要求，它们可能不会被自动安装，但会触发警告，提示你手动安装。

基于你提供的`package.json`，执行`npm i`后，它会安装`express`, `express-session`和`socket.io`（及其所有依赖包）。这些库及其版本会被下载并保存到`node_modules`目录中。

## webrtc-client:
TODO