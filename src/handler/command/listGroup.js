const  sendToChat  = require('../../utils/sendToChat');
async function listGroupsCommand(sock, msg) {
  try {
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
