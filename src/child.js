'use strict'
const LogContext = require( './context' )
const LogEvent = require( './event' )
const LEVELS = require( './levels' )

/*
    A "LogChild" is a flyweight/facade for an instance of `Log`,
    using `LogContext`.
*/

function LogChild ( parent, ctx ) {
    this._parent = parent
    this._context = ctx
}

LogChild.prototype.write = function ( ev ) {
    if ( LEVELS[ ev.lvl ] > LEVELS[ this._parent._level ] )
        return
    this._context.apply( ev )
    this._parent._stream.write( this._parent._format( ev ) )
    return this
}

for ( let lvl in LEVELS ) {
    LogChild.prototype[ lvl ] = function ( msg, ...dat ) {
        return this.write( new LogEvent( lvl, msg, ...dat ) )
    }
}

module.exports = LogChild
