/**
 * Sends a restart message to a user's WhatsApp number.
 * @param {Socket} bmm - The WhatsApp socket instance.
 * @param {string} phoneNumber - The user's phone number.
 * @param {boolean} [manual=false] - Whether the restart was user-initiated.
 */
async function sendRestartMessage(bmm, phoneNumber, manual = false) {
  try {
    const text = manual
      ? '🔄 Your bot was restarted by your request from the web dashboard.'
      : '🔄 Your bot was restarted for full initialization.';
    await bmm.sendMessage(`${phoneNumber}@s.whatsapp.net`, { text });
    console.log(`📩 Restart message sent to ${phoneNumber}`);
  } catch (err) {
    console.error('❌ Failed to send restart message:', err.message);
  }
}

/**
 * Restart the bot session for a specific user.
 * @param {Object} params - Restart parameters.
 * @param {string} params.authId - Unique ID for the bot session.
 * @param {string} params.phoneNumber - The WhatsApp phone number.
 * @param {string} [params.country] - Optional country info.
 * @param {string} [params.pairingMethod] - 'qrCode' or 'pairingCode'.
 * @param {function} [params.onStatus] - Optional status callback.
 * @param {function} [params.onQr] - Optional QR callback.
 * @param {function} [params.onPairingCode] - Optional pairing code callback.
 * @param {boolean} [params.manual] - Whether the restart was user-initiated.
 * @returns {Promise<Socket>} - The restarted socket instance.
 */
async function restartBotForUser({
  authId,
  phoneNumber,
  country,
  pairingMethod,
  onStatus,
  onQr,
  onPairingCode,
  manual = false
}) {
  console.log(`⚡⚡ Restarting bot for user ${phoneNumber}...`);
  const { stopBmmBot, startBmmBot } = require('./main');

  // 1. Stop the existing bot session (if any)
  await stopBmmBot(authId, phoneNumber);

  // 2. Wait before restarting (to fully release connection)
  await new Promise(resolve => setTimeout(resolve, 20000));

  // 3. Start new bot session
  const newBmm = await startBmmBot({
    authId,
    phoneNumber,
    country,
    pairingMethod,
    onStatus,
    onQr,
    onPairingCode
  });

  // 4. Send confirmation message from the new socket
  try {
    await sendRestartMessage(newBmm, phoneNumber, manual);
  } catch (err) {
    console.error('❌ Failed to send restart message after reconnect:', err.message);
  }

  return newBmm;
}

module.exports = {
  restartBotForUser,
  sendRestartMessage
};
