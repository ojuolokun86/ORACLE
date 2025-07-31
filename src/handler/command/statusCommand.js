const { setUserStatusViewMode, getUserStatusViewMode } = require('../../database/database');
const sendToChat = require('../../utils/sendToChat');

const statusMenu = (currentMode) => {
  const currentModeLabel =
    currentMode === 0 ? '🛑 Silent Mode' :
    currentMode === 1 ? '👁️ Recon Mode' :
    '😎 Engage Mode';

  return `
🛡️ *Agent Settings: STATUS OPS* 🛡️

🛑 0 - Silent Mode (Ignore All)  
👁️ 1 - Recon Mode (View Only)  
😎 2 - Engage Mode (View + React)

🎮 Current Operation Mode: *${currentModeLabel}*  
🔁 Reply with 0, 1, or 2 to deploy new strategy.
`;
};


async function statusCommand(sock, msg) {
  const userId = sock.user.id.split(':')[0];
  const currentMode = getUserStatusViewMode(userId);

  // Send menu and get its message ID
  const sentMenu = await sock.sendMessage(msg.key.remoteJid, { text: statusMenu(currentMode), quoted: msg });
  const menuMsgId = sentMenu.key.id;

  // Listen for reply
  const listener = async (m) => {
    const reply = m.messages?.[0];
    if (!reply) return;

    const replyFrom = reply.key.remoteJid;
    const replySender = reply.key.participant || reply.key.remoteJid;
    if (replyFrom !== msg.key.remoteJid || replySender !== (msg.key.participant || msg.key.remoteJid)) return;

    const context = reply.message?.extendedTextMessage?.contextInfo;
    const isReplyToMenu = context?.stanzaId === menuMsgId;
    if (!isReplyToMenu) return;

    const body = reply.message?.conversation || reply.message?.extendedTextMessage?.text || '';
    const option = parseInt(body.trim());

    if (![0, 1, 2].includes(option)) {
      await sendToChat(sock, replyFrom, { message: '❌ Invalid option. Use 0, 1, or 2.' });
      sock.ev.off('messages.upsert', listener);
      return;
    }

    setUserStatusViewMode(userId, option);
    let replyMsg;
    if (option === 0) replyMsg = '🔕 Status viewing is now OFF.';
    else if (option === 1) replyMsg = '👁️ Status viewing is now ON (view only).';
    else replyMsg = '😍 Status viewing & reacting is now ON.';

    await sendToChat(sock, replyFrom, { message: replyMsg });
    sock.ev.off('messages.upsert', listener);
  };

  sock.ev.on('messages.upsert', listener);
}

module.exports = statusCommand;