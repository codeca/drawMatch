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
		let xFactor = maxX-minX < 0.01 ? 0.01 : maxX-minX
		let yFactor = maxY-minY < 0.01 ? 0.01 : maxY-minY
		
		
		let dx = 0.5-(maxX-minX)/(2*xFactor)
		let dy = 0.5-(maxY-minY)/(2*yFactor)

		// Create the normalized array of points
		self.points = points.map({(($0.0-minX)/xFactor+dx, ($0.1-minY)/yFactor+dy)})
	}
	
	// Find the best match for a given user segment (CD)
	// Return a tuple with (error, segment, coverage)
	func matchSegment(p:Point, p2:Point) -> (Double, Int, Double) {
		
		let inf=Double.infinity
		var i:Int
		var bestId = -1
		var A, B, midAB:Point
		var dist, dangle, error:Double
		var bestError = inf
		var midCD = Point((p.0+p2.0)/2,(p.1+p2.1)/2)
		for i in 1..self.points.count{
			A = self.points[i-1]
			B = self.points[i]
			midAB = Point((A.0+B.0)/2,(A.1+B.1)/2)
			
			dist = getSquareDistance(midAB, p2: midCD)
			dangle = abs(getAngle(p, p2: p2)-getAngle(A, p2:B))%M_PI
			if dangle > M_PI/2{
				dangle = M_PI-dangle
			}
			
			dangle *= dangle
			
			error = dist+dangle
			
			if error < bestError{
				bestError = error
				bestId = i-1
			}
		}
		
		A = self.points[bestId]
		B = self.points[bestId+1]
		let dxCD = p2.0-p.0
		let dyCD = p2.1-p.1
		let dxAB = B.0-A.0
		let dyAB = B.1-A.1
		
		let coverage = abs((dxCD*dxAB+dyCD*dyAB)/(dxAB*dxAB+dyAB*dyAB))
		
		return (bestError, bestId, coverage)
		
	}
	
	func getAngle(p1:Point, p2:Point) -> Double{
		return atan2(p2.1-p1.1, p2.0-p1.0)
	}
	
	// Return the square of the distance between points p1 and p2
	func getSquareDistance(p1:Point, p2:Point) -> Double{
		let dx = p1.0-p2.0
		let dy = p1.1-p2.1
		return dx*dx+dy*dy
	}
	
	// Return the i-th segment (starting at 0) size
	func segmentSize(i:Int) -> Double {
		let p1 = self.points[i]
		let p2 = self.points[i+1]
		return pow(getSquareDistance(p1, p2: p2),0.5)
	}
}
