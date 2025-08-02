const { getWelcomeSettings, setWelcomeEnabled, setGoodbyeEnabled } = require('../../database/welcomeDb');
const sendToChat = require('../../utils/sendToChat');
const { checkIfAdmin } = require('./groupCommand');
const menu = (welcome, goodbye) => `
👋 *Welcome/Goodbye Settings (Group)*

1. Welcome: ${welcome ? '🟢 ON' : '🔴 OFF'}
2. Goodbye: ${goodbye ? '🟢 ON' : '🔴 OFF'}

Reply with:
1 to toggle Welcome
2 to toggle Goodbye
3 to toggle Welcome and Goodbye
`;

async function welcomeCommand(sock, msg) {
  const groupId = msg.key.remoteJid;
  const botId = sock.user.id.split(':')[0];
  const senderId = msg.key.participant || msg.participant || msg.key.remoteJid;
  const settings = getWelcomeSettings(groupId, botId);

  if (!msg.key.remoteJid.endsWith('@g.us')) {
    await sendToChat(sock, msg.key.remoteJid, {
      message: '❌ This command can only be used in a group.'
    });
    return;
  }

  if (!(await checkIfAdmin(sock, groupId, senderId))) {
    await sock.sendMessage(groupId, { text: "❌ Only group admins can use this command." }, { quoted: msg });
    return;
  }

  const sentMenu = await sock.sendMessage(groupId, { text: menu(settings.welcome, settings.goodbye), quoted: msg });
  const menuMsgId = sentMenu.key.id;

  const listener = async (m) => {
    const reply = m.messages?.[0];
    if (!reply) return;
    const quotedId = reply.message?.extendedTextMessage?.contextInfo?.stanzaId;
    if (quotedId !== menuMsgId) return;

    const text = reply.message?.conversation || reply.message?.extendedTextMessage?.text || '';
    const input = text.trim();

    if (input === '1') {
      setWelcomeEnabled(groupId, botId, !settings.welcome);
      await sendToChat(sock, groupId, { message: `Welcome message is now ${!settings.welcome ? 'ON' : 'OFF'}.` });
    } else if (input === '2') {
      setGoodbyeEnabled(groupId, botId, !settings.goodbye);
      await sendToChat(sock, groupId, { message: `Goodbye message is now ${!settings.goodbye ? 'ON' : 'OFF'}.` });
    } else if (input === '3') {
      setWelcomeEnabled(groupId, botId, !settings.welcome);
      setGoodbyeEnabled(groupId, botId, !settings.goodbye);
      await sendToChat(sock, groupId, { message: `Welcome and Goodbye messages are now ${!settings.welcome && !settings.goodbye ? 'ON' : 'OFF'}.` });
    } else {
      await sendToChat(sock, groupId, { message: '❌ Invalid option.' });
    }
    sock.ev.off('messages.upsert', listener);
  };

  sock.ev.on('messages.upsert', listener);
}

module.exports = welcomeCommand;