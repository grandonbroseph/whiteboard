export default (function () {
  var whiteboards = []
  function createWhiteboard(canvas) {
    var whiteboard = {
      canvas:     canvas,
      context:    canvas.getContext("2d"),
      parent:     canvas.parentNode,
      parentRect: null,
      canvasRect: null,
      brushColor: "black",
      brushSize:  1,
      brushSizeRange: [0.25, 4],
      undoHistory: [],
      redoHistory: [],
      children:  [],
      callbacks: {},
      emit: function (event, data) {
        var callbackList = whiteboard.callbacks[event]
        if (callbackList) {
          var i = callbackList.length
          while (i--) {
            callbackList[i].call({}, data)
          }
        }
      },
      on: function (event, callback) {
        var callbackList = whiteboard.callbacks[event]
        if (!callbackList) {
          callbackList = whiteboard.callbacks[event] = []
        }
        callbackList.push(callback)
      },
      undo: function() {
        if (whiteboard.undoHistory.length) {
          var index = whiteboard.undoHistory.pop()
          whiteboard.redoHistory.push(whiteboard.children.splice(index, whiteboard.children.length - index))
          redrawWhiteboard(whiteboard)
        } else {
          console.log("Nothing to undo.")
        }
      },
      redo: function() {
        if (whiteboard.redoHistory.length) {
          var segment = whiteboard.redoHistory.pop()
          whiteboard.undoHistory.push(whiteboard.children.length)
          whiteboard.children = whiteboard.children.concat(segment)
          redrawWhiteboard(whiteboard)
        } else {
          console.log("Nothing to redo.")
        }
      },
      drawLine: function(from, to, color, width) {
        color = color || whiteboard.brushColor
        width = typeof width !== "undefined" ? width : whiteboard.brushSize
        var line = {
          type:  "line",
          from:  from,
          to:    to,
          color: color,
          width: (width / 100) * whiteboard.canvasRect.width
        }
        whiteboard.children.push(line)
        drawLine(whiteboard, line)
      }
    }
    function getMousePos(event) {
      var canvasRect = whiteboard.canvasRect
      var parentRect = whiteboard.parentRect
      var x = (event.pageX - parentRect.left) / canvasRect.width
      var y = (event.pageY - parentRect.top)  / canvasRect.height
      return [x, y]
    }
    var clicked = false
    canvas.addEventListener("mousedown", function (event) {
      clicked = true
      whiteboard.emit("mousedown", {
        pos: getMousePos(event)
      })
    })
    window.addEventListener("mousemove", function (event) {
      if (clicked) {
        whiteboard.emit("mousemove", {
          pos: getMousePos(event)
        })
      }
    })
    window.addEventListener("mouseup", function (event) {
      if (clicked) {
        whiteboard.emit("mouseup", {
          pos: getMousePos(event)
        })
      }
      clicked = false
    })
    window.addEventListener("keydown", function (event) {
      whiteboard.emit("keydown", {
        code: event.code
      })
      if (event.ctrlKey && !event.shiftKey) {
        if (event.code === "KeyZ") {
          whiteboard.emit("undo")
        }
        if (event.code === "KeyR") {
          event.preventDefault()
          whiteboard.emit("redo")
        }
      }
    })
    return whiteboard
  }
  function resizeWhiteboard(whiteboard) {
    var parentRect = whiteboard.parentRect = whiteboard.parent.getBoundingClientRect()
    var canvas = whiteboard.canvas
    canvas.width = parentRect.width
    canvas.height = parentRect.height
    whiteboard.canvasRect = whiteboard.canvas.getBoundingClientRect()
    redrawWhiteboard(whiteboard)
  }
  function redrawWhiteboard(whiteboard) {
    clearWhiteboard(whiteboard)
    drawWhiteboard(whiteboard)
  }
  function clearWhiteboard(whiteboard) {
    var context = whiteboard.context
    var canvas = whiteboard.canvas
    context.fillStyle = "white"
    context.fillRect(0, 0, canvas.width, canvas.height)
  }
  function drawWhiteboard(whiteboard) {
    var children = whiteboard.children
    var child, i = children.length
    while (i--) {
      child = children[i]
      if (child.type === "line") {
        drawLine(whiteboard, child)
      }
    }
  }
  function drawLine(whiteboard, line) {
    var ctx = whiteboard.context
    var canvasRect = whiteboard.canvasRect
    var w = canvasRect.width
    var h = canvasRect.height
    var fromX = line.from[0] * w
    var fromY = line.from[1] * h
    var toX   = line.to[0] * w
    var toY   = line.to[1] * h
    ctx.strokeStyle = line.color
    ctx.lineWidth = line.width
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(toX, toY)
    ctx.stroke()
    ctx.closePath()
  }
  function onresize() {
    var i = whiteboards.length
    while (i--) {
      resizeWhiteboard(whiteboards[i])
    }
  }
  var Whiteboard = {
    create: function (parent) {
      var type
      if (parent) {
        type = typeof parent
        if (type === "undefined") {
          parent = document.body
        } else if (type === "string") {
          parent = document.querySelector(parent)
        }
      }
      var canvas = document.createElement("canvas")
      canvas.className = "whiteboard"
      parent.appendChild(canvas)

      var whiteboard = createWhiteboard(canvas)
      whiteboards.push(whiteboard)
      resizeWhiteboard(whiteboard)

      return whiteboard
    }
  }
  window.addEventListener("resize", onresize)
  window.addEventListener("orientationchange", onresize)
  return Whiteboard
}())
