const { spawn } = require('child_process');
const net = require('net');

function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => resolve(true))
      .once('listening', () => {
        server.close();
        resolve(false);
      })
      .listen(port);
  });
}

async function findAvailablePort(startPort) {
  let port = startPort;
  while (await isPortInUse(port)) {
    port++;
  }
  return port;
}

async function startApp() {
  try {
    const port = await findAvailablePort(3000);
    console.log(`Starting React app on port ${port}...`);
    
    const reactApp = spawn('npm', ['start'], {
      env: { ...process.env, PORT: port },
      stdio: 'inherit',
      shell: true
    });

    reactApp.on('error', (error) => {
      console.error('Failed to start React app:', error);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

startApp(); 