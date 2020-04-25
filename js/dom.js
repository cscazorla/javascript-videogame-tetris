let DOM = {
    get: function (id) {
        return document.getElementById(id)
    },

    set: function (ele, html) {
        ele.innerHTML = html
    },

    hide: function (ele) {
        ele.style.display = 'none'
    },

    show: function (ele) {
        ele.style.display = ''
    },
}

export { DOM as default }
