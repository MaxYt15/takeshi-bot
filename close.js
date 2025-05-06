module.exports = {
  name: "cerrargrupo",
  description: "Fecha o grupo para que apenas os administradores possam enviar mensagens.",
  commands: ["cerrargrupo", "close"],
  usage: "!cerrargrupo",
  handle: async ({
    args,
    isReply,
    socket,
    remoteJid,
    replyJid,
    userJid,
    sendReply,
    sendErrorReply,
  }) => {
    try {
      if (!remoteJid.endsWith("@g.us")) {
        return await sendErrorReply("❌ Este comando só funciona em grupos.");
      }

      const groupMetadata = await socket.groupMetadata(remoteJid);
      const participants = groupMetadata.participants;
      const botJid = socket.user.id.split(":")[0] + "@s.whatsapp.net";

      // Verificar se o remetente é administrador
      const senderId = isReply ? replyJid : userJid;
      const sender = participants.find((p) => p.id === senderId);
      const isSenderAdmin = sender?.admin === "admin" || sender?.admin === "superadmin";

      if (!isSenderAdmin) {
        return await sendErrorReply("❌ Este comando só pode ser usado por administradores.");
      }

      // Verificar se o bot é administrador
      const isBotAdmin = participants.some((p) => p.id === botJid && p.admin === "admin");

      if (!isBotAdmin) {
        return await sendErrorReply("❌ Não sou administrador, não posso fechar o grupo.");
      }

      // Verificar se o grupo já está fechado
      if (groupMetadata.announce) {
        return await sendReply("⚠️ O grupo já está fechado. Não é necessário fechá-lo novamente.");
      }

      // Fechar o grupo
      await socket.groupSettingUpdate(remoteJid, "announcement");

      // Obter os IDs de todos os membros para mencioná-los
      const mentions = participants.map(({ id }) => id);

      // Construir a mensagem com menção oculta a todos
      const senderName = senderId.split("@")[0];
      const message = `

 ❖ 𝙊 𝙂𝙍𝙐𝙋𝙊 𝙁𝙊𝙄 𝙁𝙀𝘾𝙃𝘼𝘿𝙊 ❖
╼╾╼╾╼╾╼╾╼╾╼╾╼╾╼╾╼╾╼╾╼╾╼╾╼
 ➥ 𝙁𝙀𝘾𝙃𝘼𝘿𝙊 𝙋𝙊𝙍: @${senderName}
  
 𓆩 𝘼𝙋𝙀𝙉𝘼𝙎 𝙊𝙎 𝘼𝘿𝙈𝙄𝙉𝙄𝙎𝙏𝙍𝘼𝘿𝙊𝙍𝙀𝙎 𝙋𝙊𝘿𝙀𝙈 𝙀𝙉𝙑𝙄𝘼𝙍 𝙈𝙀𝙉𝙎𝘼𝙂𝙀𝙉𝙎 𝘼𝙂𝙊𝙍𝘼 𓆪`;

      // Enviar a mensagem mencionando todos ocultamente
      await socket.sendMessage(remoteJid, {
        text: message,
        mentions: mentions,
      });
    } catch (error) {
      console.error("Erro ao executar o comando `cerrargrupo`:", error);
      await sendErrorReply("❌ Ocorreu um erro ao fechar o grupo.");
    }
  },
};
