const commandEmojis = {
  // Core Commands
  ping: '🏓',
  settings: '🧰',
  prefix: '🔤',
  mode: '🔄',
  help: '📚',
  menu: '📚',
  info: 'ℹ️',

  // Moderation Tools
  antilink: '🧨',
  resetwarn: '🧹',
  warnlist: '📑',
  antidelete: '🕵️‍♂️',

  // Bot Commands
  listgroup: '🗂️',
  status: '📶',
  vv: '👁️',
  view: '📤',
  react: '😹',
  online: '👥',
  privacy: '🔐',
  disappear: '⌛',
  setprofile: '🧑‍🎨',

  // Group Controls
  welcome: '🎉',
  tag: '🗣️',
  tagall: '📢',
  mute: '🔇',
  unmute: '🔊',
  lockinfo: '🛑',
  unlockinfo: '🆓',
  add: '➕',
  kick: '➖',
  promote: '🆙',
  demote: '🧍',
  requestlist: '📬',
  acceptall: '✅',
  rejectall: '❌',
  poll: '📊',
  'group desc': '📝',
  'group pic': '🖼️',
  'group link': '🔗',
  'group stats': '📈',
  'group revoke': '🚫',

  // Fun & Media
  sticker: '🖼️',
  stimage: '🖼️',
  stgif: '🖼️',
  ss: '🌐',
  report: '📣'
};

const randomEmojis = ['🤖', '✨', '🎲', '🚀', '💡', '🎯', '🧠', '🎉', '⚙️', '💥'];

function getEmojiForCommand(command) {
  return (
    commandEmojis[command] ||
    randomEmojis[Math.floor(Math.random() * randomEmojis.length)]
  );
}

module.exports = { getEmojiForCommand };
