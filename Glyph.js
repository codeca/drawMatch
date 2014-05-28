/*globals Point*/
"use strict"

// Create a new glyph, given the normalized points (0 <= x, y <= 1)
function Glyph(name, points) {
	this.name = name
	this.points = points
	
	// Points in the global space
	this.globalPoints = points.map(function (p) {
		return new Point(p.x*320+(568-320)/2, p.y*320)
	})
}

// Find the best match for a given user segment (CD)
// Return an object with keys {error: number, segment: int}
Glyph.prototype.matchSegment = function (C, D) {
	var A, B, i, bestError = Infinity, bestId = -1
	var dx, dy, dx_, dy_, a, b, error
	for (i=1; i<this.globalPoints.length; i++) {
		A = this.globalPoints[i-1]
		B = this.globalPoints[i]
		
		dx = B.x-A.x
		dy = B.y-A.y
		dx_ = D.x-C.x
		dy_ = D.y-C.y
		
		a = dy*dx_ - dx*dy_
		b = dy*C.x - dx*C.y + B.x*A.y - A.x*B.y
		
		error = Math.sqrt(dx_*dx_+dy_*dy_)/(dx*dx+dy*dy)*(a*a/3+a*b+b*b)
		
		if (error < bestError) {
			bestError = error
			bestId = i-1
		}
	}
	
	return {
		error: bestError,
		segment: bestId
	}
}
