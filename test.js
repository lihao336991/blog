const event = {
    clientList: [],
    listen: function(key , fn) {
        if (this.clientListen[key]) {
            this.clientList[key] = []
        }
        this.clientList[key].push(fn)
    },
    trigger: function() {
        const key = Array.prototype.shift.call(arguments)
        const fns = this.clientList[key]
        if (!fns || fns.length === 0 ) {
            return false
        }
        for (let i = 0, fn ;fn = fns[i++];) {
            fn.apply(this, arguments)
        }
    },
    remove : function(key , fn) {
        const fns = this.clientList[key]
        if (!fns) {
            return false
        }
        if (!fn) {
            fns && (fns.length = 0)
        } else {
            for (let l = fns.length - 1; l>=0; l--) {
                const _fn = fns[l]
                if ( _fn ===fn) {
                    fns.splice(l, 1)
                }
            }
        }
    }
}
const installEvent = (obj) => {
    for (let i in event) {
        obj[i] = event[i]
    }
}