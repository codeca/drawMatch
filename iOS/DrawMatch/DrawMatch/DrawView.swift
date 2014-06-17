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
	var points:CGPoint[] = []
	
	// Store draw speeds (used only for display)
	var speeds = Double[]()

    init(frame: CGRect) {
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
			CGContextSetLineWidth(context, speed)
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
		addPoint(touches.anyObject() as UITouch)
	}
	
	override func touchesEnded(touches: NSSet!, withEvent event: UIEvent!)  {
		addPoint(touches.anyObject() as UITouch)
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
			speeds.append(sqrt(dx*dx+dy*dy))
		}
		points.append(point)
		self.setNeedsDisplay()
	}

}
