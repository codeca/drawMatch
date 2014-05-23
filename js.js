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
	
	var touch2point = function (touch) {
		var box = bigCanvas.getBoundingClientRect()
		var x = touch.clientX - box.left - 118
		var y = touch.clientY - box.top - 28
		var p = new Point(x, y)
		p.isIn = x >= 0 && x < 568 && y >= 0 && y < 320
		return p
	}
	
	var touching = false
	var processBegin = function (event, touch) {
		var p = touch2point(touch)
		if (touching) {
			touching = false
			touchEnded(p)
		}
		if (p.isIn) {
			event.preventDefault()
			touching = true
			touchBegan(p)
		}
	}
	
	var processMove = function (event, touch) {
		var p = touch2point(touch)
		if (touching) {
			if (p.isIn) {
				event.preventDefault()
				touchMoved(p)
			} else {
				touching = false
				touchEnded(p)
			}
		}
	}
	
	var processEnd = function (event, touch) {
		var p = touch2point(touch)
		if (touching) {
			touching = false
			touchEnded(p)
		}
	}
	
	// Touch events
	bigCanvas.onmousedown = function (event) {
		processBegin(event, event)
	}
	bigCanvas.onmousemove = function (event) {
		processMove(event, event)
	}
	bigCanvas.onmouseup = function (event) {
		processEnd(event, event)
	}
	bigCanvas.ontouchstart = function (event) {
		processBegin(event, event.changedTouches[0])
	}
	bigCanvas.ontouchmove = function (event) {
		processMove(event, event.changedTouches[0])
	}
	bigCanvas.ontouchend = function () {
		processEnd(event, event.changedTouches[0])
	}
	
	var drawLoop = function (time) {
		context.clearRect(0, 0, 568, 320)
		drawRect(canvas, context, time)
		bigContext.clearRect(118, 28, 568, 320)
		bigContext.drawImage(canvas, 118, 28)
		requestAnimationFrame(drawLoop)
	}
})

function rad2degree(rad) {
	return (rad/Math.PI*180).toFixed(1)
}

var points = []
var allPoints = []
var anchor = null

function touchBegan(p) {
	points = [p]
	allPoints = [p]
	anchor = null
}

function touchMoved(p) {
	var last = points[points.length-1]
	var angle1, angle2, dangle, newAngle, dist1, dist2, dist
	
	// Store the raw point
	allPoints.push(p)
	
	if (p.getSquareDistance(last) > 50*50) {
		// Respect a minimum distance
		
		if (anchor) {
			angle1 = anchor.getAngleTo(last)
			angle2 = last.getAngleTo(p)
			dangle = Math.abs((angle1-angle2)%(2*Math.PI))
			dangle = dangle>Math.PI ? 2*Math.PI-dangle : dangle
			if (dangle < 15*Math.PI/180) {
				// Simplify
				
				// Remove last point
				points.pop()
				
				// New angle
				dist1 = Math.sqrt(anchor.getSquareDistance(last))
				dist2 = Math.sqrt(last.getSquareDistance(p))
				newAngle = (dist1*angle1+dist2*angle2)/(dist1+dist2)
				
				// Distance from point to point'
				dist = (p.x-anchor.x)*Math.sin(newAngle)-(p.y-anchor.y)*Math.cos(newAngle)
				dist = Math.abs(dist)
				
				p.x += dist*Math.cos(newAngle+Math.PI/2)
				p.y += dist*Math.sin(newAngle+Math.PI/2)
			} else {
				// Don't simplify
				
				
			}
		}
		
		anchor = last
		points.push(p)
	}
}

function touchEnded(p) {
	allPoints.push(p)
	points.push(p)
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
	
	context.strokeRect((568-320)/2, 0, 320, 320)
}
