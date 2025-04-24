const WebSocket = require('ws');
const http = require('http');

// Render 會通過環境變數 PORT 來告訴您應該監聽哪個 Port
// 如果沒有設置 PORT 環境變數 (例如在本機測試時)，則使用 8080
const port = process.env.PORT || 8080;

// 創建一個基本的 HTTP 伺服器
// 雖然我們主要用 WebSocket，但 PaaS 平台通常需要一個 HTTP 伺服器綁定到 Port
// 這裡的 HTTP 伺服器只做最基本的事情，你也可以添加一個簡單的 "/" 路徑來回覆，
// 例如一個說明頁面或健康檢查。
const server = http.createServer((req, res) => {
  // 可以添加一個簡單的 HTTP 響應，例如健康檢查
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WebSocket server is running');
  } else {
    res.writeHead(404);
    res.end();
  }
});

// 將 WebSocket 伺服器連接到 HTTP 伺服器上
const wss = new WebSocket.Server({ server });

// 用於生成 Client ID 的計數器
let clientCounter = 0;

// 當有新的 WebSocket 連接建立時
wss.on('connection', (ws) => {
  // 為新連接的客戶端分配一個獨特的 ID
  clientCounter++;
  ws.id = clientCounter; // 將 ID 附加到 websocket 對象上，方便後續使用
  console.log(`Client ${ws.id} connected`);

  // *** 新增: 連接建立成功後，發送帶有 Client ID 的歡迎訊息給這個特定客戶端 ***
  ws.send(`Say Hello, Client ${ws.id}`);
  console.log(`Sent initial greeting to Client ${ws.id}`);

  // 當從客戶端收到訊息時
  ws.on('message', (message) => {
    // message 可能是 Buffer，如果確定是字串，可以 toString()
    const receivedMessage = message.toString();
    console.log(`Received message from Client ${ws.id}: ${receivedMessage}`);

    // *** 新增: 將收到的訊息廣播給所有連接中的客戶端 ***
    // 遍歷所有連接到伺服器的客戶端
    wss.clients.forEach((client) => {
      // 檢查客戶端是否處於開啟狀態 (連接是活動的)
      if (client.readyState === WebSocket.OPEN) {
        // 構建要廣播的訊息 (可以包含發送者的 ID)
        const broadcastMessage = `Client ${ws.id}: ${receivedMessage}`;
        // 將訊息發送給這個客戶端
        client.send(broadcastMessage);
        console.log(`Broadcasted message to Client ${client.id}`);
      }
    });

    // *** 移除原來的 ws.send(...) echo 功能 ***
    // 原來是 ws.send(`Server received: ${receivedMessage}`);
  });

  // 當連接關閉時
  ws.on('close', () => {
    console.log(`Client ${ws.id} disconnected`);
    // wss.clients Set 會自動管理連接的移除
  });

  // 當連接發生錯誤時
  ws.on('error', (error) => {
    console.error(`WebSocket error for Client ${ws.id}: ${error}`);
    // 錯誤發生後，連接通常會被關閉，也會觸發 close 事件
  });

  // *** 移除原來的連接建立後發送的通用歡迎訊息 ***
  // 原來是 ws.send('Welcome to the simple WebSocket server!');
});

// 啟動 HTTP 伺服器並監聽指定的 Port
server.listen(port, () => {
  console.log(`WebSocket server started on port ${port}`);
});

console.log(`Node.js version: ${process.version}`);
