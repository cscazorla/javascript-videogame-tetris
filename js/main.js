import Game from './game.js'
import * as constants from './constants.js'

let game = null
let main_canvas = null
let next_block_canvas = null

window.onload = function () {
    main_canvas = document.getElementById('main_canvas')
    main_canvas.width = constants.GAME_WIDTH
    main_canvas.height = constants.GAME_HEIGHT
    main_canvas.style.margin = 'auto'

    next_block_canvas = document.getElementById('next_block_canvas')
    next_block_canvas.width = constants.CELL_WIDTH * 3
    next_block_canvas.height = constants.CELL_HEIGHT * 3

    game = new Game(main_canvas, next_block_canvas)
    
}
