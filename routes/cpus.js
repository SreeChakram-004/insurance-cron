const express = require('express');
const router = express.Router();
const pidusage = require('pidusage');

const THRESHOLD = 70; // CPU usage threshold in percentage
const INTERVAL = 5000; // Monitoring interval in milliseconds (5 seconds)

function checkCpuUsage() {
  pidusage(process.pid, (err, stats) => {
    if (err) {
      console.error('Error getting CPU usage:', err);
      return;
    }

    const cpuUsage = stats.cpu;
    console.log('Current CPU usage:', cpuUsage.toFixed(2), '%');

    if (cpuUsage >= THRESHOLD) {
      console.log('CPU usage exceeded threshold. Restarting server...');
      restartServer();
    }
  });
}

function restartServer() {
    
  process.exit(1);
}

setInterval(checkCpuUsage, INTERVAL);

module.exports = router;
