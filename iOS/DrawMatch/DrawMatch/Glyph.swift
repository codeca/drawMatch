//
//  Glyph.swift
//  DrawMatch
//
//  Created by Guilherme Souza on 6/25/14.
//  Copyright (c) 2014 Splendens. All rights reserved.
//

import Foundation

typealias Point = (Double, Double)

class Glyph {
	let name:String
	
	// Normalize points (0<=x<1, 0<=y<1)
	let points:Point[]
	
	init(name: String, points: Point[]) {
		self.name = name
		
		// Find boundaries
		let inf = Double.infinity
		var minX = inf, maxX = -inf, minY = inf, maxY = -inf
		for (x, y) in points {
			minX = min(minX, x)
			maxX = max(maxX, x)
			minY = min(minY, y)
			maxY = max(maxY, y)
		}
		
		// Linear parameter for normalization
		let xFactor = maxX-minX
		let yFactor = maxY-minY
		let dx = 0.5-(maxX-minX)/(2*xFactor)
		let dy = 0.5-(maxY-minY)/(2*yFactor)

		// Create the normalized array of points
		self.points = points.map({(($0.0-minX)/xFactor+dx, ($0.1-minY)/yFactor+dy)})
	}
	
	// Find the best match for a given user segment (CD)
	// Return a tuple with (error, segment, coverage)
	func matchSegment(p:Point, p2:Point) -> (Double, Int, Double) {
		return (0.0, 0, 0.0)
	}
	
	// Return the i-th segment (starting at 0) size
	func segmentSize(i:Int) -> Double {
		return 0.0
	}
}
