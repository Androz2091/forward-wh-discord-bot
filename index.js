import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import config from './config.json' assert { type: "json" };


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('messageCreate', (message) => {

    if (message.author.bot) return;

    const mainChannel = config.channels.find((ch) => ch.channelId == message.channelId);
    if (!mainChannel) return;

    const forwardingChannelsName = mainChannel.forwardingTo;
    const forwardingChannels = client.channels.cache.filter((ch) => ch.isTextBased() && forwardingChannelsName == ch.name);

    forwardingChannels.forEach(async (forwardingChannel) => {
        if (!forwardingChannel.isTextBased()) return;
        const webhooks = await forwardingChannel.fetchWebhooks();
        let forwardingWebhook = webhooks.find((wh) => wh.name == 'Forwarding Bot');
        if (!forwardingWebhook) {
            console.log('Webhook not found, creating...');
            const webhook = await forwardingChannel.createWebhook({
                name: 'Forwarding Bot'
            });
            console.log('Webhook created:', webhook);
            forwardingWebhook = webhook;
        }

        const messageContent = message.content;
        const messageAttachments = message.attachments.map((attachment) => attachment.url);

        const options = {
            username: message.author.displayName,
            avatarURL: message.author.displayAvatarURL(),
            content: messageContent,
            files: messageAttachments
        };

        await forwardingWebhook.send(options);
    });

});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.login(config.token);
