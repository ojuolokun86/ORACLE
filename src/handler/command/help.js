// help.js

const helpText = `
╭━━〔 🤖 *BMM DEV V2 Help* 〕━━┈⊷

This bot supports a wide range of commands for group management, moderation, fun, and more.
*Reply with .menu to see numbers for quick access!*

────────────────────
⚙️ *Core Commands*
- ping — Check if the bot is alive and measure response time.
- settings — Show or change bot settings.
- prefix — Change the command prefix for this bot.
- mode — Switch between public/admin/owner mode.
- menu — Show the interactive menu.
- info — Show bot/server/system info.

────────────────────
🛡️ *Moderation & Safety*
- antilink — Block WhatsApp/other links in group chats.
- resetwarn — Reset a user's warning count (admin/owner only).
- warnlist — Show the warning list for the group.
- antidelete — Restore deleted messages in group/private chats.
- privacy — Configure privacy settings for the bot.
- disappearing — Enable/disable disappearing messages in group.
- viewonce — Bypass WhatsApp's view-once restriction for media.
- mute — Mute the group (no member can send messages).
- unmute — Unmute the group.
- lockinfo — Lock group info so only admins can edit.
- unlockinfo — Unlock group info for all members.
- add — Add a member to the group.
- kick — Remove a member from the group.
- promote — Promote a member to admin.
- demote — Demote an admin to member.
- requestlist — View pending group join requests.
- acceptall — Accept all join requests.
- rejectall — Reject all join requests.
- presence — Show who is online in the group.

────────────────────
👥 *Group & Member Commands*
- listgroup — List all groups the bot is in.
- welcome — Configure welcome/goodbye messages.
- tag — Mention all group members (plain).
- tagall — Mention all group members (with tags).
- poll — Create a poll in the group.
- group desc — Set the group description.
- group pic — Change the group picture (reply to an image).
- group link — Get the group invite link.
- group stats — Show 30-day group activity stats.
- group revoke — Revoke and refresh the group invite link.

────────────────────
🎉 *Fun & Media*
- sticker — Create a sticker from an image or video.
- stimage — Convert a sticker to an image.
- stgif — Convert an animated sticker to a GIF.
- ss — Take a screenshot of a website.
- react — React to a message with a random emoji.
- status — Download WhatsApp status updates.

────────────────────

*How to use:*
- Type a command (e.g. .antidelete) in a group or DM.
- For group subcommands, use: .group <subcommand>
  Example: .group stats, .group desc Hello, .group pic (reply to image)
- For more details on any command, type: .help <command>
- Use .menu for a quick numbered menu.

*Need support?* Follow our channel for updates & help!

`;

async function help(sock, chatId, message) {
  await sock.sendMessage(chatId, { text: helpText }, { quoted: message });
}

module.exports = {
  help
};