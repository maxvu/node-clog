'use struct'
const LogContext = require( './context' )
const LogEvent = require( './event' )
const LogChild = require( './child' )
const FORMATS = require( './formats' )
const LEVELS = require( './levels' )

function Log ( opts ) {
    opts = opts || {}
    this._context = new LogContext()
    this.level( opts.level || process.env.LOGLEVEL ||
        ( process.env.NODE_ENV === 'production' ? 'info' : 'debug' ) )
    this.format( opts.format || process.env.LOGFORMAT ||
        ( process.env.NODE_ENV === 'production' ? 'json.plain' : 'text.pretty' ) )
    this.stream( opts.stream || process.stderr )

    if ( opts.context )
        this._context.add( opts.context )

    // By default, bind to various Node and process events.
    if ( opts.bind_process_events !== false ) {
        process.on( 'uncaughtException', ( err ) => {
            this.fatal( err )
            process.exit( 8 )
        } )
            process.on( 'unhandledRejection', ( err ) => {
            this.fatal( err )
            process.exit( 8 )
        } )
        process.on( 'warning', err => this.warn( err ) )
        process.on( 'SIGINT', () => this.warn( 'received SIGINT' ) )
        process.on( 'SIGTERM', () => this.warn( 'received SIGTERM' ) )
        process.once( 'exit', ( code ) =>
            this.info( `exiting with code ${code}` ) )
    }
}

// Retrieve or replace the output stream.
Log.prototype.stream = function ( new_stream = null ) {
    if ( new_stream === null )
        return this._stream
    if ( typeof new_stream !== 'object' )
        throw new Error( 'non-object stream provided' )
    if ( !new_stream.write )
        throw new Error( 'no .write() on stream' )
    if ( !( new_stream.write instanceof Function ) )
        throw new Error( 'invalid stream' )
    this._stream = new_stream
    return this
}

// Retrieve or replace the log format.
// Can either be a function or the name of one in `formats/`.
Log.prototype.format = function ( new_format = null ) {
    if ( new_format === null )
        return this._format
    if ( typeof new_format === 'string' ) {
        if ( !( new_format in FORMATS ) )
            throw new Error( `unknown format' ${new_format}'` )
        new_format = FORMATS[ new_format ]
    }
    if ( !( new_format instanceof Function ) )
        throw new Error( "non-callable format" )
    this._format = new_format
    return this
}

// Retrieve or replace the log level.
Log.prototype.level = function ( new_lvl = null ) {
    if ( !new_lvl )
        return this._level
    if ( !( new_lvl in LEVELS ) )
        throw new Error( `invalid loglevel '${new_lvl}'` )
    this._level = new_lvl
    return this
}

// Create a log with the same destination and format,
// but with extra "context" added.
Log.prototype.child = function ( ctx, fn ) {
    const child = new LogChild( this, ( new LogContext() )
        .add( this._context )
        .add( ctx ) )
    fn( child )
    return this
}

// Send an event to the log.
Log.prototype.write = function ( ev ) {
    if ( LEVELS[ ev.lvl ] > LEVELS[ this._level ] )
        return
    this._context.apply( ev )
    this._stream.write( this._format( ev ) )
    return this
}

// Attach a method for each level, e.g. `log.warn()`.
for ( let lvl in LEVELS ) {
    Log.prototype[ lvl ] = function ( msg, ...dat ) {
        return this.write( new LogEvent( lvl, msg, ...dat ) )
    }
}

module.exports = Log
