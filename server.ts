import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import type { ChildProcess } from 'child_process';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
let PYTHON_PORT = parseInt(process.env.PYTHON_PORT || '8001', 10);
if (PYTHON_PORT === PORT) {
  PYTHON_PORT = PORT + 1;
}
const PYTHON_URL = `http://127.0.0.1:${PYTHON_PORT}`;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

let pythonProcess: ChildProcess | null = null;
let isPythonReady = false;

// Python FastAPI sunucusunu arka planda başlatma fonksiyonu
function startPythonBackend() {
  const pythonCmd = 'python3';
  console.log(`[LexiMind Server] Python FastAPI servisi başlatılıyor (Port ${PYTHON_PORT})...`);

  try {
    pythonProcess = spawn(pythonCmd, ['main.py'], {
      cwd: __dirname,
      env: {
        ...process.env,
        PYTHON_PORT: PYTHON_PORT.toString(),
        PORT: PYTHON_PORT.toString(),
        PYTHONUNBUFFERED: '1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    pythonProcess.stdout?.on('data', (data) => {
      const msg = data.toString();
      console.log(`[Python FastAPI] ${msg.trim()}`);
      if (msg.includes('Application startup complete') || msg.includes('Uvicorn running') || msg.includes('başlatılıyor')) {
        isPythonReady = true;
      }
    });

    pythonProcess.stderr?.on('data', (data) => {
      const msg = data.toString();
      console.warn(`[Python stderr] ${msg.trim()}`);
      if (msg.includes('Application startup complete') || msg.includes('Uvicorn running')) {
        isPythonReady = true;
      }
    });

    pythonProcess.on('exit', (code, signal) => {
      console.log(`[Python FastAPI] Süreç kapandı (kod: ${code}, sinyal: ${signal})`);
      isPythonReady = false;
      // Beklenmedik kapanmalarda yeniden başlatma denemesi (5 sn sonra)
      setTimeout(() => {
        if (!pythonProcess || pythonProcess.killed) {
          startPythonBackend();
        }
      }, 5000);
    });
  } catch (err) {
    console.error('[LexiMind Server] Python servisi başlatılamadı:', err);
  }
}

// Python sağlık kontrolü döngüsü
async function checkPythonHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${PYTHON_URL}/api/health`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      isPythonReady = true;
      return true;
    }
  } catch {
    // Henüz hazır değil
  }
  return false;
}

// Python'a istek proxy yönlendirme fonksiyonu
async function forwardToPython(req: Request, res: Response, targetPath: string) {
  const url = `${PYTHON_URL}${targetPath}`;
  try {
    const fetchOptions: RequestInit = {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, fetchOptions);
    const contentType = response.headers.get('content-type') || '';

    res.status(response.status);
    if (contentType.includes('application/json')) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text();
      res.send(text);
    }
  } catch (error: any) {
    console.error(`[Proxy Error] ${req.method} ${targetPath} yönlendirme hatası:`, error?.message);
    res.status(503).json({
      status: 'service_unavailable',
      message: 'Python NLP arka uç servisi başlatılıyor veya yanıt vermedi. Lütfen birkaç saniye sonra tekrar deneyin.',
      detail: error?.message,
    });
  }
}

// Bulut ortamı / Cloud Run canlılık ve sağlık kontrolü
app.get('/health', async (req: Request, res: Response) => {
  try {
    const isReady = await checkPythonHealth();
    if (isReady) {
      await forwardToPython(req, res, '/health');
    } else {
      res.status(200).json({
        status: 'initializing',
        service: 'LexiMind Web Gateway',
        model_loaded: false,
        message: 'Python FastAPI NLP backend is starting up...',
      });
    }
  } catch {
    res.status(200).json({
      status: 'ok',
      service: 'LexiMind Web Gateway',
    });
  }
});

// API ve Dokümantasyon Yolları
app.all('/api/*', async (req: Request, res: Response) => {
  const queryIndex = req.originalUrl.indexOf('?');
  const pathWithQuery = queryIndex !== -1 ? req.originalUrl : req.path;
  await forwardToPython(req, res, pathWithQuery);
});

app.all(['/docs', '/docs/*', '/openapi.json', '/redoc'], async (req: Request, res: Response) => {
  await forwardToPython(req, res, req.originalUrl);
});

async function startServer() {
  startPythonBackend();

  const isProduction =
    process.env.NODE_ENV === 'production' ||
    (process.env.NODE_ENV !== 'development' && fs.existsSync(path.resolve(__dirname, 'dist')));

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LexiMind] Web sunucusu http://localhost:${PORT} üzerinde çalışıyor.`);
    console.log(`[LexiMind] Python FastAPI backend: ${PYTHON_URL}`);
  });
}

process.on('SIGTERM', () => {
  if (pythonProcess) {
    pythonProcess.kill('SIGTERM');
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  if (pythonProcess) {
    pythonProcess.kill('SIGINT');
  }
  process.exit(0);
});

startServer();
