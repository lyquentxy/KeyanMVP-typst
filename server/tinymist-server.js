/**
 * Tinymist服务器管理器
 * 用于启动和管理Tinymist预览服务
 */

const express = require('express');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

class TinymistServer {
  constructor() {
    this.app = express();
    this.tinymistProcess = null;
    this.previewPort = null;
    this.wsServer = null;
    this.clients = new Set();

    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'temp')));
  }

  setupRoutes() {
    // 启动Tinymist预览服务
    this.app.post('/api/tinymist/start', async (req, res) => {
      try {
        await this.startTinymist();
        res.json({
          success: true,
          port: this.previewPort,
          message: 'Tinymist预览服务已启动'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // 停止Tinymist预览服务
    this.app.post('/api/tinymist/stop', (req, res) => {
      this.stopTinymist();
      res.json({
        success: true,
        message: 'Tinymist预览服务已停止'
      });
    });

    // 编译Typst文档
    this.app.post('/api/tinymist/compile', async (req, res) => {
      const { content, filename } = req.body;

      try {
        const result = await this.compileTypst(content, filename);
        res.json({
          success: true,
          result
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // 获取服务状态
    this.app.get('/api/tinymist/status', (req, res) => {
      res.json({
        isRunning: this.tinymistProcess !== null,
        port: this.previewPort,
        clients: this.clients.size
      });
    });

    // 服务器根路径 - 状态页面
    this.app.get('/', (req, res) => {
      const status = {
        isRunning: this.tinymistProcess !== null,
        port: this.previewPort,
        clients: this.clients.size,
        uptime: process.uptime(),
        memory: process.memoryUsage()
      };

      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Tinymist服务器状态</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .status { margin: 20px 0; }
            .running { color: #52c41a; }
            .stopped { color: #ff4d4f; }
            pre { background: #f6f6f6; padding: 15px; border-radius: 4px; }
            .api-list { margin: 20px 0; }
            .api-item { margin: 10px 0; padding: 10px; background: #f0f0f0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 Tinymist服务器控制台</h1>

            <div class="status">
              <h2>服务状态</h2>
              <p><strong>Tinymist进程:</strong>
                <span class="${status.isRunning ? 'running' : 'stopped'}">
                  ${status.isRunning ? '✅ 运行中' : '❌ 未运行'}
                </span>
              </p>
              <p><strong>预览端口:</strong> ${status.port || '未分配'}</p>
              <p><strong>WebSocket客户端:</strong> ${status.clients} 个连接</p>
              <p><strong>运行时间:</strong> ${Math.floor(status.uptime)} 秒</p>
            </div>

            <div class="api-list">
              <h2>📡 可用的API接口</h2>
              <div class="api-item">
                <strong>GET /api/tinymist/status</strong> - 获取服务状态
              </div>
              <div class="api-item">
                <strong>POST /api/tinymist/start</strong> - 启动Tinymist服务
              </div>
              <div class="api-item">
                <strong>POST /api/tinymist/stop</strong> - 停止Tinymist服务
              </div>
              <div class="api-item">
                <strong>POST /api/tinymist/compile</strong> - 编译Typst文档
              </div>
            </div>

            <div class="status">
              <h2>🔗 相关链接</h2>
              <p><a href="http://localhost:5175/typst-editor" target="_blank">Typst编辑器</a></p>
              <p><a href="http://localhost:5174" target="_blank">主应用首页</a></p>
              <p><strong>WebSocket:</strong> ws://localhost:3001</p>
            </div>

            <div class="status">
              <h2>📊 系统信息</h2>
              <pre>${JSON.stringify(status, null, 2)}</pre>
            </div>

            <div style="margin-top: 30px; text-align: center; color: #666;">
              <p>🛠 Tinymist Typst预览服务器 | 端口: 3000</p>
            </div>
          </div>

          <script>
            // 每5秒刷新一次状态
            setTimeout(() => {
              window.location.reload();
            }, 5000);
          </script>
        </body>
        </html>
      `);
    });
  }

  async startTinymist() {
    if (this.tinymistProcess) {
      throw new Error('Tinymist服务已在运行');
    }

    // 创建临时目录
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // 使用固定端口8212避免与8211冲突
    this.previewPort = 8212;

    return new Promise((resolve, reject) => {
      // 尝试使用系统安装的Tinymist
      this.tinymistProcess = spawn('tinymist', [
        'preview',
        '--host', '127.0.0.1',
        '--port', this.previewPort.toString(),
        '--root', tempDir
      ], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: tempDir
      });

      this.tinymistProcess.stdout.on('data', (data) => {
        console.log(`Tinymist stdout: ${data}`);
        if (data.toString().includes('listening')) {
          resolve();
        }
      });

      this.tinymistProcess.stderr.on('data', (data) => {
        console.error(`Tinymist stderr: ${data}`);
      });

      this.tinymistProcess.on('error', (error) => {
        console.error('Tinymist启动失败:', error);
        this.tinymistProcess = null;
        reject(new Error(`Tinymist启动失败: ${error.message}`));
      });

      this.tinymistProcess.on('close', (code) => {
        console.log(`Tinymist进程退出，代码: ${code}`);
        this.tinymistProcess = null;
      });

      // 如果5秒内没有成功启动，认为失败
      setTimeout(() => {
        if (this.tinymistProcess && !this.tinymistProcess.killed) {
          reject(new Error('Tinymist启动超时'));
        }
      }, 5000);
    });
  }

  stopTinymist() {
    if (this.tinymistProcess) {
      this.tinymistProcess.kill();
      this.tinymistProcess = null;
      this.previewPort = null;
    }
  }

  async compileTypst(content, filename = 'document.typ') {
    const tempDir = path.join(__dirname, 'temp');
    const inputFile = path.join(tempDir, filename);

    // 写入Typst文件
    fs.writeFileSync(inputFile, content, 'utf8');

    return new Promise((resolve, reject) => {
      // 使用Typst编译到PDF
      const outputFile = path.join(tempDir, `${path.parse(filename).name}.pdf`);
      const typstProcess = spawn('typst', [
        'compile',
        '--format', 'pdf',
        inputFile,
        outputFile
      ]);

      let stdout = '';
      let stderr = '';

      typstProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      typstProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      typstProcess.on('close', (code) => {
        if (code === 0) {
          // 检查生成的PDF文件
          const baseName = path.parse(filename).name;
          const pdfFile = path.join(tempDir, `${baseName}.pdf`);

          if (fs.existsSync(pdfFile)) {
            // 读取PDF文件的base64内容
            const pdfBuffer = fs.readFileSync(pdfFile);
            const pdfBase64 = pdfBuffer.toString('base64');

            resolve({
              pdf: pdfBase64,
              pdfPath: pdfFile,
              stdout,
              stderr
            });
          } else {
            reject(new Error('PDF文件生成失败'));
          }
        } else {
          reject(new Error(`编译失败 (代码 ${code}): ${stderr}`));
        }
      });

      typstProcess.on('error', (error) => {
        reject(new Error(`编译进程错误: ${error.message}`));
      });
    });
  }

  startWebSocketServer(port = 3001) {
    this.wsServer = new WebSocket.Server({ port });

    this.wsServer.on('connection', (ws) => {
      console.log('WebSocket客户端已连接');
      this.clients.add(ws);

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString());

          if (data.type === 'compile') {
            const result = await this.compileTypst(data.content, data.filename);

            // 广播编译结果给所有客户端
            this.broadcast({
              type: 'compiled',
              result: result
            });
          }
        } catch (error) {
          ws.send(JSON.stringify({
            type: 'error',
            error: error.message
          }));
        }
      });

      ws.on('close', () => {
        console.log('WebSocket客户端已断开');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket错误:', error);
        this.clients.delete(ws);
      });
    });

    console.log(`WebSocket服务器已启动，端口: ${port}`);
  }

  broadcast(data) {
    const message = JSON.stringify(data);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  start(port = 3000, wsPort = 3001) {
    this.startWebSocketServer(wsPort);

    this.app.listen(port, () => {
      console.log(`Tinymist服务器已启动，端口: ${port}`);
      console.log(`WebSocket端口: ${wsPort}`);
    });

    // 优雅关闭
    process.on('SIGINT', () => {
      console.log('正在关闭服务器...');
      this.stopTinymist();
      process.exit(0);
    });
  }
}

// 创建并启动服务器
const server = new TinymistServer();
server.start();

module.exports = TinymistServer;