import Block from './blocks.js'

window.addEventListener(
    'keydown',
    function (ev) {
        if (ev.keyCode == KEY.PAUSE) Block.game.pause = !Block.game.pause
        else return Input.onkey(ev.keyCode, true)
    },
    false
)
window.addEventListener(
    'keyup',
    function (ev) {
        return Input.onkey(ev.keyCode, false)
    },
    false
)

const KEY = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    PAUSE: 80,
}

let Input = {
    pressed_max_counter: 5,
    pressed_counter: 0,

    pressed: {
        left: false,
        right: false,
        down: false,
        up: false,
    },

    onkey: function (key, pressed) {
        switch (key) {
            case KEY.LEFT:
                this.pressed.left = pressed
                break
            case KEY.RIGHT:
                this.pressed.right = pressed
                break
            case KEY.UP:
                this.pressed.up = pressed
                break
            case KEY.DOWN:
                this.pressed.down = pressed
                break
            default:
                break
        }
    },

    movement: function () {
        if (this.pressed_counter < this.pressed_max_counter) {
            this.pressed_counter++
        } else {
            this.pressed_counter = 0
            if (this.pressed.left) {
                Block.move('left')
            } else if (this.pressed.right) {
                Block.move('right')
            } else if (this.pressed.up) {
                Block.rotate()
            } else if (this.pressed.down) {
                Block.move('down')
            } else if (this.pressed.pause) {
                Block.game.pause = !Block.game.pause
            }
        }
    },
}

export { Input as default }
