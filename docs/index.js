var Whiteboard = (function () {
  var whiteboards = [];
  function createWhiteboard(canvas) {
    var whiteboard = {
      canvas:     canvas,
      context:    canvas.getContext("2d"),
      parent:     canvas.parentNode,
      parentRect: null,
      canvasRect: null,
      color: "black",
      children:  [],
      callbacks: {},
      emit: function (event, data) {
        var callbackList = whiteboard.callbacks[event];
        if (callbackList) {
          var i = callbackList.length;
          while (i--) {
            callbackList[i].call({}, data);
          }
        }
      },
      on: function (event, callback) {
        var callbackList = whiteboard.callbacks[event];
        if (!callbackList) {
          callbackList = whiteboard.callbacks[event] = [];
        }
        callbackList.push(callback);
      },
      drawLine: function(from, to, color) {
        color = color || whiteboard.color;
        var line = {
          type:  "line",
          from:  from,
          to:    to,
          color: color
        };
        whiteboard.children.push(line);
        drawLine(whiteboard, line);
      }
    };
    function getMousePos(event) {
      var canvasRect = whiteboard.canvasRect;
      var parentRect = whiteboard.parentRect;
      var x = (event.pageX - parentRect.left) / canvasRect.width;
      var y = (event.pageY - parentRect.top)  / canvasRect.height;
      return [x, y]
    }
    // var events = ["mousedown", "mousemove", "mouseup"]
    // var eventName, i = events.length
    // while (i--) {
    //   var eventName = events[i]
    //   canvas.addEventListener(eventName, function (event) {
    //     whiteboard.emit(eventName, {
    //       pos: getMousePos(event)
    //     })
    //   })
    // }
    canvas.addEventListener("mousedown", function (event) {
      whiteboard.emit("mousedown", {
        pos: getMousePos(event)
      });
    });
    canvas.addEventListener("mousemove", function (event) {
      whiteboard.emit("mousemove", {
        pos: getMousePos(event)
      });
    });
    canvas.addEventListener("mouseup", function (event) {
      whiteboard.emit("mouseup", {
        pos: getMousePos(event)
      });
    });
    return whiteboard
  }
  function resizeWhiteboard(whiteboard) {
    var parentRect = whiteboard.parentRect = whiteboard.parent.getBoundingClientRect();
    var canvas = whiteboard.canvas;
    canvas.width = parentRect.width;
    canvas.height = parentRect.height;
    whiteboard.canvasRect = whiteboard.canvas.getBoundingClientRect();
    clearWhiteboard(whiteboard);
    drawWhiteboard(whiteboard);
  }
  function clearWhiteboard(whiteboard) {
    var context = whiteboard.context;
    var canvas = whiteboard.canvas;
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  function drawWhiteboard(whiteboard) {
    var children = whiteboard.children;
    var child, i = children.length;
    while (i--) {
      child = children[i];
      if (child.type === "line") {
        drawLine(whiteboard, child);
      }
    }
  }
  function drawLine(whiteboard, line) {
    var ctx = whiteboard.context;
    var canvasRect = whiteboard.canvasRect;
    var w = canvasRect.width;
    var h = canvasRect.height;
    var fromX = line.from[0] * w;
    var fromY = line.from[1] * h;
    var toX   = line.to[0] * w;
    var toY   = line.to[1] * h;
    ctx.lineStyle = line.color;
    ctx.lineWidth = Math.round(0.025 * w);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.closePath();
  }
  function onresize() {
    var i = whiteboards.length;
    while (i--) {
      resizeWhiteboard(whiteboards[i]);
    }
  }
  var Whiteboard = {
    create: function (parent) {
      var type;
      if (parent) {
        type = typeof parent;
        if (type === "undefined") {
          parent = document.body;
        } else if (type === "string") {
          parent = document.querySelector(parent);
        }
      }
      var canvas = document.createElement("canvas");
      canvas.className = "whiteboard";
      parent.appendChild(canvas);

      var whiteboard = createWhiteboard(canvas);
      whiteboards.push(whiteboard);
      resizeWhiteboard(whiteboard);

      return whiteboard
    }
  };
  window.addEventListener("resize", onresize);
  window.addEventListener("orientationchange", onresize);
  return Whiteboard
}());

var whiteboard = Whiteboard.create("#wrap");

var start;
var last;
whiteboard.on("mousedown", function (mouse) {
  start = last = mouse.pos; // Mark current mouse position
});

whiteboard.on("mousemove", function (mouse) {
  var pos = mouse.pos;
  if (start) { // If we're currently drawing...
    whiteboard.drawLine(last, pos);
    last = pos;
  }
});

whiteboard.on("mouseup", function (mouse) {
  if (start) {                           // If we're currently drawing...
    whiteboard.drawLine(last, mouse.pos); // Draw one last time
    start = last = null;                  // We're done drawing, so discard draw coordinates
  }
});
