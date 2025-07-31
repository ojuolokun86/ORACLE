const sendToChat = require('../../utils/sendToChat');
const globalStore = require('../../utils/globalStore');
const { isBotOwner } = require('../../database/database');

const menu = `
*👤 Presence Settings*
Reply with the number to choose:
1. 🟢 Online/Available
2. ✍️ Typing
3. 🎤 Recording
0. ⏹️ Stop/Paused

_Choose how the bot appears everywhere you send a message._
`;

async function presenceCommand(sock, msg, args) {
  const botInstanceId = sock.user?.id?.split(':')[0]?.split('@')[0];
  const from = msg.key.remoteJid;
  const sentMenu = await sock.sendMessage(from, { text: menu }, { quoted: msg });
  const menuMsgId = sentMenu.key.id;
  const botId = sock.user?.id?.split(':')[0]?.split('@')[0];
  const botLid = sock.user?.lid?.split(':')[0]?.split('@')[0];
  const senderId = msg.key.participant || msg.key.remoteJid;
  const bot = botId && botLid;
  if (!msg.key.fromMe && !bot) {
    return await sendToChat(sock, from, {
      message: '❌ Only the bot owner can configure presence settings.'
    });
  }

  const listener = async (m) => {
    const reply = m.messages?.[0];
    if (!reply) return;
    const replySender = reply.key.participant || reply.key.remoteJid;
    const context = reply.message?.extendedTextMessage?.contextInfo;
    const isReplyToMenu = context?.stanzaId === menuMsgId;
    if (!isReplyToMenu) return;
    const body = reply.message?.conversation || reply.message?.extendedTextMessage?.text || '';
    const option = body.trim();

    let presenceType = 'available';
    switch (option) {
      case '1': case 'online': presenceType = 'available'; break;
      case '2': case 'typing': presenceType = 'composing'; break;
      case '3': case 'recording': presenceType = 'recording'; break;
      case '0': case 'stop': presenceType = 'unavailable'; break;
      default: presenceType = 'available'; break;
    }
    globalStore.globalPresenceType = globalStore.globalPresenceType || {};
    globalStore.globalPresenceType[botInstanceId] = presenceType;
    await sendToChat(sock, from, { message: `✅ Global dynamic presence set to *${presenceType}* for this bot instance.` });
    sock.ev.off('messages.upsert', listener);
  };

  sock.ev.on('messages.upsert', listener);
}

module.exports = presenceCommand;