'use strict'
const is_fn  = _ => _ instanceof Function
const is_obj = _ => typeof _ === 'object'

/*
    "Context" is either:
        - an object to be `.assign()`'ed to an event, or
        - a function that mutates an event.
    Used in `Log`'s `.child()`.
    Useful for deduplicating information belonging to a group of related events.
*/

module.exports = class LogContext {

    static from ( ...ctx ) {
        return (new LogContext).add( ...ctx )
    }

    constructor ( ...ctx ) {
        this._ctx = []
        this.add( ...ctx )
    }
    
    add ( ...ctx ) {
        for ( let itm of ctx ) {
            if ( itm instanceof LogContext ) {
                this.add( ...itm._ctx )
                continue
            }
            if ( is_fn( itm ) || is_obj( itm ) ) {
                this._ctx.push( itm )
                continue
            }
            throw new Error( "use only objects and functions as context" )
        }
        return this
    }
    
    apply ( ev ) {
        for ( let itm of this._ctx ) {
            if ( is_fn( itm ) )
                itm( ev )
            else
                Object.assign( ev, itm )
        }
        return ev
    }
}
