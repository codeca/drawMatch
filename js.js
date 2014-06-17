/*globals Point, requestAnimationFrame, patterns, Glyph*/
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

var simplify = false
function touchMoved(p) {
	var last = points[points.length-1]
	var angle1, angle2, dangle, newAngle, dist1, dist2, dist
	
	// Store the raw point
	allPoints.push(p)
	
	if (p.getSquareDistance(last) > 0) {
		// Respect a minimum distance
		
		if (anchor && simplify) {
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

// Run the draw matching algorithm
var best, best2, userDraw
function matchDraw() {
	var points = allPoints
	if (points.length < 2)
		return
	
	userDraw = new Glyph("user", points)
	
	// Store the state for every candidate (pattern)
	// Each element is an object with keys:
	// pattern: a Glyph instance
	// coverage: an array, coverage[segmentId] = coveragePercentage
	// error: error score for each pattern (lesser is better)
	var candidates = patterns.map(function (pattern) {
		var coverages = [], i
		for (i=1; i<pattern.points.length; i++)
			coverages.push(0)
		return {
			pattern: pattern,
			coverages: coverages,
			error: 0
		}
	})
	
	// For each segment drawn by the user and glyph
	userDraw.points.forEach(function (point, i) {
		if (!i) return
		var point2 = userDraw.points[i-1]
		candidates.forEach(function (candidate) {
			var match = candidate.pattern.matchSegment(point, point2)
			candidate.error += match.error
			candidate.coverages[match.segment] += match.coverage
		})
	})
	
	// Get the best
	var epsilon = 0.75 // coverage threshold
	var n = 2 // error penalty at epsilon
	var a = -(n-1)/((1-epsilon)*(1-epsilon))
	candidates.forEach(function (candidate) {
		var coverage = 0, i, totalSize = 0, segmentSize, points = candidate.pattern.points
		for (i=0; i<candidate.coverages.length; i++) {
			segmentSize = points[i].getDistance(points[i+1])
			coverage += Math.min(1, candidate.coverages[i])*segmentSize
			totalSize += segmentSize
		}
		candidate.coverage = coverage/totalSize
		candidate.realError = candidate.error/candidate.coverage
	})
	best = candidates.filter(function (candidate) {
		return candidate.coverage >= epsilon
	}).sort(function (a, b) {
		return a.realError-b.realError
	})[0]
	
	logEl.innerHTML = ""
	candidates.sort(function (a, b) {
		return a.realError-b.realError
	})
	var table = document.createElement("table")
	logEl.appendChild(table)
	table.innerHTML = "<tr><td>Glyph</td><td>Coverage</td><td>Error</td><td>Real Error</td></tr>"
	candidates.forEach(function (candidate) {
		var row = table.insertRow(-1)
		if (candidate.coverage < epsilon)
			row.style.color = "gray"
		
		row.insertCell(-1).textContent = candidate.pattern.name
		row.insertCell(-1).textContent = Math.round(100*candidate.coverage)+"%"
		row.insertCell(-1).textContent = candidate.error.toFixed(3)
		row.insertCell(-1).textContent = candidate.coverage<epsilon ? 0 : candidate.realError.toFixed(3)
	})
}

// Draw loop
function drawRect(canvas, context) {
	if (best) {
		drawLine(context, best.pattern.globalPoints, "rgba(0, 0, 255, .5)", 2)
		context.fillStyle = "black"
		best.coverages.forEach(function (coverage, i) {
			var A = best.pattern.globalPoints[i]
			var B = best.pattern.globalPoints[i+1]
			var x = (A.x+B.x)/2
			var y = (A.y+B.y)/2
			coverage = Math.round(100*Math.min(1, coverage))
			context.fillText(coverage, x, y)
		})
	}
	
	drawLine(context, points, "rgba(0, 0, 0, 0.5)", 5)
	drawLine(context, points, "red", 3)
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
	context.lineJoin = "round"
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
