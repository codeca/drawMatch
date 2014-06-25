//
//  DrawMatch.swift
//  DrawMatch
//
//  Created by Guilherme Souza on 6/25/14.
//  Copyright (c) 2014 Splendens. All rights reserved.
//

import Foundation
import UIKit

class DrawMatch {
	let patterns:Glyph[]
	var userPoints:Point[] = []
	
	init(patterns:Glyph[]) {
		self.patterns = patterns
	}
	
	func reset() {
		userPoints = []
	}
	
	func addPoint(p:(Double, Double)) -> Candidate? {
		userPoints += p
		//NSLog("x: %g  y: %g", p.0, p.1)
		// If we have few points, done
		if userPoints.count < 17 {
			return .None
		}
		
		//NSLog("userPoints =>%d", userPoints.count)
		
		let userDraw = Glyph(name: "user", points: userPoints)
		
		var candidates = patterns.map({Candidate(pattern: $0)})
		
		//NSLog("candidates:%d", candidates.count)
		
		// For each segment drawn by the user and glyph
		for i in 1..userDraw.points.count {
			let p = userDraw.points[i]
			let p2 = userDraw.points[i-1]
			
			for candidate in candidates {
				let (error, segment, coverage) = candidate.pattern.matchSegment(p, p2: p2)
				//NSLog("error: %g  segment: %d coverage:%g", error, segment, coverage)
				candidate.error += error
				candidate.coverages[segment] += coverage
				
				
			}
			
		}
		
		
		
		// Get the best
		let epsilon = 0.75 // coverage threshold
		let n = 2.0 // error penalty at epsilon
		let a = -(n-1)/((1-epsilon)*(1-epsilon))
		for candidate in candidates {
			var coverage = 0.0, totalSize = 0.0
			for i in 0..candidate.coverages.count {
				let segmentSize = candidate.pattern.segmentSize(i)
				coverage += min(1.0, candidate.coverages[i])*segmentSize
				totalSize += segmentSize
			}
			candidate.coverage = coverage/totalSize
			candidate.realError = candidate.error/candidate.coverage
			
		}
		
		var best:Candidate[] = candidates.filter({//NSLog("coverage2 =>%g", $0.coverage)
			return $0.coverage >= epsilon})
		
		best.sort({$0.realError<$1.realError})
		
		if best.count == 0 {
			return .None
		}
		
		for candidate in best {
			NSLog("%@ error: %g coverage: %g real:%g", candidate.pattern.name, candidate.error, candidate.coverage, candidate.realError);
		}
		
		return Optional.Some(best[0])
	}
}
