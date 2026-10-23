import http from 'http';

const server = http.createServer((clientReq, clientRes) => {
  const options = {
    hostname: '127.0.0.1',
    port: 5174,
    path: clientReq.url,
    method: clientReq.method,
    headers: {
      ...clientReq.headers,
      host: 'localhost:5174',
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(clientRes, { end: true });
  });

  proxyReq.on('error', (err) => {
    clientRes.writeHead(502, { 'Content-Type': 'text/plain' });
    clientRes.end('Proxy forward error: ' + err.message);
  });

  clientReq.pipe(proxyReq, { end: true });
});

// WebSocket forwarding for Vite HMR
server.on('upgrade', (req, socket, head) => {
  const proxyReq = http.request({
    hostname: '127.0.0.1',
    port: 5174,
    path: req.url,
    method: req.method,
    headers: req.headers,
  });

  proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
    socket.write(
      `HTTP/${proxyRes.httpVersion} 101 Switching Protocols\r\n` +
      Object.entries(proxyRes.headers).map(([k, v]) => `${k}: ${v}`).join('\r\n') +
      '\r\n\r\n'
    );
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });

  proxyReq.on('error', () => {
    socket.destroy();
  });

  proxyReq.end();
});

server.listen(5173, '0.0.0.0', () => {
  console.log('Port forwarder active: http://localhost:5173 -> http://127.0.0.1:5174');
});
