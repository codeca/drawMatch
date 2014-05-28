/*globals Glyph, Point*/
"use strict"

// Store glyph patterns
// All coordinates (both x and y) must be between 0 and 1
var patterns = [
	new Glyph("wave", [
		new Point(0.113, 0.747),
		new Point(0.747, 0.747),
		new Point(0.847, 0.641),
		new Point(0.863, 0.544),
		new Point(0.847, 0.447),
		new Point(0.791, 0.372),
		new Point(0.716, 0.325),
		new Point(0.634, 0.316),
		new Point(0.553, 0.338),
		new Point(0.509, 0.403)
	]),
	new Glyph("fire", [
		new Point(0.301, 0.792),
		new Point(0.084, 0.469),
		new Point(0.350, 0.600),
		new Point(0.509, 0.166),
		new Point(0.712, 0.613),
		new Point(0.900, 0.500),
		new Point(0.800, 0.792)
	]),
	new Glyph("hourglass", [
		new Point(0.25, 0.25),
		new Point(0.75, 0.25),
		new Point(0.25, 0.75),
		new Point(0.75, 0.75),
		new Point(0.25, 0.25)
	]),
	new Glyph("down-triangle", [
		new Point(0.20, 0.20),
		new Point(0.80, 0.20),
		new Point(0.50, 0.70),
		new Point(0.20, 0.20)
	]),
	new Glyph("up-triangle", [
		new Point(0.20, 0.80),
		new Point(0.80, 0.80),
		new Point(0.50, 0.30),
		new Point(0.20, 0.80)
	])
]
