const axios = require('axios');
const os = require('os');
const { exec } = require('child_process');
const https = require('https');
const { performance } = require('perf_hooks');
const sendToChat = require('../../utils/sendToChat');

// Measure latency
function measureLatency(url = 'https://google.com') {
  return new Promise(resolve => {
    const start = performance.now();
    https.get(url, res => {
      res.on('data', () => {});
      res.on('end', () => {
        const end = performance.now();
        resolve(`${(end - start).toFixed(1)} ms`);
      });
    }).on('error', () => resolve('Error'));
  });
}

// Measure download speed
function measureDownloadSpeed(url = 'https://speed.hetzner.de/1MB.bin') {
  return new Promise(resolve => {
    const start = performance.now();
    let totalBytes = 0;

    https.get(url, res => {
      res.on('data', chunk => totalBytes += chunk.length);
      res.on('end', () => {
        const end = performance.now();
        const duration = (end - start) / 1000;
        const mbps = ((totalBytes * 8) / 1_000_000 / duration).toFixed(2);
        resolve(`${mbps} Mbps`);
      });
    }).on('error', () => resolve('Error'));
  });
}

// Speedtest binary
function getSpeedTest() {
  return new Promise((resolve, reject) => {
    exec('speedtest', (error, stdout) => {
      if (error) return reject(`Speedtest error: ${error.message}`);
      try {
        const pingMatch = stdout.match(/Latency:\s+([\d.]+)\s+ms/);
        const downloadMatch = stdout.match(/Download:\s+([\d.]+)\s+Mbps/);
        const uploadMatch = stdout.match(/Upload:\s+([\d.]+)\s+Mbps/);

        resolve({
          ping: pingMatch ? parseFloat(pingMatch[1]) : 'Error',
          download: downloadMatch ? parseFloat(downloadMatch[1]) : 'Error',
          upload: uploadMatch ? parseFloat(uploadMatch[1]) : 'Error'
        });
      } catch (e) {
        reject(`Parse error: ${e.message}`);
      }
    });
  });
}

// VPN info
async function getVpnInfo() {
  try {
    const res = await axios.get('https://ipinfo.io/json?token=6eeb48e6940e25');
    return {
      ip: res.data.ip || 'Unknown',
      city: res.data.city || 'Unknown',
      region: res.data.region || '',
      country: res.data.country || '',
      org: res.data.org || 'Unknown',
      hostname: res.data.hostname || 'Unknown'
    };
  } catch (err) {
    console.error('❌ VPN fetch error:', err.message);
    return null;
  }
}

// OS info
function getOSInfo() {
  return {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    uptime: (os.uptime() / 60).toFixed(1) + ' mins',
    type: os.type(),
    cpu: os.cpus()[0]?.model || 'Unknown',
    totalMem: (os.totalmem() / (1024 ** 3)).toFixed(2) + ' GB',
    freeMem: (os.freemem() / (1024 ** 3)).toFixed(2) + ' GB'
  };
}

// Get flag emoji
function getFlagEmoji(countryCode) {
  if (!countryCode) return '🏳️';
  return countryCode.toUpperCase().replace(/./g, c => String.fromCodePoint(c.charCodeAt() + 127397));
}

// Main command
async function infoCommand(sock, msg) {
  const from = msg.key.remoteJid;
  const quote = msg;

  console.log('📡 Fetching info...');
  let vpnBlock = '', botBlock = '', privacyBlock = '', osBlock = '';

  try {
    const [vpn, speed] = await Promise.all([
      getVpnInfo(),
      getSpeedTest()
    ]);

    const flag = getFlagEmoji(vpn?.country || '');
    const location = `${vpn?.city}, ${vpn?.region}, ${vpn?.country}`.trim();
    const serverId = `${process.env.MASKED_ID || 'Unknown'}-${vpn?.country || 'XXX'} ${flag}`;

    vpnBlock = `╭━━〔 *🛰️ SERVER Info* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• Location: _${location}_
┃◈┃• ISP: _${vpn?.org}_
┃◈┃• Ping: _${speed.ping} ms_
┃◈┃• Download: _${speed.download} Mbps_
┃◈┃• Upload: _${speed.upload} Mbps_
┃◈┃• ID: _${serverId}_
┃◈└───────────┈⊷
╰──────────────┈⊷\n`;

  } catch (e) {
    console.error('❌ Error in VPN/speed:', e);
    vpnBlock = '❌ Failed to fetch VPN/speed info.\n';
  }

  // Bot Info
  try {
    const name = sock.user?.name || 'Unknown';
    const bio = await sock.fetchStatus?.(sock.user.id) || {};
    botBlock = `╭━━〔 *🤖 Bot Info* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• Name: _${name}_
┃◈┃• Bio: _${bio.status || 'Unknown'}_
┃◈└───────────┈⊷
╰──────────────┈⊷\n`;
  } catch {
    botBlock = '❌ Failed to fetch bot info.\n';
  }

  // Privacy Info
  try {
    const privacy = await sock.fetchPrivacySettings?.(true);
    privacyBlock = '╭━━〔 *🔐 Privacy Settings* 〕━━┈⊷\n┃◈╭─────────────·๏\n';
    for (const [key, val] of Object.entries(privacy || {})) {
      privacyBlock += `┃◈┃• ${key}: _${val}_\n`;
    }
    privacyBlock += '┃◈└───────────┈⊷\n╰──────────────┈⊷\n';
  } catch {
    privacyBlock = '❌ Failed to fetch privacy settings.\n';
  }

  // OS Info
  const osInfo = getOSInfo();
  osBlock = `╭━━〔 *🖥️ System Info* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• Hostname: _${osInfo.hostname}_
┃◈┃• Platform: _${osInfo.platform}_
┃◈┃• Architecture: _${osInfo.arch}_
┃◈┃• OS: _${osInfo.type} ${osInfo.release}_
┃◈┃• Uptime: _${osInfo.uptime}_
┃◈┃• CPU: _${osInfo.cpu}_
┃◈┃• Memory: _${osInfo.freeMem} / ${osInfo.totalMem}_
┃◈└───────────┈⊷
╰──────────────┈⊷\n`;

  const final = `${vpnBlock}${botBlock}${privacyBlock}${osBlock}`;
  console.log('✅ Sending info to chat...');
  await sendToChat(sock, from, { message: final }, { quoted: quote });
}

module.exports = infoCommand;
