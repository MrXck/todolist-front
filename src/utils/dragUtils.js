const dragData = {}

let nowNode = null

function generateString(length = 16) {
    return Array.from({length}, () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        const randomIndex = Math.floor(Math.random() * characters.length)
        return characters[randomIndex]
    }).join('')
}

export function useDrag(options) {
    const {type, item, end, node, image} = options
    if (!type || !item || !end || !node) {
        throw new Error("type item end node are required")
    }
    const randomString = generateString()

    node.setAttribute('data-drag', randomString)

    dragData[randomString] = {type, item, dropData: null, event: null}

    node.addEventListener('dragstart', e => {
        e.stopPropagation()
        const bgImage = new Image()
        bgImage.src = image ? image : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAwAB/7+gi7YAAAAASUVORK5CYII="
        e.dataTransfer.setDragImage(bgImage, 0, 0)
        nowNode = node
    })

    node.addEventListener('dragend', e => {
        e.stopPropagation()
        try {
            const dropData = dragData[randomString].dropData
            if (item instanceof Function) {
                end(e, item(), dropData, type, dragData[randomString].event)
            } else {
                end(e, item, dropData, type, dragData[randomString].event)
            }
        } catch (error) {
            if (item instanceof Function) {
                end(e, item(), {}, type, dragData[randomString].event)
            } else {
                end(e, item, {}, type, dragData[randomString].event)
            }
        }
        nowNode = null
    })

    document.addEventListener('dragover', e => {
        e.preventDefault()
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
        const dataDrag = nowNode.getAttribute('data-drag')
        const item = dragData[dataDrag].item
        const type = dragData[dataDrag].type
        if (accept.indexOf(type) !== -1) {
            if (dropData instanceof Function) {
                dragData[dataDrag].dropData = dropData()
            } else {
                dragData[dataDrag].dropData = dropData
            }
            if (item instanceof Function) {
                drop(e, item(), type)
            } else {
                drop(e, item, type)
            }
        }
    })

    hover ? node.addEventListener('dragover', e => {
        e.preventDefault()
        const dataDrag = nowNode.getAttribute('data-drag')
        const item = dragData[dataDrag].item
        const type = dragData[dataDrag].type
        if (accept.indexOf(type) !== -1) {
            if (dropData instanceof Function) {
                dragData[dataDrag].dropData = dropData()
            } else {
                dragData[dataDrag].dropData = dropData
            }
            dragData[dataDrag].event = e

            if (item instanceof Function) {
                hover(e, item(), type)
            } else {
                hover(e, item, type)
            }
        }
    }) : ''
}
