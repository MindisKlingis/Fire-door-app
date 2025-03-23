const WebSocket = require('ws');
const CodeAnalyzer = require('./codeAnalyzer');

class WebSocketService {
  constructor(server, rootDir) {
    this.wss = new WebSocket.Server({ server });
    this.analyzer = new CodeAnalyzer(rootDir);
    this.setupWebSocket();
  }

  setupWebSocket() {
    this.wss.on('connection', (ws) => {
      console.log('Client connected to architecture updates');

      // Send initial structure
      this.sendStructureUpdate(ws);

      // Handle client messages
      ws.on('message', async (message) => {
        const data = JSON.parse(message);
        
        if (data.type === 'REQUEST_UPDATE') {
          await this.sendStructureUpdate(ws);
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        console.log('Client disconnected from architecture updates');
      });
    });
  }

  async sendStructureUpdate(ws) {
    try {
      const structure = await this.analyzer.analyzeStructure();
      ws.send(JSON.stringify({
        type: 'STRUCTURE_UPDATE',
        data: structure,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        error: error.message
      }));
    }
  }

  // Broadcast updates to all connected clients
  async broadcastUpdate() {
    const structure = await this.analyzer.analyzeStructure();
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'STRUCTURE_UPDATE',
          data: structure,
          timestamp: new Date().toISOString()
        }));
      }
    });
  }
}

module.exports = WebSocketService; 