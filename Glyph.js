/*globals Point*/
"use strict"

// Create a new glyph
// The points are normalized to occupy the maximum area in 0 <= x,y <= 1
function Glyph(name, points) {
	this.name = name
	
	// Get extreme points
	var minX = points.reduce(function (min, p) {
		return Math.min(min, p.x)
	}, Infinity)
	var maxX = points.reduce(function (max, p) {
		return Math.max(max, p.x)
	}, -Infinity)
	var minY = points.reduce(function (min, p) {
		return Math.min(min, p.y)
	}, Infinity)
	var maxY = points.reduce(function (max, p) {
		return Math.max(max, p.y)
	}, -Infinity)
	
	var factorX = maxX-minX
	var factorY = maxY-minY
	var dx = 0.5-(maxX-minX)/(2*factorX)
	var dy = 0.5-(maxY-minY)/(2*factorY)
	this.points = points.map(function (p) {
		var x = (p.x-minX)/factorX+dx
		var y = (p.y-minY)/factorY+dy
		return new Point(x, y)
	})
	
	// Points in the global space
	this.globalPoints = points.map(function (p) {
		return new Point(p.x*320+(568-320)/2, p.y*320)
	})
}

// Find the best match for a given user segment (CD)
// Return an object with keys {error: number, segment: int}
Glyph.prototype.matchSegment = function (C, D) {
	var i, A, B, midAB, dist, dangle, bestError = Infinity, bestId = -1, error
	var midCD = new Point((C.x+D.x)/2, (C.y+D.y)/2)
	for (i=1; i<this.points.length; i++) {
		A = this.points[i-1]
		B = this.points[i]
		midAB = new Point((A.x+B.x)/2, (A.y+B.y)/2)
		
		dist = midAB.getSquareDistance(midCD)
		dangle = Math.abs(C.getAngleTo(D)-A.getAngleTo(B))%Math.PI
		dangle = dangle>Math.PI/2 ? Math.PI-dangle : dangle
		dangle *= dangle
		
		error = dist+dangle
		
		if (error < bestError) {
			bestError = error
			bestId = i-1
		}
	}
	
	A = this.points[bestId]
	B = this.points[bestId+1]
	var dx_ = D.x-C.x
	var dy_ = D.y-C.y
	var dx = B.x-A.x
	var dy = B.y-A.y
	var coverage = Math.abs((dx_*dx+dy_*dy)/(dx*dx+dy*dy))
	
	return {
		error: bestError,
		segment: bestId,
		coverage: coverage
	}
}

// Find the best match for a given user segment (CD)
// Return an object with keys {error: number, segment: int}
Glyph.prototype.matchSegment2 = function (C, D) {
	var A, B, i, bestError = Infinity, bestId = -1
	var dx, dy, dx_, dy_, a, b, error
	dx_ = D.x-C.x
	dy_ = D.y-C.y
	for (i=1; i<this.points.length; i++) {
		A = this.points[i-1]
		B = this.points[i]
		
		dx = B.x-A.x
		dy = B.y-A.y
		
		a = dy*dx_ - dx*dy_
		b = dy*C.x - dx*C.y + B.x*A.y - A.x*B.y
		
		error = Math.sqrt(dx_*dx_+dy_*dy_)/(dx*dx+dy*dy)*(a*a/3+a*b+b*b)
		
		if (error < bestError) {
			bestError = error
			bestId = i-1
		}
	}
	
	A = this.points[bestId]
	B = this.points[bestId+1]
	dx = B.x-A.x
	dy = B.y-A.y
	var coverage = Math.abs((dx_*dx+dy_*dy)/(dx*dx+dy*dy))
	
	return {
		error: bestError,
		segment: bestId,
		coverage: coverage
	}
}
