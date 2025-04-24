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

// 當有新的 WebSocket 連接建立時
wss.on('connection', (ws) => {
  console.log('Client connected');

  // 當從客戶端收到訊息時
  ws.on('message', (message) => {
    // message 可能是 Buffer，如果確定是字串，可以 toString()
    const receivedMessage = message.toString();
    console.log(`Received message => ${receivedMessage}`);

    // 回覆訊息給客戶端 (echo 功能)
    ws.send(`Server received: ${receivedMessage}`);
  });

  // 當連接關閉時
  ws.on('close', () => {
    console.log('Client disconnected');
  });

  // 當連接發生錯誤時
  ws.on('error', (error) => {
    console.error(`WebSocket error: ${error}`);
  });

  // 連接建立成功後發送一條歡迎訊息
  ws.send('Welcome to the simple WebSocket server!');
});

// 啟動 HTTP 伺服器並監聽指定的 Port
server.listen(port, () => {
  console.log(`WebSocket server started on port ${port}`);
});

console.log(`Node.js version: ${process.version}`);