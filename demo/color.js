'use strict'

// Invoke the package directly with options.
// 'text.pretty' and 'trace' are predefined.
const log = require( '../' )({
    stream : process.stderr,
    format : 'text.pretty',
    level  : 'trace'
})

// Call each level as a function with message first, then objects and errors after.
log.fatal( 'unable to activate emergency override', { status_code: 'BRBGBGBG' } )
log.warn( 'signal malfunction', new Error( "bad signal" ) )
log.info( 'testing 123' )
log.debug( 'this is a test' )
log.trace( 'disregard all previous messages' )

