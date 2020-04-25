import * as constants from './constants.js'
import Input from './input.js'
import Block from './blocks.js'
import DOM from './dom.js'
import {
    debug,
    get2DCoordinatesFrom1DIndex,
    get1DIndexFrom2DCoordinates,
} from './helpers.js'

export default class Game {
    constructor(board_canvas, next_block_canvas) {
        this.board_canvas = board_canvas
        this.board_ctx = board_canvas.getContext('2d')

        this.next_block_canvas = next_block_canvas
        this.next_block_ctx = next_block_canvas.getContext('2d')

        this.map = this.clearMap()
        this.gravity_max_counter = 50
        this.gravity_counter = 0

        this.pause = false
        this.gameover = false

        this.score = 0
        this.scoreElem = DOM.get('score')

        Block.game = this
        Block.spawnsBlock()

        this.update()
    }

    update = function () {
        window.requestAnimationFrame(this.update.bind(this))

        if (!this.pause && !this.gameover) {
            Input.movement()
            // Delayed game loop
            if (this.gravity_counter < this.gravity_max_counter) {
                this.gravity_counter++
            } else {
                this.gravity_counter = 0

                Block.shouldTurnIntoRock()

                this.checkNewLine()

                this.isGameOver()

                // The block should fall
                Block.move('down')
            }
        }

        this.render()
    }

    isGameOver = function () {
        let all_slots_empty = true
        for (let x = 1; x < constants.COLS - 1 && all_slots_empty; x++) {
            const index = get1DIndexFrom2DCoordinates(x, 0, constants.COLS)
            if (this.map[index] != constants.MAP_AIR) all_slots_empty = false
        }
        if (!all_slots_empty) {
            this.gameover = true
        }
    }

    checkNewLine = function () {
        for (let y = 0; y < constants.ROWS - 1; y++) {
            let all_slots_filled = true
            for (let x = 0; x < constants.COLS && all_slots_filled; x++) {
                const index = get1DIndexFrom2DCoordinates(x, y, constants.COLS)
                if (this.map[index] == constants.MAP_AIR)
                    all_slots_filled = false
            }
            if (all_slots_filled) {
                this.removeLineFromMap(y)
            }
        }
    }

    render = function () {
        // Clean up
        this.board_ctx.clearRect(
            0,
            0,
            this.board_canvas.width,
            this.board_canvas.height
        )

        // Draw map
        for (let x = 0; x < constants.COLS; x++) {
            for (let y = 0; y < constants.ROWS; y++) {
                const index = get1DIndexFrom2DCoordinates(x, y, constants.COLS)
                const value = this.map[index]

                // We only draw Rocks and Stoned Blocks
                if (value > 0) {
                    let color = null
                    if (value == constants.MAP_ROCK) {
                        color = '#363946'
                    } else {
                        // color = pSBC(-0.5, Block.getStoneColor(value))
                        color = Block.getStoneColor(value)
                    }
                    this.board_ctx.fillStyle = color
                    this.board_ctx.fillRect(
                        x * constants.CELL_WIDTH,
                        y * constants.CELL_HEIGHT,
                        constants.CELL_WIDTH,
                        constants.CELL_HEIGHT
                    )
                }
            }
        }

        // Draw block
        Block.drawBlockInBoard(this.board_ctx)

        // Pause?
        if (this.pause) {
            DOM.show(DOM.get('pause'))
        } else {
            DOM.hide(DOM.get('pause'))
        }

        // Game Over
        if (this.gameover) {
            this.board_ctx.fillStyle = 'red'
            this.board_ctx.font = '40px Arial'
            this.board_ctx.textBaseline = 'middle'
            this.board_ctx.textAlign = 'center'
            this.board_ctx.fillText(
                'Game Over',
                constants.GAME_WIDTH / 2,
                constants.GAME_HEIGHT / 2
            )
        }

        // UI
        DOM.set(this.scoreElem, 'Score: ' + this.score)
    }

    clearMap = function () {
        let map = []
        for (let x = 0; x < constants.COLS; x++) {
            for (let y = 0; y < constants.ROWS; y++) {
                const index = get1DIndexFrom2DCoordinates(x, y, constants.COLS)
                map[index] = constants.MAP_AIR
            }
        }

        // Borders of the map
        for (let j = 0; j < constants.ROWS; j++) {
            map[j * constants.COLS] = constants.MAP_ROCK
            map[j * constants.COLS + 9] = constants.MAP_ROCK
        }
        for (let i = 0; i < constants.COLS; i++) {
            map[(constants.ROWS - 1) * constants.COLS + i] = constants.MAP_ROCK
        }

        return map
    }

    removeLineFromMap = function (row) {
        for (let j = row - 1; j > 0; j--) {
            for (let i = 0; i < constants.COLS; i++) {
                const current_index = get1DIndexFrom2DCoordinates(
                    i,
                    j,
                    constants.COLS
                )
                const new_index = get1DIndexFrom2DCoordinates(
                    i,
                    j + 1,
                    constants.COLS
                )
                this.map[new_index] = this.map[current_index]
            }
        }

        this.addScore()
    }

    addScore = function () {
        this.score += 10
    }
}
