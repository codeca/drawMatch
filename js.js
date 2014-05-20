/*globals Point, requestAnimationFrame*/
"use strict"

addEventListener("load", function () {
	// Create a reference to outer canvas
	var bigCanvas = document.getElementById("canvas")
	var bigContext = bigCanvas.getContext("2d")
	
	// Create the inner canvas
	var canvas = document.createElement("canvas")
	canvas.width = 568
	canvas.height = 320
	var context = canvas.getContext("2d")
	
	var img = new Image
	img.src = "iphoneFrame.png"
	img.onload = function () {
		// Start draw loop
		bigContext.drawImage(img, 0, 0, 812, 379)
		requestAnimationFrame(drawLoop)
	}
	
	// Process clicks
	var pressing = false
	var process = function (event, canBegin) {
		var box = bigCanvas.getBoundingClientRect()
		var x = event ? event.clientX - box.left : 0
		var y = event ? event.clientY - box.top : 0
		x -= 118
		y -= 28
		var p = new Point(x, y)
		var isIn = x >= 0 && x < 568 && y >= 0 && y < 320
		
		if (pressing) {
			if (isIn) {
				touchMoved(p)
			} else {
				pressing = false
				touchEnded()
			}
		} else if (isIn && canBegin) {
			pressing = true
			touchBegan(p)
		}
	}
	
	bigCanvas.onmousedown = function (event) {
		process(event, true)
	}
	bigCanvas.onmousemove = function (event) {
		process(event, false)
	}
	bigCanvas.onmouseup = function () {
		process(null)
	}
	
	var drawLoop = function (time) {
		context.clearRect(0, 0, 568, 320)
		drawRect(canvas, context, time)
		bigContext.clearRect(118, 28, 568, 320)
		bigContext.drawImage(canvas, 118, 28)
		requestAnimationFrame(drawLoop)
	}
})

var points = []
var allPoints = []
var anchor = null

function touchBegan(p) {
	points = [p]
	allPoints = [p]
	anchor = null
}

function rad2degree(rad) {
	return (rad/Math.PI*180).toFixed(1)
}

function touchMoved(p) {
	var last = points[points.length-1]
	var angle1, angle2, dangle
	allPoints.push(p)
	if (p.getSquareDistance(last) > 400) {
		if (anchor) {
			angle1 = anchor.getAngleTo(last)
			angle2 = last.getAngleTo(p)
			dangle = Math.abs((angle1-angle2)%(2*Math.PI))
			dangle = dangle>Math.PI ? 2*Math.PI-dangle : dangle
			if (dangle < 15*Math.PI/180) {
				points.pop()
			}
		}
		anchor = last
		points.push(p)
	}
}

function touchEnded() {
	console.log("Selected %d of %d acquired points (%d%%)", points.length, allPoints.length, Math.round(100*points.length/allPoints.length))
}

function drawRect(canvas, context, time) {
	var i
	context.beginPath()
	context.strokeStyle = "rgba(0, 0, 0, .5)"
	context.lineWidth = 3
	for (i=0; i<points.length; i++) {
		if (i)
			context.lineTo(points[i].x, points[i].y)
		else
			context.moveTo(points[i].x, points[i].y)
	}
	context.stroke()
	
	for (i=0; i<points.length; i++) {
		context.beginPath()
		context.arc(points[i].x, points[i].y, 3, 0, 2*Math.PI)
		context.fill()
	}
	
	context.beginPath()
	context.strokeStyle = "red"
	context.lineWidth = 1
	for (i=0; i<allPoints.length; i++) {
		if (i)
			context.lineTo(allPoints[i].x, allPoints[i].y)
		else
			context.moveTo(allPoints[i].x, allPoints[i].y)
	}
	context.stroke()
}
