const fs = require("fs")
const parseTime = {
    "10s": 1000 * 10,
    "30m": 1000 * 60 * 30,
    "1h": 1000 * 60 * 60,
    "12h": 1000 * 60 * 60 * 12,
    "24h": 1000 * 60 * 60 * 24,
    "1m": 1000 * 60 * 60 * 24 * 30,
    "life": Infinity
}

var letters = "qwertzuiopasdfghjklyxcvbnm"
letters += letters.toUpperCase()
letters += "1234567890"

function randomStr(l) {
    var r = ""
    for (var i = 0; i < l; i++) {
        r += letters[Math.floor(Math.random() * letters.length)]
    }
    return r
}

function censor(key, value) {
    if (value == Infinity) {
        return "Infinity";
    }
    return value;
}

class Database {
    constructor() {
        this.users = {}
        this.vouchers = []
        const fromDisk = JSON.parse(fs.readFileSync('db.json', {encoding:'utf8', flag:'r'}), function (key, value) {
            return value === "Infinity" ? Infinity : value;
        })
        this.users = fromDisk.users
        this.vouchers = fromDisk.vouchers
    }
    save() {
        fs.writeFileSync('db.json', JSON.stringify(this, censor, 4));
    }
    createVoucher(length) {
        if (!Object.keys(parseTime).includes(length)) {
            return {
                success: false,
                message: "Couldn't parse time, valid times: " + Object.keys(parseTime).join(", ")
            }
        }

        const v = new Voucher(parseTime[length], randomStr(32))
        this.vouchers.push(v)
        this.save()
        return {
            success: true,
            message: v.name
        }
    }
    findVoucher(toFind) {
        for (var i = 0; i < this.vouchers.length; i++) {
            if (this.vouchers[i].name == toFind) {
                if (this.vouchers[i].used) {
                    return {
                        success: false,
                        message: "The code has already been used."
                    }
                } else {
                    return this.vouchers[i]
                }
            }
        }
        return {
            success: false,
            message: "The code doesn't exist."
        }
    }
    redeemVoucher(userUid, voucherName) {
        if (this.readUser(userUid,"membershipTime") == Infinity)
            return {
                success: false,
                message: "You have a lifetime subscription, no need to redeem another code."
            }
        const voucher = this.findVoucher(voucherName)
        if (!voucher.success && voucher.success != undefined) return voucher
        voucher.used = true
        if (!this.readUser(userUid,"membershipTime") || this.getUser(userUid,"membershipTime") < Date.now()) {
            this.setUser(userUid,"membershipTime", Date.now())
        }
        this.modifyUser(userUid,"membershipTime", voucher.time)
        this.save()
        return {
            success: true,
            message: "You have successfully redeemed this code."
        }
    }
    getUser(uid) {
        if (!this.users[uid]) {
            this.users[uid] = new User()
        }
        return this.users[uid]
    }
    setUser(uid, key, to) {
        this.getUser(uid)[key] = to
        this.save()
    }
    modifyUser(uid, key, by) {
        if (!this.getUser(uid)[key]) {
            this.getUser(uid)[key] = by
        } else {
            this.getUser(uid)[key] += by
        }
        this.save()
    }
    readUser(uid, key) {
        return this.getUser(uid)[key]
    }
}

class User {
    constructor() {
        this.site = 0
    }
}

class Voucher {
    constructor(time, name) {
        this.time = time
        this.name = name
        this.used = false
    }
}

module.exports = Database
