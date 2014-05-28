"use strict"

function Point(x, y) {
	this.x = x
	this.y = y
}

Point.prototype.getSquareDistance = function (p) {
	var dx = this.x-p.x
	var dy = this.y-p.y
	return dx*dx+dy*dy
}

Point.prototype.getDistance = function (p) {
	var dx = this.x-p.x
	var dy = this.y-p.y
	return Math.sqrt(dx*dx+dy*dy)
}

Point.prototype.getAngleTo = function (p) {
	return Math.atan2(p.y-this.y, p.x-this.x)
}
