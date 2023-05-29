function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

class crash {
    constructor() {
        this.prediction = null
        this.predictionTime = 0
        this.predictionHold = 0
    }
    predict() {
        if (this.predictionTime + this.predictionHold < Date.now()) {
            this.predictionTime = Date.now()
            this.predictionHold = 1000 + Math.random() * 1000

            this.prediction = {
                accuracy: Math.round(Math.random() * 45 + 52),
                direction: Math.random() > 0.5 ? 0 : 1,
                result:  1.8 + Math.random() * .4
            }
            this.prediction.result = Math.round(this.prediction.result*10)/10
        }
        return this.prediction
    }
    embed() {
        const dirWords = ["under ", "above "]
        return [ // Array of field objects
                {
                    name: "Prediction", // Field title
                    value: dirWords[this.prediction.direction] + this.prediction.result , // Field
                    inline: false // Whether you want multiple fields in same line
                },
                {
                    name: "Accuracy",
                    value: this.prediction.accuracy + "%",
                    inline: false 
                }
        ]
    }
}

class towers {
    constructor() {
        this.prediction = null
        this.predictionTime = 0
        this.predictionHold = 0
    }
    predict() {
        if (this.predictionTime + this.predictionHold < Date.now()) {
            this.predictionTime = Date.now()
            this.predictionHold = 100 + Math.random() * 200

            this.prediction = {
                accuracy: Math.round(Math.random() * 45 + 52),
                result: []
            }
            for (var i = 0; i < 8; i++) {
                const correct = Math.floor(Math.random()*3)
                this.prediction.result[i] = [
                    correct == 0 ? 1 : 0,
                    correct == 1 ? 1 : 0,
                    correct == 2 ? 1 : 0,
                ]
            }
        }
        return this.prediction
    }
    embed() {
        var p = ""
        for (var i = 0; i < this.prediction.result.length; i++) {
            for (var j = 0; j < this.prediction.result[i].length; j++) {
                p += this.prediction.result[i][j] == 1 ? "✅" : "❓"
            }
            p += "\n"
        }

        return [
            {
                name: "Prediction",
                value: p
            },
            {
                name: "Accuracy",
                value: this.prediction.accuracy + "%"
            }
        ]
    }
}

class roulette {
    constructor() {
        this.prediction = null
        this.predictionTime = 0
        this.predictionHold = 0
    }
    predict() {
        if (this.predictionTime + this.predictionHold < Date.now()) {
            this.predictionTime = Date.now()
            this.predictionHold = 1000 + Math.random() * 1000

            this.prediction = {
                accuracy: Math.round(Math.random() * 45 + 52),
                direction: Math.random() > 0.5 ? 0 : 1,
            }
            let total = 100

            this.prediction.result = {}
            this.prediction.result.yellow = Math.floor(5 + Math.random() * 14)
            total -= this.prediction.result.yellow
            this.prediction.result.red = Math.floor(total * (0.10 + Math.random() * 0.8))
            this.prediction.result.purple = Math.floor(total - this.prediction.result.red)
        }
        return this.prediction
    }
    embed() {
        return [ // Array of field objects
                            {
                                name: "Red prediction", // Field title
                                value: this.prediction.result.red + "%", // Field
                                inline: true // Whether you want multiple fields in same line
                            },
                            {
                                name: "Purple prediction", // Field title
                                value: this.prediction.result.purple + "%", // Field
                                inline: true // Whether you want multiple fields in same line
                            },
                            {
                                name: "Yellow prediction", // Field title
                                value: this.prediction.result.yellow + "%", // Field
                                inline: true // Whether you want multiple fields in same line
                            },
                            {
                                name: "Accuracy",
                                value: this.prediction.accuracy + "%",
                                inline: false 
                            }
        ]
    }
}

class mines {
    constructor() {
        this.prediction = null
        this.predictionTime = 0
        this.predictionHold = 0
    }
    predict(mines) {
        if (!parseInt(mines)) {
            this.prediction = {
                success: false,
                message: "Please specify an amount of mines."
            }
            return
        }

        if (mines > 10) {
            this.prediction = {
                success: false,
                message: "Sorry, we don't support predictions for more than 10 mines."
            }
            return
        }
        if (mines < 1) {
            this.prediction = {
                success: false,
                message: "Sorry, we don't support predictions for less than 1 mine."
            }
            return
        }
        mines = Math.max(mines,1)
        const amount = Math.floor((25-mines)/5)

        if (this.predictionTime + this.predictionHold < Date.now()) {
            this.predictionTime = Date.now()
            this.predictionHold = 100 + Math.random() * 200

            this.prediction = {
                accuracy: Math.round((Math.round(Math.random() * 45 + 52)) / (0.75+(Math.exp(amount/15)/4))),
                result: []
            }
            //shit :-D
            for (var i = 0; i < 25; i++) {
                this.prediction.result[i] = i < amount ? 1 : 0
            }
            this.prediction.result = shuffle(this.prediction.result)
        }
        return this.prediction
    }
    embed() {
        if (this.prediction.success == false) {
            return [
            {
                name: "Error",
                value: this.prediction.message
            }
            ]
        }

        var p = ""
        const emojis = ["❓", "✅"]
        for (var i = 0; i < 25; i++) {
            if (i % 5 == 0 && i != 0) p += "\n"
            p += emojis[this.prediction.result[i]]
        }

        return [
            {
                name: "Prediction",
                value: p
            },
            {
                name: "Accuracy",
                value: this.prediction.accuracy + "%"
            }
        ]
    }
}



module.exports = {
    crash: crash,
    towers: towers,
    roulette: roulette,
    mines: mines 
}
