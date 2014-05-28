/*globals Point, requestAnimationFrame, Glyphs, patterns*/
"use strict"

var logEl

addEventListener("load", function () {
	logEl = document.getElementById("log")
	
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
	
	matchDraw()
}

function touchMoved(p) {
	var last = points[points.length-1]
	var angle1, angle2, dangle, newAngle, dist1, dist2, dist
	
	// Store the raw point
	allPoints.push(p)
	
	if (p.getSquareDistance(last) > 25*25) {
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
		matchDraw()
	}
}

function touchEnded(p) {
	allPoints.push(p)
	points.push(p)
	
	matchDraw()
}

// Debug draw
var dx = (568-320)/2

// Run the draw matching algorithm
var best
function matchDraw() {
	//var points = allPoints
	if (points.length < 2)
		return
	
	// Store the state for every candidate (pattern)
	// Each element is an object with keys:
	// pattern: a Glyph instance
	// coverage: an array of the the segments of the model drawn by the user
	// error: error score for each pattern (lesser is better)
	var candidates = patterns.map(function (pattern) {
		return {
			pattern: pattern,
			coverage: [],
			error: 0
		}
	})
	
	// For each segment drawn by the user and glyph
	points.forEach(function (point, i) {
		if (!i) return
		var point2 = points[i-1]
		candidates.forEach(function (candidate) {
			var match = candidate.pattern.matchSegment(point, point2)
			candidate.error += match.error
			var segment = match.segment
			if (candidate.coverage.indexOf(segment) == -1)
				candidate.coverage.push(segment)
		})
	})
	
	// Get the best
	var epsilon = 0.5 // coverage threshold
	best = candidates.filter(function (candidate) {
		candidate.coverage = candidate.coverage.length/(candidate.pattern.points.length-1)
		candidate.realError = candidate.error/candidate.coverage
		return candidate.coverage >= epsilon
	}).sort(function (a, b) {
		return a.realError-b.realError
	})[0]
	
	logEl.innerHTML = ""
	candidates.sort(function (a, b) {
		return a.realError-b.realError
	})
	var max = candidates[candidates.length-1].realError
	var table = document.createElement("table")
	logEl.appendChild(table)
	table.innerHTML = "<tr><td>Glyph</td><td>Match</td><td>Coverage</td><td>Error</td></tr>"
	candidates.forEach(function (candidate) {
		var row = table.insertRow()
		
		row.insertCell().textContent = candidate.pattern.name
		row.insertCell().textContent = Math.round(100-100*candidate.realError/max)+"%"
		row.insertCell().textContent = Math.round(100*candidate.coverage)+"%"
		row.insertCell().textContent = Math.log(candidate.error).toFixed(2)
	})
}

// Draw loop
function drawRect(canvas, context) {
	drawLine(context, points, "rgba(0, 0, 0, .5)", 3)
	drawDots(context, points, "black", 6)
	drawLine(context, allPoints, "red", 1)
	
	context.strokeRect(dx, 0, 320, 320)
	
	if (best)
		drawLine(context, best.pattern.globalPoints, "blue", 2)
}

// Draw a line through the given points
function drawLine(context, points, color, width) {
	context.beginPath()
	points.forEach(function (p, i) {
		if (i)
			context.lineTo(p.x, p.y)
		else
			context.moveTo(p.x, p.y)
	})
	
	context.strokeStyle = color
	context.lineWidth = width
	context.stroke()
}

// Draw dots in the given points coordinates
function drawDots(context, points, color, size) {
	context.fillStyle = color
	
	points.forEach(function (p) {
		context.beginPath()
		context.arc(p.x, p.y, size/2, 0, 2*Math.PI)
		context.fill()
	})
}
