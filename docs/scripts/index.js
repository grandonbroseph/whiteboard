import Whiteboard from "./whiteboard"

var whiteboard = Whiteboard.create("#whiteboard")

var offset = 1000
function getSize() {
  // var now = Date.now()
  // var ratio = (now - then) / offset
  // if (ratio > 1)
  //   ratio = 1
  // var size = whiteboard.brushSize * ratio
  return whiteboard.brushSize
}

var start, last, then
whiteboard.on("mousedown", function (mouse) {
  start = last = mouse.pos // Mark current mouse position
  then = Date.now()
  whiteboard.undoHistory.push(whiteboard.children.length)
  whiteboard.redoHistory.length = 0
})

whiteboard.on("mousemove", function (mouse) {
  var pos = mouse.pos
  if (start) { // If we're currently drawing...
    whiteboard.drawLine(last, pos, undefined, getSize())
    last = pos
  }
})

whiteboard.on("mouseup", function (mouse) {
  var now = Date.now()
  if (start) { // If we're currently drawing...
    whiteboard.drawLine(last, mouse.pos, undefined, getSize()) // Draw one last time
    start = last = null // We're done drawing, so discard draw coordinates
  }
})

whiteboard.on("undo", function () {
  whiteboard.undo()
})

whiteboard.on("redo", function () {
  whiteboard.redo()
})

var range = document.getElementById("range")
range.addEventListener("input", function() {
  whiteboard.brushSize = range.value
  console.log(whiteboard.brushSize)
})

function onclick(event) {
  var label = event.target.nextSibling.nextSibling
  var color = window.getComputedStyle(label)["background-color"]
  whiteboard.brushColor = color
}

var palette = document.palette
var color, i = palette.length
while (i--) {
  color = palette[i]
  color.addEventListener("click", onclick)
}
