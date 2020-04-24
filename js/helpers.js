import * as constants from './constants.js'

function debug($msg) {
    if (constants.DEBUG) {
        console.log($msg)
    }
}

function get2DCoordinatesFrom1DIndex(index, width) {
    let i = index % width
    let j = Math.floor(index / width)

    return { i: i, j: j }
}

function get1DIndexFrom2DCoordinates(x, y, width) {
    return y * width + x
}

export {debug, get2DCoordinatesFrom1DIndex, get1DIndexFrom2DCoordinates}