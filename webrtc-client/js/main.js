// /**
//  * dom获取
//  */
// const btnConnect = $('#connect'); // 连接dom
// const btnLogout = $('#logout'); // 挂断dom
// const domLocalVideo = $('#localVideo'); // 本地视频dom

// // fix bug
// let localStream = null; // Uncaught ReferenceError: localStream is not defined

// /**
//  * 连接
//  */
// btnConnect.click(() => {
//   //启动摄像头
//   if (localStream == null) {
//     openCamera().then(stream => {
//       localStream = stream; // fix bug
//       pushStreamToVideo(domLocalVideo[0], stream);
//     }).catch(e => alert(`getUserMedia() error: ${e.name}`));
//   }
// });

// /**
//  * 挂断
//  */
// btnLogout.click(() => {
//   closeCamera(domLocalVideo[0]);
// })

/**
 * dom获取
 */
const btnConnect = $('#connect'); // 连接dom
const btnLogout = $('#logout'); // 挂断dom
const domLocalVideo = $('#localVideo'); // 本地视频dom
const domRoom = $('#room'); // 获取房间号输入框dom

/**
 * 连接
 */
btnConnect.click(() => {  // () => {}：箭头函数
  const roomid = domRoom.val(); // 获取用户输入的房间号
  if (!roomid) {
    alert('房间号不能为空');
    return;
  };
  //启动摄像头
  if (localStream == null) {  // localStream为null:摄像头未启动
    openCamera().then(stream => {
      localStream = stream; // 保存本地视频到全局变量
      pushStreamToVideo(domLocalVideo[0], stream);  // 将视频流stream显示在视频元素domLocalVideo[0]上
      console.log('test')
      connect(roomid); // new:成功打开摄像头后，开始创建或者加入输入的房间号
    }).catch(e => alert(`getUserMedia() error: ${e.name}`));
  }
  // .then(stream => { ... }): 这是Promise的then方法。
  // 当openCamera函数成功地完成其工作（即成功地打开摄像头并获取视频流）时，
  // then中的回调函数会被执行。这个回调函数接收一个参数stream，代表从摄像头获取到的视频流。

  // .catch(e => alert(getUserMedia() error: ${e.name})): 
  // 这是Promise的catch方法。当openCamera函数在尝试打开摄像头或获取视频流时遇到任何错误，
  // catch中的回调函数会被执行。这个回调函数接收一个参数e，代表发生的错误。

});

/**
 * 挂断
 */
btnLogout.click(() => {
  closeCamera(domLocalVideo[0]);
  logout(roomId); // 退出房间
  
  //移除远程视频
  $('#remoteDiv').empty();
})
