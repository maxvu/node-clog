'use strict'

module.exports = ({ space }) => ( ev ) => {
    try {
        return JSON.stringify( ev, null, space ) + '\n'
    } catch {
        ev.dat = '[[ unserializable ]]'
        return JSON.stringify( ev, null, space ) + '\n'
    }
}

