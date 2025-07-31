const { getReactToCommand, setReactToCommand } = require('../../database/database');
const sendToChat = require('../../utils/sendToChat');

async function reactCommand(sock, msg, textMsg) {
  const userId = sock.user.id.split(':')[0];
  const arg = textMsg.split(' ')[1]?.toLowerCase();

  if (arg === 'on') {
    setReactToCommand(userId, true);
    await sendToChat(sock, msg.key.remoteJid, { message: '✅ Command reaction is now ON.' });
  } else if (arg === 'off') {
    setReactToCommand(userId, false);
    await sendToChat(sock, msg.key.remoteJid, { message: '❌ Command reaction is now OFF.' });
  } else {
    await sendToChat(sock, msg.key.remoteJid, { message: 'Usage: react on/off' });
  }
}

module.exports = reactCommand;