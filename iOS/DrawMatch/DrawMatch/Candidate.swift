//
//  Candidate.swift
//  DrawMatch
//
//  Created by Guilherme Souza on 6/25/14.
//  Copyright (c) 2014 Splendens. All rights reserved.
//

import Foundation

class Candidate {
	let pattern: Glyph
	var coverages: Double[] // coverage[segmentId] = coveragePercentage
	var error = 0.0 // error score for each pattern (lesser is better)
	var coverage = 0.0
	var realError = 0.0
	
	init(pattern: Glyph) {
		self.pattern = pattern
		
		coverages = []
		for i in 0..pattern.points.count-1 {
			coverages += 0.0
		}
	}
}
