const embedTemplate = () => {
    return {
        thumbnail: {
            url: "https://media.discordapp.net/attachments/1009242757413474365/1009834266626113676/Star_Transparent.png?width=657&height=657",
        },
        title: "star predictor", // Title of the embed
        color: 0xdb5a60, // Color, either in hex (show), or a base-10 integer
        footer: { // Footer text
            text: "buy @ discord.gg/predictor"
        }
    }
}

const siteEmbed = embedTemplate()
siteEmbed.fields = [
    {
        name: "Error",
        value: "Your site doesn't support this minigame.\ntry the `.site` command."
    }
]

const noSubEmbed = embedTemplate()
noSubEmbed.fields = [
    {
        name: "Error",
        value: "You don't have an active subscription."
    }
]

const noLogEmbed = embedTemplate()
noLogEmbed.fields = [
    {
        name: "Error",
        value: "Please use the .username command before executing this command."
    }
]

const faqEmbed = embedTemplate()
faqEmbed.title += " frequently asked questions"
faqEmbed.fields = [
    {
        name:"no", value:"no"
    }

]

const pricesEmbed = embedTemplate()
pricesEmbed.title += " prices"
pricesEmbed.fields = [
    {
        name:"no", value:"no"
    }
]

const antiServerEmbed = embedTemplate()
antiServerEmbed.fields = [
    {
        name: "Error",
        value: "This command works only in direct messages."
    }
]

module.exports = {
    embedTemplate: embedTemplate,
    antiServerEmbed: antiServerEmbed,
    pricesEmbed: pricesEmbed,
    siteEmbed: siteEmbed,
    noLogEmbed: noLogEmbed,
    faqEmbed: faqEmbed,
    noSubEmbed: noSubEmbed
}
