'use strict'
const json = require( './json' )
const text = require( './text' )

module.exports = {
    'json.plain'  : json({ space : 0 }),
    'json.pretty' : json({ space : 4 }),
    'text.plain'  : text({ color : false }),
    'text.pretty' : text({ color : true })
}

