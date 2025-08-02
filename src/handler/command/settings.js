const sendToChat = require('../../utils/sendToChat');
const { getUserSettings } = require('../../utils/settings');
const { isBotOwner } = require('../../database/database');
module.exports = async function settingsCommand(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const botId = sock.user?.id?.split(':')[0]?.split('@')[0];
  const botLid = sock.user?.lid?.split(':')[0]?.split('@')[0];
  const senderId = sender?.split('@')[0];
  const name = sock.user?.name;
  if (!msg.key.fromMe && !isBotOwner(senderId, botId, botLid)) {
    return await sendToChat(sock, from, {
      message: `❌ Only *${name}* can view this bot settings.`
    });
  }
  const settings = getUserSettings(botId, from); // botId = user_id, from = groupId
  const antilink = settings.antilink || {};
  const antidelete = settings.antidelete || {};
  const mode = settings.mode || "unknown";
  const prefix = settings.prefix || ".";
  const owner = settings.ownerName || "Unknown";
  const commandReact = settings.commandReact
  const welcomeSettings = settings.welcomeSettings || {};

  let statusView = "Not configured";
  if (typeof settings.statusView === 'number') {
    if (settings.statusView === 0) statusView = "Off";
    else if (settings.statusView === 1) statusView = "View Only";
    else if (settings.statusView === 2) statusView = "View & React";
  }
  let welcomeText = "Not configured";
    if (typeof welcomeSettings.welcome === 'boolean' && typeof welcomeSettings.goodbye === 'boolean') {
      welcomeText = `Welcome: ${welcomeSettings.welcome ? "🟢 ON" : "🔴 OFF"} | Goodbye: ${welcomeSettings.goodbye ? "🟢 ON" : "🔴 OFF"}`;
    }

//   // Format 1: Box Style
//   const format1 = () => `
// ╔═⟦ BOT SETTINGS ⟧═╗
// ║ Mode:      ${mode}
// ║ Prefix:    ${prefix}
// ║ Owner:     ${owner}
// ╟─⟦ ANTILINK ⟧─────╢
// ║ Status:    ${antilink.mode || 'N/A'}
// ║ Warns:     ${antilink.warnLimit || 'N/A'}
// ║ Admins:    ${antilink.bypassAdmins ? "Bypassed" : "Blocked"}
// ╟─⟦ ANTIDELETE ⟧───╢
// ║ Mode:      ${antidelete.mode || 'N/A'}
// ║ Notify:    ${antidelete.sendToOwner ? "Yes" : "No"}
// ║ Excluded:  ${antidelete.excluded ? "Yes" : "No"}
// ╟─⟦ STATUS VIEW ⟧──╢
// ║ View:      ${statusView}
// ╚══════════════════╝
// `.trim();

  // Format 2: Bold Star Style
//   const format2 = () => `
// ╔═══════ BOT SETTINGS ══════╗
// ║ Mode:    *${mode}*        ║
// ║ Prefix:  *${prefix}*      ║
// ║ Owner:   *${owner}*       ║
// ╠═════ ANTI-LINK ═══════════╣
// ║ Status:  *${antilink.mode || 'N/A'}*         ║
// ║ Warn Limit:    *${antilink.warnLimit || 'N/A'}*    ║
// ║ Bypass Admins: *${antilink.bypassAdmins ? "Yes" : "No"}*       ║
// ╠═════ ANTI-DELETE ══════════════╣
// ║ Mode:          *${antidelete.mode || 'N/A'}*       ║
// ║ Send to Owner: *${antidelete.sendToOwner ? "Yes" : "No"}*     ║
// ║ Excluded:      *${antidelete.excluded ? "Yes" : "No"}*        ║
// ╠═════ STATUS VIEW ══════════════╣
// ║ Status View:   *${statusView}*        ║
// ╚════════════════════════════════╝
// `.trim();

  // Format 3: Simple Style
  const format3 = () => `
======= BOT SETTINGS =======
Mode: *${mode}*
Prefix: *${prefix}*
Owner: ${owner}
React To Command: *${commandReact}*

======= ANTILINK =======
Status: *${antilink.mode || 'N/A'}*
Warn Limit: *${antilink.warnLimit || 'N/A'}*
Bypass Admins: *${antilink.bypassAdmins ? "Yes" : "No"}*

======= ANTIDELETE =======
Mode: *${antidelete.mode || 'N/A'}*
Send to Owner: *${antidelete.sendToOwner ? "Yes" : "No"}*
Excluded: *${antidelete.excluded ? "Yes" : "No"}*

======= STATUS VIEW =======
Status View: *${statusView}*

======= WELCOME/GOODBYE =======
${welcomeText}
`.trim();

  // Pick a random format
  const formats = [format3];
  const randomFormat = formats[Math.floor(Math.random() * formats.length)];
  const text = randomFormat();

  await sendToChat(sock, from, { message: text });
};
