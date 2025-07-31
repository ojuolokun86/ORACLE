const sendToChat = require('../../utils/sendToChat');
const {
  getAntilinkSettings,
  incrementWarn,
  resetWarn
} = require('../../database/antilinkDb');
const { markMessageAsBotDeleted } = require('../../utils/botDeletedMessages');

const WA_DEFAULT_LINK_REGEX =  /(https?:\/\/[^\s]+|www\.[^\s]+|wa\.me\/[^\s]+|chat\.whatsapp\.com\/[^\s]+|t\.me\/[^\s]+|bit\.ly\/[^\s]+|[\w-]+\.(com|net|org|info|biz|xyz|live|tv|me|link)(\/\S*)?)/gi;

async function detectAndAct({ sock, from, msg, textMsg }) {
  const groupId = from;
  const botJid = sock.user?.id?.split(':')[0]?.split('@')[0]; // 234xxxx
  const settings = getAntilinkSettings(groupId, botJid);

  // ✅ Correctly extract sender from participant (always fallback safe)
  const userJid = msg.key.participant || msg.participant || msg.participantJid || null;
  if (!userJid) return false;

  // ❌ Skip if conditions not met
  if (settings.mode === 'off') return false;
  if (!WA_DEFAULT_LINK_REGEX.test(textMsg)) return false;
  if (userJid.includes(botJid)) return false;

  console.log(`📛 Link detected in group ${groupId} from user ${userJid}`);
  console.log('⚙️ Antilink Settings:', settings);

  // ✅ Check for group admin if bypass enabled
  if (settings.bypassAdmins) {
    const metadata = await sock.groupMetadata(groupId);
    const isAdmin = metadata.participants?.some(
      p => p.id === userJid && ['admin', 'superadmin'].includes(p.admin)
    );
    if (isAdmin) {
      console.log(`🛡️ Skipped admin: ${userJid}`);
      return false;
    }
  }

  try {
    // 🗑️ Delete the offending message
    await sock.sendMessage(groupId, {
      delete: {
        remoteJid: groupId,
        fromMe: false,
        id: msg.key.id,
        participant: userJid
      }
    });
    markMessageAsBotDeleted(msg.key.id);

    // 🔁 Handle warning modes
    if (settings.mode === 'warn-remove') {
  const warnCount = incrementWarn(groupId, botJid, userJid);
  const warnLimit = settings.warnLimit || 2;

  await sendToChat(sock, groupId, {
    message: `⚠️ @${userJid.split('@')[0]} posted a link!\nWarning ${warnCount}/${warnLimit}.`,
    mentions: [userJid]
  });

  if (warnCount >= warnLimit) {
    await sock.groupParticipantsUpdate(groupId, [userJid], 'remove');
    await sendToChat(sock, groupId, {
      message: `🚫 @${userJid.split('@')[0]} removed after ${warnCount} warnings.`,
      mentions: [userJid]
    });
    resetWarn(groupId, botJid, userJid);
  }
} else if (settings.mode === 'warn') {
  await sendToChat(sock, groupId, {
    message: `⚠️ @${userJid.split('@')[0]} posted a link! Links are not allowed here.`,
    mentions: [userJid]
  });
} else if (settings.mode === 'remove') {
      await sock.groupParticipantsUpdate(groupId, [userJid], 'remove');
      await sendToChat(sock, groupId, {
        message: `🚫 @${userJid.split('@')[0]} sent a link and was removed immediately.`,
        mentions: [userJid]
      });
    }

    return true;
  } catch (err) {
    console.error('❌ Error in antilink enforcement:', err.message);
  }

  return false;
}

module.exports = detectAndAct;
