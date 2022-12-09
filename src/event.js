'use strict'

/*
    An "event" is an instant, paired with any (perhaps multiple) of:
        - a message
        - some number of objects
        - some number of errors.
*/

module.exports = class LogEvent {
    constructor ( lvl, ...dat ) {
        if ( typeof dat[ 0 ] === 'string' ) {
            this.msg = dat.shift()
        } else {
            this.msg = ''
        }
    
        this.ts = Date.now()
        this.lvl = lvl
        this.dat = {}
        this.err = []

        // Split stack traces into array-of-strings.
        for ( let obj of dat ) {
            if ( obj instanceof Error ) {
                const err = {
                    stk : obj.stack.split( "\n" )
                }
                this.msg ||= err.stk.shift()
                this.err.push( err )
            } else if ( typeof obj === 'object' ) {
                Object.assign( this.dat, obj )
            }
        }
        if ( !Object.keys( this.dat ).length )
            delete this.dat
        if ( !this.err.length )
            delete this.err
    }
}

