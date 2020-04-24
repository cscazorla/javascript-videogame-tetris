import * as constants from './constants.js'
import {
    debug,
    get2DCoordinatesFrom1DIndex,
    get1DIndexFrom2DCoordinates,
} from './helpers.js'
import pSBC from './pSBC.js'

const blocks = [
    [
        [0, 1, 0, 0, 1, 1, 0, 1, 0],
        [0, 0, 0, 1, 1, 1, 0, 1, 0],
        [0, 1, 0, 1, 1, 0, 0, 1, 0],
        [0, 1, 0, 1, 1, 1, 0, 0, 0],
    ],
    [
        [0, 1, 0, 0, 1, 0, 0, 1, 0],
        [0, 0, 0, 1, 1, 1, 0, 0, 0],
        [0, 1, 0, 0, 1, 0, 0, 1, 0],
        [0, 0, 0, 1, 1, 1, 0, 0, 0],
    ],
    [
        [0, 1, 0, 0, 1, 0, 0, 1, 1],
        [0, 0, 1, 1, 1, 1, 0, 0, 0],
        [1, 1, 0, 0, 1, 0, 0, 1, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 0],
    ],
    [
        [0, 1, 0, 0, 1, 0, 1, 1, 0],
        [0, 0, 0, 1, 1, 1, 0, 0, 1],
        [0, 1, 1, 0, 1, 0, 0, 1, 0],
        [1, 0, 0, 1, 1, 1, 0, 0, 0],
    ],
    [
        [0, 1, 0, 0, 1, 1, 0, 0, 1],
        [0, 1, 1, 1, 1, 0, 0, 0, 0],
        [1, 0, 0, 1, 1, 0, 0, 1, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 0],
    ],
    [
        [0, 1, 0, 1, 1, 0, 1, 0, 0],
        [1, 1, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 0, 1, 1, 0, 1, 0],
        [1, 1, 0, 0, 1, 1, 0, 0, 0],
    ],
    [
        [0, 0, 0, 0, 1, 1, 0, 1, 1],
        [0, 0, 0, 0, 1, 1, 0, 1, 1],
        [0, 0, 0, 0, 1, 1, 0, 1, 1],
        [0, 0, 0, 0, 1, 1, 0, 1, 1],
    ],
]

const colors = ['#00ab55', '#e3dd36', '#4a4ed9', '#db9948', '#d60000', '#f683fc', '#75177a']

let Block = {
    game: null,
    x: null,
    y: null,
    type: null,
    orientation: null,
    next_block_type: Math.floor(Math.random() * 7),
    get: function (block, orientation) {
        return blocks[block][orientation]
    },
    move: function (direction) {
        if (
            direction == constants.BLOCK_MOVE_LEFT &&
            !this.isCollision(this.x - 1, this.y, this.orientation)
        ) {
            this.x--
        }
        if (
            direction == constants.BLOCK_MOVE_RIGHT &&
            !this.isCollision(this.x + 1, this.y, this.orientation)
        ) {
            this.x++
        }
        if (
            direction == constants.BLOCK_MOVE_DOWN &&
            !this.isCollision(this.x, this.y + 1, this.orientation)
        ) {
            this.y++
        }
    },
    shouldTurnIntoRock: function () {
        // If is touching any rock, we turn it into rock
        if (this.isCollision(this.x, this.y + 1, this.orientation)) {
            this.turnIntoStone()
            this.spawnsBlock()
        }
    },
    rotate: function () {
        let orientation = this.orientation + 1
        if (orientation > 3) orientation = 0

        if (!this.isCollision(this.x, this.y, orientation)) {
            this.orientation = orientation
        }
    },
    drawBlockInBoard: function (ctx) {
        for (let j = 0; j < 3; j++) {
            for (let i = 0; i < 3; i++) {
                const index = get1DIndexFrom2DCoordinates(i, j, 3)
                const value = blocks[this.type][this.orientation][index]

                if (value) {
                    ctx.fillStyle = colors[this.type]
                    ctx.fillRect(
                        (this.x + i - 1) * constants.CELL_WIDTH,
                        (this.y + j - 1) * constants.CELL_HEIGHT,
                        constants.CELL_WIDTH,
                        constants.CELL_HEIGHT
                    )
                }
            }
        }

        // Draw collider
        if (constants.DEBUG) {
            ctx.strokeStyle = '#FF0000'
            ctx.strokeRect(
                (this.x - 1) * constants.CELL_WIDTH,
                (this.y - 1) * constants.CELL_HEIGHT,
                3 * constants.CELL_WIDTH,
                3 * constants.CELL_HEIGHT
            )
            ctx.fillStyle = 'blue'
            ctx.font = '14px bold monospace'
            ctx.textBaseline = 'middle'
            ctx.textAlign = 'center'
            ctx.fillText(
                '(' + this.x + ',' + this.y + ')',
                (this.x + 0.5) * constants.CELL_WIDTH,
                (this.y + 0.5) * constants.CELL_HEIGHT
            )
        }
    },
    // To Do: Use this.getWorldCoordinatesForBlockPieces()
    isCollision: function (x, y, orientation) {
        let collision = false

        let old_x = this.x
        let old_y = this.y

        this.x = x
        this.y = y
        // debug(`Evaluating collision in coordinate (${x},${y})`)
        for (let j = 0; j < 3 && !collision; j++) {
            for (let i = 0; i < 3 && !collision; i++) {
                const block_index = get1DIndexFrom2DCoordinates(i, j, 3)
                const block_value = blocks[this.type][orientation][block_index]
                if (block_value) {
                    const block_world_coordinate = this.getWorldCoordinates(
                        i,
                        j
                    )

                    // Is there a rock in the map in that coordinate?
                    const map_index = get1DIndexFrom2DCoordinates(
                        block_world_coordinate.x,
                        block_world_coordinate.y,
                        constants.COLS
                    )
                    const map_value = this.game.map[map_index]

                    if (map_value) {
                        collision = true
                    }

                    // debug(
                    //     `Block index (${i},${j}) = ${block_value} Map Coordinate (${block_world_coordinate.x},${block_world_coordinate.y}) Map Index ${map_index} => ${map_value} - Collision ${collision}`
                    // )
                }
            }
        }

        this.x = old_x
        this.y = old_y

        return collision
    },
    getWorldCoordinates: function (i, j) {
        return { x: this.x + i - 1, y: this.y + j - 1 }
    },
    turnIntoStone: function () {
        let coordinates = this.getWorldCoordinatesForBlockPieces()
        for (let points of coordinates) {
            const index = get1DIndexFrom2DCoordinates(
                points.x,
                points.y,
                constants.COLS
            )
            this.game.map[index] = this.type + 2
        }
    },
    getStoneColor: function(index) {
        let color = colors[index - 2]
        return pSBC(-0.5, color)
    },
    spawnsBlock: function () {
        this.x = 4
        this.y = -1
        this.type = this.next_block_type
        this.orientation = 0

        this.next_block_type = Math.floor(Math.random() * 7)

        this.drawNextBlock()
    },
    drawNextBlock: function () {
        // Clean up
        this.game.next_block_ctx.clearRect(
            0,
            0,
            this.game.next_block_canvas.width,
            this.game.next_block_canvas.height
        )

        for (let j = 0; j < 3; j++) {
            for (let i = 0; i < 3; i++) {
                const index = get1DIndexFrom2DCoordinates(i, j, 3)
                const value = blocks[this.next_block_type][0][index]

                if (value) {
                    this.game.next_block_ctx.fillStyle =
                        colors[this.next_block_type]
                    this.game.next_block_ctx.fillRect(
                        i * constants.CELL_WIDTH,
                        j * constants.CELL_HEIGHT,
                        constants.CELL_WIDTH,
                        constants.CELL_HEIGHT
                    )
                }
            }
        }
    },

    getWorldCoordinatesForBlockPieces: function () {
        let coordinates = []
        for (let j = 0; j < 3; j++) {
            for (let i = 0; i < 3; i++) {
                const b_index = get1DIndexFrom2DCoordinates(i, j, 3)
                const b_value = blocks[this.type][this.orientation][b_index]
                if (b_value) {
                    coordinates.push(this.getWorldCoordinates(i, j))
                }
            }
        }
        return coordinates
    },
}

export { Block as default }
