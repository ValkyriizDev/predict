const Eris = require("eris");
const database = require("./src/database.js")
const predict = require("./src/predict.js")
const language = require("./src/language.js")
const setTimeout = require("safe-timers").setTimeout

const crashPredict = new predict.crash()
const towersPredict = {}
const roulettePredict = new predict.roulette()
const minesPredict = {}
const data = new database()

const sites = ["bloxflip", "rblxwild"]
//CONSTANTS, YOU MUST EDIT THESE!!!!
const memberRole = "11070216327417049168"
const indigoGuildID = "11070217204215316551"
const admins = [
//discord user ids
//define a new admin with "userid",
    "♦ACE♣#525",
    "admin two",
    "admin three",
    "admin four",
]

const embedTemplate = language.embedTemplate
const antiServerEmbed = language.antiServerEmbed
const pricesEmbed = language.pricesEmbed
const siteEmbed = language.siteEmbed
const noLogEmbed = language.noLogEmbed
const noSubEmbed = language.noSubEmbed
const faqEmbed = language.faqEmbed

const bot ="lala.lala.lalala"
const bot = new Eris(bot, {
    intents: [
        "guildMessages", "directMessages"
    ]
});

function timeUntil(ms) {
    if (ms == Infinity) {
        return `You have a lifetime subscription, there's nothing to worry about.`
    }
    ms -= Date.now()
    const sec = Math.floor((ms / 1000) % 60)
    const min = Math.floor((ms / (1000 * 60)) % 60)
    const hrs = Math.floor((ms / (1000 * 60 * 60)) % 24)
    const days = Math.floor((ms / (1000 * 60 * 60 * 24)))

    return `**${sec}** seconds, **${min}** minutes, **${hrs}** hours, **${days}** days`
}

const clientSeedCheck = [
    (cS) => { //bloxflip
        if (cS == null) {
            return {
                name: "Error",
                value: "No client seed has been provided"
            }
        }
        //very readable :-)
        if(cS.split(/-/g)[0].length == 8 && cS.split(/-/g)[1].length == 4 && cS.split(/-/g)[2].length == 4 && cS.split(/-/g)[3].length == 4 && cS.split(/-/g)[4].length == 12) {
            return null
        } else {
            return {
                name: "Error",
                value: "The provided client seed doesn't seem to be valid."
            }
        }
    },
    (cS) => {
        if (cS == null) {
            return {
                name: "Error",
                value: "No client seed has been provided"
            }
        }
        if (cS.length == 16) {
            return null
        } else {
            return {
                name: "Error",
                value: "The provided client seed doesn't seem to be valid."
            }
        }
    }
]


async function checkForSubscriptionEnd() {
    for (var i = 0; i < Object.keys(data.users).length; i++) {
        if (data.readUser(Object.keys(data.users)[i],"membershipTime") < Date.now()) {
            try {
                await bot.removeGuildMemberRole(indigoGuildID, Object.keys(data.users)[i], memberRole)
            } catch (e) {
                console.log("tried to remove a role from a possible admin\nuser id: "+ Object.keys(data.users)[i])
                console.log(e)
            }
        }
        const length = data.readUser(Object.keys(data.users)[i],"membershipTime") - Date.now()
        if (length != Infinity) {
            setTimeout(async () => {
                try {
                    if (Object.keys(data.users)[i])
                        await bot.removeGuildMemberRole(indigoGuildID, Object.keys(data.users)[i], memberRole)
                } catch (e) {
                }
            }, length)
        }
    }
}
async function addSubscriptionRole(id, length) {
    try {
        await bot.addGuildMemberRole(indigoGuildID, id, memberRole)
    } catch (e) {
        console.log("couldn't add role\nuser id: "+ id)
        console.log(e)
    } finally {
        if (length != Infinity) {
            setTimeout(async () => {
                await bot.removeGuildMemberRole(indigoGuildID, id, memberRole)
            }, length)
        }
    }

}

bot.on("ready", async () => { // When the bot is ready
    console.log("Ready!"); // Log "Ready!"
    await checkForSubscriptionEnd()
});

bot.on("error", (err) => {
  console.error(err); // or your preferred logger
});

bot.on("messageCreate", (msg) => { // When a message is created
    const isAdmin = admins.includes(msg.author.id)
    const args = msg.content.split(/ /g)

    if (!(!data.readUser(msg.author.id,"membershipTime") || data.readUser(msg.author.id,"membershipTime") < Date.now())) {
        if (data.readUser(msg.author.id, "site") == undefined) {
            data.setUser(msg.author.id, "site", 0)
        }
    }

    if (!!!msg.guildID && bot.user.id != msg.author.id) {
        console.log(msg.author.username + "#" +msg.author.discriminator + `(${msg.author.id})`)
        console.log(msg.content.split(/\n/g)[0])
        console.log()
    }

    if (isAdmin && (msg.content.startsWith(".cC") || msg.content.startsWith(".create"))) {
        const output = data.createVoucher(args[1])

        const embed = embedTemplate()
        embed.fields = [
            {
                name: output.success ? "Success" : "Error",
                value: output.message
            }
        ]
        bot.createMessage(msg.channel.id, { embed: embed });
    }

    if (isAdmin && msg.content.startsWith(".exitWithoutFuckingUp")) {
        process.exit()
    }

    if (isAdmin && msg.content.startsWith(".faq")) {
        return bot.createMessage(msg.channel.id, { embed: faqEmbed });
    }

    if (isAdmin && msg.content.startsWith(".prices")) {
        return bot.createMessage(msg.channel.id, { embed: pricesEmbed });
    }

    if (msg.content.startsWith(".status")) {
        const output = data.getUser(msg.author.id).membershipTime
        const embed = embedTemplate()
        
        if (!data.readUser(msg.author.id,"membershipTime") || data.readUser(msg.author.id,"membershipTime") < Date.now()) {
            return bot.createMessage(msg.channel.id, { embed: noSubEmbed });
        } else {
            embed.fields = [
                {
                    name: "Your subscription expires in",
                    value: timeUntil(output)
                }
            ]
        }
        bot.createMessage(msg.channel.id, { embed: embed });

    }

    if (msg.content.startsWith(".claim")) {
        const fV = data.findVoucher(args[1])
        if (fV.success == undefined) {
            addSubscriptionRole(msg.author.id, fV.time)
        }

        const output = data.redeemVoucher(msg.author.id, args[1])

        const embed = embedTemplate()
        embed.fields = [
            {
                name: output.success ? "Success" : "Error",
                value: output.message
            }
        ]
        bot.createMessage(msg.channel.id, { embed: embed });
    }

    if (msg.content.startsWith(".towers")) {
        if (!data.readUser(msg.author.id,"membershipTime") || data.readUser(msg.author.id,"membershipTime") < Date.now())
            return bot.createMessage(msg.channel.id, { embed: noSubEmbed });

        if (!data.readUser(msg.author.id, "username")) {
            return bot.createMessage(msg.channel.id, { embed: noLogEmbed });
        }

        if (!!msg.guildID) {
            return bot.createMessage(msg.channel.id, { embed: antiServerEmbed });
        }

        const cSCheckResult = clientSeedCheck[data.readUser(msg.author.id, "site")](args[1])
        if (cSCheckResult != null) {
            var embed = embedTemplate()
            embed.fields = [cSCheckResult]
            return bot.createMessage(msg.channel.id, { embed: embed });
        }

        if (!towersPredict[msg.author.id])
            towersPredict[msg.author.id] = new predict.towers()

        const p = towersPredict[msg.author.id].predict()
        
        var embed = embedTemplate()
        embed.fields = towersPredict[msg.author.id].embed()
        if (data.readUser(msg.author.id,"site") == 1) {
            embed = siteEmbed
        }
        bot.createMessage(msg.channel.id, { embed: embed });
    }

    if (msg.content.startsWith(".crash")) {
        if (!data.readUser(msg.author.id,"membershipTime") || data.readUser(msg.author.id,"membershipTime") < Date.now())
            return bot.createMessage(msg.channel.id, { embed: noSubEmbed });

        if (!!msg.guildID) {
            return bot.createMessage(msg.channel.id, { embed: antiServerEmbed });
        }

        const p = crashPredict.predict()

        var embed = embedTemplate()
        embed.fields = crashPredict.embed()
        bot.createMessage(msg.channel.id, { embed: embed });
    }

    if (msg.content.startsWith(".roulette")) {
        if (!data.readUser(msg.author.id,"membershipTime") || data.readUser(msg.author.id,"membershipTime") < Date.now())
            return bot.createMessage(msg.channel.id, { embed: noSubEmbed });

        if (!!msg.guildID) {
            return bot.createMessage(msg.channel.id, { embed: antiServerEmbed });
        }

        const p = roulettePredict.predict()

        var embed = embedTemplate()
        embed.fields = roulettePredict.embed()
        if (data.readUser(msg.author.id,"site") == 1) {
            embed = siteEmbed
        }
        bot.createMessage(msg.channel.id, { embed: embed });
    }

    if (msg.content.startsWith(".mines")) {
        if (!data.readUser(msg.author.id,"membershipTime") || data.readUser(msg.author.id,"membershipTime") < Date.now())
            return bot.createMessage(msg.channel.id, { embed: noSubEmbed });

        if (!data.readUser(msg.author.id, "username")) 
            return bot.createMessage(msg.channel.id, { embed: noLogEmbed });

        if (!!msg.guildID) {
            return bot.createMessage(msg.channel.id, { embed: antiServerEmbed });
        }

        const cSCheckResult = clientSeedCheck[data.readUser(msg.author.id, "site")](args[2])
        if (cSCheckResult != null) {
            var embed = embedTemplate()
            embed.fields = [cSCheckResult]
            return bot.createMessage(msg.channel.id, { embed: embed });
        }

        if (!minesPredict[msg.author.id])
            minesPredict[msg.author.id] = new predict.mines()

        const p = minesPredict[msg.author.id].predict(parseInt(args[1]))

        var embed = embedTemplate()
        embed.fields = minesPredict[msg.author.id].embed()
        bot.createMessage(msg.channel.id, { embed: embed });
    }

    if (msg.content.startsWith(".site")) {
        if (!data.readUser(msg.author.id,"membershipTime") || data.readUser(msg.author.id,"membershipTime") < Date.now())
            return bot.createMessage(msg.channel.id, { embed: noSubEmbed });

        const embed = embedTemplate()
        var site
        if (args[1]) {
            if (args[1] == "bloxflip")
                site = 0
            if (!site && args[1] == "rblxwild")
                site = 1
            //part 2
            if (!site && args[1].includes("blox") || args[1].includes("flip"))
                site = 0
            if (!site && args[1].includes("rblx") || args[1].includes("wild"))
                site = 1
            //part 3
            if (!site && args[1].startsWith("b"))
                site = 0
            if (!site && args[1].startsWith("r"))
                site = 1

            data.setUser(msg.author.id, "site", site)

            if (site == undefined) {
                embed.fields = [{
                    name: "Error",
                    value: "Couldn't find the specified site. try typing `bloxflip` or `rblxwild`"
                }]
            } else {
                embed.fields = [{
                    name: "Success",
                    value: "You are currently predicting " + sites[site]
                }]
            }
        } else {
            embed.fields = [{
                name: "No changes have been made",
                value: "You are currently predicting " + sites[data.readUser(msg.author.id, "site")]
            }]
        }

        bot.createMessage(msg.channel.id, { embed: embed });
    }

    if (msg.content.startsWith(".username")) {
        const embed = embedTemplate()
        if (!args[1]) {
            embed.fields = [{
                name: "No changes have been made",
                value: "Indigo is currently predicting for " + data.readUser(msg.author.id, "username")
            }]
            if (!data.readUser(msg.author.id, "username")) {
                embed.fields[0].value = "You haven't specified an username yet"
            }
        }
        else if (args[1].length < 3) {
            embed.fields = [{
                name: "Error",
                value: "Roblox doesn't support usernames with less than 3 characters."
            }]
        }
        else if (args[1].length > 20) {
            embed.fields = [{
                name: "Error",
                value: "Roblox doesn't support usernames with more than 20 characters."
            }]
        }
        else {
            embed.fields = [{
                name: "Success!",
                value: "Indigo is currently predicting for "+args[1]
            }]
        }
        data.setUser(msg.author.id, "username", args[1])
        bot.createMessage(msg.channel.id, { embed: embed });
    }

    if (msg.content === ".help") {
        const embed = embedTemplate()
        embed.fields = [{
            name: ".mines <amount of mines> <client seed>",
            value: "Predicts the outcome of the next game of mines",
        }, {
            name: ".towers <client seed>",
            value: "Predicts the outcome of the next game of towers",
        }, {
            name: ".crash",
            value: "Predicts the outcome of the next game of crash"
        }, {
            name: ".roulette",
            value: "Predicts the outcome of the next game of roulette"
        }, {
            name: ".username <name>",
            value: "Sets the predictor to make predictions for an exact username.",
        }, {
            name: ".site <name>",
            value: "Sets the predictor for an exact site (**bloxflip** or **rblxwild**)",
        }, {
            name: ".claim <code>",
            value: "Claims the code and gives you a subscription (if the code is valid)"
        }, {
            name: ".status",
            value: "Shows the status of your active subscription"
        }, {
            name: ".help",
            value: "Shows this message"
        }]
        bot.createMessage(msg.channel.id, { embed: embed });
    }

});

bot.connect(MTAxNzIwNzYzOTA2NDcyMzQ4Nw.GZ2GXg.aEjIEe9RzNDQ7ugrlW1EZ_Ly6n6ZL8f0Dvh8dI); // Get the bot to connect to Discord
