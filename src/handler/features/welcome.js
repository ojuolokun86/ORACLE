const { getWelcomeSettings } = require('../../database/welcomeDb');
const sendToChat = require('../../utils/sendToChat');

async function handleGroupParticipantsUpdate(sock, update) {
  const groupId = update.id;
  const botId = sock.user.id.split(':')[0];

  const settings = getWelcomeSettings(groupId, botId);
   const groupMetadata = await sock.groupMetadata(groupId);
    const groupName = groupMetadata.subject;
    const groupDesc = groupMetadata.desc;
    const membersCount = groupMetadata.participants.length;

    for (const participant of update.participants) {
    const username = participant.split('@')[0];

    if (update.action === 'add' && settings.welcome) {
        await sendToChat(sock, groupId, {
        message: `🎉 *Welcome to the squad, @${username}!* 🎉

    We're hyped to have you here in *${groupName || 'Unknown'}*! 💬

    🌟 Here’s what we do:
    • 🤝 Make friends
    • 💡 Share ideas
    • 😂 Laugh a lot
    • 📢 Stay updated

    📌 *Group Description:*
    _${groupDesc || 'A place for good vibes, fun talks, and great connections. Respect everyone and keep it clean!'}_

    📜 *Group Rules:*
    1️⃣ No spam or ads  
    2️⃣ Be respectful  
    3️⃣ Use English  
    4️⃣ Have fun responsibly!

    👥 You are member number *${membersCount}* in this group!

    💬 Feel free to introduce yourself and say hi!  

    🚀 Let's make memories together!`,
        mentions: [participant]
        });
    }

    if (update.action === 'remove' && settings.goodbye) {
        const groupMetadata = await sock.groupMetadata(groupId);
        const remainingCount = groupMetadata.participants.length;

        const goodbyeMessages = [
            `😱 @${username} got scared of our vibes and ran away! We’re now *${remainingCount}* survivors.`,
            `👻 @${username} vanished mysteriously. Only *${remainingCount}* legends remain!`,
            `🚪 @${username} couldn’t handle the heat. We’re *${remainingCount}* strong and still wild!`,
            `😜 Bye @${username}! Another one bites the dust. *${remainingCount}* of us still rockin’!`
        ];

        const randomGoodbye = goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)];

        await sendToChat(sock, groupId, {
            message: randomGoodbye,
            mentions: [participant]
        });


    }
  }
}

module.exports = handleGroupParticipantsUpdate;