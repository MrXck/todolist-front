let event = null

export function useDrag(options) {
    const {type, item, end, node, image} = options
    if (!type || !item || !end || !node) {
        throw new Error("type item end node are required")
    }

    node.addEventListener('dragstart', e => {
        e.stopPropagation()
        if (item instanceof Function) {
            sessionStorage.setItem('item', JSON.stringify(item()))
        } else {
            sessionStorage.setItem('item', JSON.stringify(item))
        }
        sessionStorage.setItem('type', JSON.stringify(type))
        const bgImage = new Image()
        bgImage.src = image ? image : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAwAB/7+gi7YAAAAASUVORK5CYII="
        e.dataTransfer.setDragImage(bgImage, 0, 0)
    })

    node.addEventListener('dragend', e => {
        e.stopPropagation()
        try {
            const dropData = JSON.parse(sessionStorage.getItem('dropData'))
            if (item instanceof Function) {
                end(e, item(), dropData, type, event)
            } else {
                end(e, item, dropData, type, event)
            }
        } catch (error) {
            if (item instanceof Function) {
                end(e, item(), {}, type, event)
            } else {
                end(e, item, {}, type, event)
            }
        }
        sessionStorage.removeItem('item')
        sessionStorage.removeItem('type')
        sessionStorage.removeItem('dropData')
    })

    document.addEventListener('dragover', e => {
        e.preventDefault()
        event = e
    })
}

export function useDrop(options) {
    const {node, drop, hover, dropData} = options
    let accept = options.accept
    if (!accept || !node || !drop) {
        throw new Error("accept node drop are required")
    }

    if (!(accept instanceof Array)) {
        accept = [accept]
    }

    node.addEventListener('drop', e => {
        e.stopPropagation()
        const item = JSON.parse(sessionStorage.getItem('item'))
        const type = JSON.parse(sessionStorage.getItem('type'))
        if (accept.indexOf(type) !== -1) {
            if (dropData instanceof Function) {
                sessionStorage.setItem('dropData', JSON.stringify(dropData()))
            } else {
                sessionStorage.setItem('dropData', JSON.stringify(dropData))
            }
            drop(e, item, type)
        }
    })

    hover ? node.addEventListener('dragover', e => {
        e.preventDefault()
        const item = JSON.parse(sessionStorage.getItem('item'))
        const type = JSON.parse(sessionStorage.getItem('type'))
        if (accept.indexOf(type) !== -1) {
            if (dropData instanceof Function) {
                sessionStorage.setItem('dropData', JSON.stringify(dropData()))
            } else {
                sessionStorage.setItem('dropData', JSON.stringify(dropData))
            }
            hover(e, item, type)
        }
    }) : ''
}
