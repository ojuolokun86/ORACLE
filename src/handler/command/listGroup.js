const  sendToChat  = require('../../utils/sendToChat');
const { isBotOwner } = require('../../database/database');
async function listGroupsCommand(sock, msg) {
  try {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const botId = sock.user?.id?.split(':')[0]?.split('@')[0];
    const botLid = sock.user?.lid?.split(':')[0]?.split('@')[0];
    const senderId = sender?.split('@')[0];
    const name = sock.user?.name;
    if (!msg.key.fromMe && !isBotOwner(senderId, botId, botLid)) {
      return await sendToChat(sock, from, {
        message: `❌ Only *${name}* can see bot groups.`
      });
    }
    const jid = sock.user?.id;
    const chats = await sock.groupFetchAllParticipating();
    const groups = Object.values(chats);

    if (!groups.length) {
      await sendToChat(sock, jid, { message: '🤖 No groups found.' });
      return;
    }

    let groupList = '*📋 Groups I am in:*\n\n';
    groups.forEach((g, i) => {
      groupList += `${i + 1}. ${g.subject} \n   ID: ${g.id}\n`;
    });

    await sendToChat(sock, jid, { message: groupList });
  } catch (err) {
    await sendToChat(sock, sock.user?.id, { message: '❌ Failed to fetch group list.' });
    console.error('listGroupsCommand error:', err);
  }
}
module.exports = listGroupsCommand;
