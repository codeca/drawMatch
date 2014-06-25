//
//  DrawView.swift
//  DrawMatch
//
//  Created by Guilherme Souza on 6/17/14.
//  Copyright (c) 2014 Splendens. All rights reserved.
//

import UIKit

class DrawView: UIView {
	// Store draw points
	
	var patterns = [
		Glyph(name: "wave", points:[
			  Point(0.113, 0.747),
			  Point(0.747, 0.747),
			  Point(0.847, 0.641),
			  Point(0.863, 0.544),
			  Point(0.847, 0.447),
			  Point(0.791, 0.372),
			  Point(0.716, 0.325),
			  Point(0.634, 0.316),
			  Point(0.553, 0.338),
			  Point(0.509, 0.403)
			]),
		  Glyph(name: "fire", points: [
			  Point(0.301, 0.792),
			  Point(0.084, 0.469),
			  Point(0.350, 0.600),
			  Point(0.509, 0.166),
			  Point(0.712, 0.613),
			  Point(0.900, 0.500),
			  Point(0.800, 0.792)
			]),
		  Glyph(name: "hourglass", points: [
			  Point(0.25, 0.25),
			  Point(0.75, 0.25),
			  Point(0.25, 0.75),
			  Point(0.75, 0.75),
			  Point(0.25, 0.25)
			]),
		  Glyph(name: "down-triangle", points: [
			  Point(0.20, 0.20),
			  Point(0.80, 0.20),
			  Point(0.50, 0.70),
			  Point(0.20, 0.20)
			]),
		  Glyph(name: "up-triangle", points: [
			  Point(0.20, 0.80),
			  Point(0.80, 0.80),
			  Point(0.50, 0.30),
			  Point(0.20, 0.80)
			])
	]

	
	
	var points:CGPoint[] = []
	
	// Store draw speeds (used only for display)
	var speeds = Double[]()
	
	var matcher:DrawMatch
	
	var bestMatch:String

    init(frame: CGRect) {
		matcher = DrawMatch(patterns: self.patterns)
		bestMatch = ""
        super.init(frame: frame)
		self.backgroundColor = UIColor.clearColor()
		
    }
	
    override func drawRect(rect: CGRect) {
		if points.count == 0 {
			return
		}
		
		let context = UIGraphicsGetCurrentContext()
		var speed = 0.0
		
		CGContextSetLineCap(context, kCGLineCapRound)
		for i in 1..points.count {
			speed += (speeds[i-1]-speed)/3.0
			speed = CDouble(arc4random())%10.0+1.0
			
			CGContextSetLineWidth(context,CGFloat(speed))
			let A = points[i-1]
			let B = points[i]
			CGContextMoveToPoint(context, A.x, A.y)
			CGContextAddLineToPoint(context, B.x, B.y)
			CGContextStrokePath(context)
		}
		println("Points: \(points.count)")
    }
	
	override func touchesBegan(touches: NSSet!, withEvent event: UIEvent!) {
		points = []
		speeds = []
		self.setNeedsDisplay()
	}
	
	override func touchesMoved(touches: NSSet!, withEvent event: UIEvent!)  {
		let touch:UITouch = touches.anyObject() as UITouch
		let point = touch.locationInView(self)
		addPoint(touch)
		if var aux = matcher.addPoint((Double(point.x), Double(point.y)))?.pattern {
			bestMatch = aux.name
		}
		
	}
	
	override func touchesEnded(touches: NSSet!, withEvent event: UIEvent!)  {
		addPoint(touches.anyObject() as UITouch)
		NSLog("bestMatch:%@", bestMatch)
		matcher.reset()
		bestMatch = ""
	}
	
	override func touchesCancelled(touches: NSSet!, withEvent event: UIEvent!)  {
		addPoint(touches.anyObject() as UITouch)
	}
	
	func addPoint(touch: UITouch) {
		let point = touch.locationInView(self)
		if points.count != 0 {
			let lastPoint = points[points.count-1]
			let dx = lastPoint.x-point.x
			let dy = lastPoint.y-point.y
			speeds.append(CDouble(sqrtf(dx*dx+dy*dy)))
		}
		points.append(point)
		self.setNeedsDisplay()
	}

}
