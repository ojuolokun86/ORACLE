const sendToChat = require('../../utils/sendToChat');
const { getContextInfo, getForwardedContext } = require('../../utils/contextInfo');


const replyNumberMap = {
  // Core Commands
  '1': 'ping',
  '2': 'settings',
  '3': 'prefix',
  '4': 'mode',
  '5': 'help',
  '6': 'menu',
  '7': 'info',

  // Moderation & Security
  '8': 'antilink',
  '9': 'resetwarn',
  '10': 'warnlist',
  '11': 'antidelete',
  '12': 'privacy',
  '13': 'disappear',

  // Group Management
  '14': 'listgroup',
  '15': 'welcome',
  '16': 'tag',
  '17': 'tagall',
  '18': 'mute',
  '19': 'unmute',
  '20': 'lockinfo',
  '21': 'unlockinfo',
  '22': 'add',
  '23': 'kick',
  '24': 'kick inactive',
  '25': 'promote',
  '26': 'demote',
  '27': 'requestlist',
  '28': 'acceptall',
  '29': 'rejectall',
  '30': 'poll',
  '31': 'group desc',
  '32': 'group pic',
  '33': 'group link',
  '34': 'group stats',
  '35': 'group revoke',
  '36': 'listinactive',

  // Media & Fun
  '37': 'sticker',
  '38': 'stimage',
  '39': 'stgif',
  '40': 'ss',
  '41': 'imagine',
  '42': 'song',
  '43': 'play',

  // Utilities
  '44': 'status',
  '45': 'vv',
  '46': 'view',
  '47': 'online',
  '48': 'setprofile'
};

const getMainMenu = (prefix = '.', ownerName = 'Unknown', mode = 'private', phoneNumber = 'Unknown', version = 'Unknown') => `
╭━━〔 🤖 *BMM MENU* 〕━━┈⊷
┃👑 Owner: _${ownerName}_
┃🛠️ Prefix: _${prefix}_
┃⚙️ Mode: _${mode}_
┃📱 Number: _${phoneNumber}_
┃📚 Version: _${version}_
╰━━━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 ⚙️ *Core Commands* 〕━━┈⊷
┃◈ 🏓 ping **1**
┃◈ 🧰 settings **2**
┃◈ 🔤 prefix **3**
┃◈ 🔄 mode **4**
┃◈ 📚 help **5**
┃◈ 📚 menu **6**
┃◈ ℹ️ info **7**
╰━━━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🛡️ *Moderation & Security* 〕━━┈⊷
┃◈ 🧨 antilink **8**
┃◈ 🧹 resetwarn **9**
┃◈ 📑 warnlist **10**
┃◈ 🕵️‍♂️ antidelete **11**
┃◈ 🔐 privacy **12**
┃◈ ⌛ disappear **13**
╰━━━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🧰 *Group Management* 〕━━┈⊷
┃◈ 🗂️ listgroup **14**
┃◈ 🎉 welcome **15**
┃◈ 🗣️ tag **16**
┃◈ 📢 tagall **17**
┃◈ 🔇 mute **18**
┃◈ 🔊 unmute **19**
┃◈ 🛑 lockinfo **20**
┃◈ 🆓 unlockinfo **21**
┃◈ ➕ add **22**
┃◈ ➖ kick **23**
┃◈ 💤 kick inactive **24**
┃◈ 🆙 promote **25**
┃◈ 🧍 demote **26**
┃◈ 📬 requestlist **27**
┃◈ ✅ acceptall **28**
┃◈ ❌ rejectall **29**
┃◈ 📊 poll **30**
┃◈ 📝 group desc **31**
┃◈ 🖼️ group pic **32**
┃◈ 🔗 group link **33**
┃◈ 📈 group stats **34**
┃◈ 🚫 group revoke **35**
┃◈ 💤 listinactive **36**
╰━━━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🎨 *Media & Fun* 〕━━┈⊷
┃◈ 🖼️ sticker **37**
┃◈ 🖼️ stimage **38**
┃◈ 🖼️ stgif **39**
┃◈ 🌐 ss **40**
┃◈ 🎨 imagine **41**
┃◈ 🎵 song **42**
┃◈ ▶️ play **43**
╰━━━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 📊 *Utilities* 〕━━┈⊷
┃◈ 📶 status **44**
┃◈ 👁️ vv **45**
┃◈ 📤 view **46**
┃◈ 👥 online **47**
┃◈ 🧑‍🎨 setprofile **48**
┃◈ 📣 report **49**
╰━━━━━━━━━━━━━━━━━━━━━━━┈⊷

📩 *Reply with a number or command name to run it.*
*Type .help <command> for details on any command.*
`;


process.env.VERSION;

async function menu(sock, chatId, message, prefix, ownerName, mode, phoneNumber) {
  const menuText = getMainMenu(prefix, ownerName, mode, phoneNumber, process.env.VERSION);
  const contextInfo = {
  ...getContextInfo(),
  ...getForwardedContext()
};
  const sent = await sock.sendMessage(chatId, {
  text: menuText,
  contextInfo,
  quoted: message
});
  const menuMsgId = sent.key.id;

  const listener = async (m) => {
    const { execute } = require('../commandHandler');
    const reply = m.messages?.[0];
    if (!reply || reply.key.remoteJid !== chatId) return;

    const quotedId = reply.message?.extendedTextMessage?.contextInfo?.stanzaId;
    if (quotedId !== menuMsgId) return;

    const text = reply.message?.conversation || reply.message?.extendedTextMessage?.text || '';
    const input = text.trim().toLowerCase();

    // If number → mapped command
    if (replyNumberMap[input]) {
      await execute({
        sock,
        msg: reply,
        textMsg: replyNumberMap[input],
        phoneNumber: null
      });
    }
    // If command name directly
    else {
      await execute({
        sock,
        msg: reply,
        textMsg: input,
        phoneNumber: null
      });
    }

    sock.ev.off('messages.upsert', listener);
  };

  sock.ev.on('messages.upsert', listener);
}

module.exports = { menu };
