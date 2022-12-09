'use strict'

// ANSI terminal colors
const COLORS = ( () => {
    const CSI = '\x1b['
    const CLEAR = `${CSI}0m`

    return {
        red         : _ => `${CSI}31m${_}${CLEAR}`,
        bold_red    : _ => `${CSI}1;31m${_}${CLEAR}`,
        bold_yellow : _ => `${CSI}1;33m${_}${CLEAR}`,
        dim         : _ => `${CSI}2;39m${_}${CLEAR}`
    }
} )()

// Pad a string on the left.
const padl = ( str, siz, chr = ' ' ) =>
    str.substr( 0, siz ).padStart( siz, chr )

const abbr_level = {
    fatal : 'FTL',
    error : 'ERR',
    warn  : 'WRN',
    info  : 'NFO',
    debug : 'DBG',
    trace : 'TRC'
}

module.exports = ({ color }) => ( ev ) => {
    let dat
    try {
        dat = JSON.stringify( ev.dat )
    } catch {
        dat = '[[ unserializable ]]'
    }

    let line = [
        (new Date( ev.ts )).toISOString(),
        abbr_level[ ev.lvl ],
        ev.msg,
        dat
    ]
    
    if ( color ) {
        line[ 3 ] = COLORS.dim( line[ 3 ] || '' )
        switch ( ev.lvl ) {
            case 'fatal':
                line[ 2 ] = COLORS.bold_red( line[ 2 ] )
            break;
            case 'error':
                line[ 2 ] = COLORS.red( line[ 2 ] )
            break;
            case 'warn':
                line[ 2 ] = COLORS.bold_yellow( line[ 2 ] )
            break;
            case 'info': break;
            case 'debug':
            case 'trace':
                line[ 2 ] = COLORS.dim( line[ 2 ] )
            break;
        }
    }
    
    line = line.join( ' ' )
    
    for ( let err of ev.err || [] ) {
        line += "\n" + err.stk.map( _ => `${_}` ).join( "\n" )
    }
    
    return line + "\n"
}

