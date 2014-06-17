//
//  ViewController.swift
//  DrawMatch
//
//  Created by Guilherme Souza on 6/17/14.
//  Copyright (c) 2014 Splendens. All rights reserved.
//

import UIKit

class ViewController: UIViewController {
	let drawView = DrawView(frame: CGRectNull)
                            
	 override func viewDidLoad() {
		super.viewDidLoad()
		
		self.view.addSubview(drawView)
	}
	
	override func viewDidLayoutSubviews()  {
		drawView.frame = self.view.bounds
	}

}

