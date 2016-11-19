import Whiteboard from "./whiteboard"

var whiteboard = Whiteboard.create("#wrap")

var start, last
whiteboard.on("mousedown", function (mouse) {
  start = last = mouse.pos // Mark current mouse position
})

whiteboard.on("mousemove", function (mouse) {
  var pos = mouse.pos
  if (start) { // If we're currently drawing...
    whiteboard.drawLine(last, pos)
    last = pos
  }
})

whiteboard.on("mouseup", function (mouse) {
  if (start) {                           // If we're currently drawing...
    whiteboard.drawLine(last, mouse.pos) // Draw one last time
    start = last = null                  // We're done drawing, so discard draw coordinates
  }
})
