const { EmbedBuilder, Embed } = require('discord.js');
const fs = require('fs');


let stars = [
    "",
    ":star:",
    ":star::star:",
    ":star::star::star:",
    ":star::star::star::star:",
    ":star::star::star::star::star:",
]

module.exports = {
    data: {
        name: 'feedback'
    },
    async execute(interaction, client){
        let designer = parseInt(interaction.fields.getTextInputValue("designer"));
        let delivery = parseInt(interaction.fields.getTextInputValue("delivery"));
        let support = parseInt(interaction.fields.getTextInputValue("support"));
        let comment = interaction.fields.getTextInputValue("comment");

        if( designer == NaN || delivery == NaN || support == NaN ) {
            return;
        }

        client.infoData.ratings.push(designer);
        client.infoData.ratings.push(delivery);
        client.infoData.ratings.push(support);
        client.saveData()

        const emb = new EmbedBuilder()
            .setTitle(`${interaction.user.tag} 💠 Review`)
            .setFooter({text: interaction.user.tag})
            .setColor(0x7B68F7)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp(Date.now())
            .addFields([
                {
                    name: "\n\nRate the work of the designer on a 5-point scale", 
                    value: stars[designer]
                },
                {
                    name: "Rate the quality and delivery time of the service", 
                    value: stars[delivery]
                },
                {
                    name: "Rate support work in progress", 
                    value: stars[support]
                },
                {
                    name: "Your comment about the work of Source Store", 
                    value: comment
                }
            ])

        
        await client.channels.fetch(client.channelsLists.Feedbacks).then( channel => {
            channel.send({
                embeds: [emb] 
            });
        })

        let feedbacks = fs.readFileSync('./data/feedbacks.json');
        feedbacks = JSON.parse(feedbacks);

        let ordersInfo = fs.readFileSync('./data/orders.json');
        ordersInfo = JSON.parse(ordersInfo);

        let order = ordersInfo.find( ord => ord.channel == interaction.channel.id);

        if( order ) {
            await interaction.channel.messages.fetch(order.endMsg).then(async msg => {

                const emb = new EmbedBuilder()
                    .setTitle(`Order・Finished・${interaction.user.username}`)
                    .setDescription(`
                        **Order ID**
                        > ${order.id}
                        **Status**
                        > Finished

                        **Thanks for leaving feedback**
                    `)
                    .setColor(0x7B68F7)
                    .setTimestamp(Date.now())

                await msg.edit({
                    embeds: [emb],
                    content: `${interaction.user}`,
                    components: [],
                })
            })

            feedbacks.push({
                order: order.id,
                work: designer,
                delivery: delivery,
                support: support,
                comment: comment
            })

            fs.writeFileSync('./data/feedbacks.json', JSON.stringify(feedbacks))
        }

        await interaction.reply({
            content: 'Done',
            ephemeral: true
        });
    }
}