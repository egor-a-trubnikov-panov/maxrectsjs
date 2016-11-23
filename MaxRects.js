class ScoreResult {
	constructor( score1, score2, node ) {
		this.score1 = score1
		this.score2 = score2
		this.node = node
	}
}

class Rectangle {
	constructor( x, y, width, height ) {
		this.x = x
		this.y = y
		this.width = width
		this.height = height
	}

	contains( {left,bottom,right,top} ) {
		return this.left <= left && this.bottom <= bottom && this.right >= right && this.top >= top
	}

	intersects( {left,bottom,right,top} ) {
		return this.left < right && this.right > left && this.bottom < top && this.top > bottom
	}
}

class MaxRects {
	constructor( width, height, allowRotation ) {
		this.binWidth = width
		this.binHeight = height
		this.freeRectangles = [new Rectangle(0, 0, width, height)]
		this.usedRectangles = []
		this.allowRotation = allowRotation
	}

	getOccupancy() {
		return this.usedRectangles.reduce( (acc,{width,height}) => acc + width*height, 0 ) / (this.binWidth*this.binHeight);
		//let sq = 0.0;
		//for ( rect of this.usedRectangles ) {
		//	sq += rect.width * rect.height;
		//}
		//return sq / (binWidth*binHeight);
	}
/*
	insert( width, height ) {
		const newNode = this.quickFindPositionForNewNodeBestAreaFit( width, height )
		
		if (newNode.height !== 0) {
			let numRectanglesToProcess = this.freeRectangles.length
			let i = 0
			while ( i < numRectanglesToProcess ) {
				if ( this.splitFreeNode( freeRectangles[i], newNode )) {
					this.freeRectangles.splice( i, 1 )
					--numRectanglesToProcess
					--i
				}
				i++
			}

			this.pruneFreeList()
			this.usedRectangles.push( newNode )
		}

		return newNode
	}
	*/
	insert( whs, fitMethod ) {
		const method = fitMethod || MaxRects.BestAreaFit
		const rects = whs.map( ([w,h]) => new Rectangle( 0, 0, w, h ))	
		while ( rects.length > 0 ) {
			let bestScore1 = Infinity
			let bestScore2 = Infinity
			let bestNode = null
			let bestNodeIndex = -1

			rects.forEach( ({width,height}, i) => {
				const {score1,score2,node} = method( self, width, height )
				//(() => switch( method ) {
				//	case MaxRects.BEST_AREA_FIT: return this.newNodeBestAreaFit( width, height )
				//	default: throw( 'Unknown packing method' )
				//})()
				if ( score1 < bestScore1 || (score1 == bestScore1 && score2 < bestScore2 )) {
					bestScore1 = score1
					bestScore2 = score2
					bestNode = node
					bestNodeIndex = i
				}
			})

			if ( bestNode != null ) {
				this.placeRect( bestNode )
				rects.splice( bestNodeIndex, 1 )
			} else {
				return false 
			}
		}
		return true
	}

	placeRect( node ) {
		let i = 0
		let len = this.freeRectangles.length
		while ( i < len ) {
			if ( this.splitFreeNode( this.freeRectangles[i], node )) {
				this.freeRectangles.splice( i, 1 )
				--i
				--len
			}
			++i	
		}
		this.pruneFreeList()
		this.usedRectangles.push( node )
	}

	//static inline function abs( a: Float ) return a >= 0 ? a : -a;
	//static inline function min( a: Float, b: Float ) return a > b ? a : b;

	//newNodeBestAreaFit( result, width, height ) {
	static BestAreaFit( self, width, height ) {
		const bestNode = new Rectangle( 0, 0, 0, 0 )

		let bestAreaFit = Infinity
		let bestShortSideFit = Infinity

		for ( freeRect of self.freeRectangles ) {
			const areaFit = freeRect.width * freeRect.height - width * height

			// Try to place the rectangle in upright (non-flipped) orientation.
			if ( freeRect.width >= width && freeRect.height >= height ) {
				const leftoverHoriz = Math.abs( freeRect.width - width )
				const leftoverVert = Math.abs( freeRect.height - height )
				const shortSideFit = Math.min( leftoverHoriz, leftoverVert )

				if ( areaFit < bestAreaFit || ( areaFit == bestAreaFit && shortSideFit < bestShortSideFit )) {
					bestNode.x = freeRect.x
					bestNode.y = freeRect.y
					bestNode.width = width
					bestNode.height = height
					bestShortSideFit = shortSideFit
					bestAreaFit = areaFit
				}
			}

			if ( self.allowRotation && freeRect.width >= height && freeRect.height >= width) {
				const leftoverHoriz = Math.abs( freeRect.width - height )
				const leftoverVert = Math.abs( freeRect.height - width )
				const shortSideFit = Math.min( leftoverHoriz, leftoverVert )

				if ( areaFit < bestAreaFit || ( areaFit == bestAreaFit && shortSideFit < bestShortSideFit )) {
					bestNode.x = freeRect.x
					bestNode.y = freeRect.y
					bestNode.width = height
					bestNode.height = width
					bestShortSideFit = shortSideFit
					bestAreaFit = areaFit
				}
			}
		}

		return new ScoreResult( bestAreaFit, bestShortSideFit, bestNode )
	}
/*
	quickFindPositionForNewNodeBestAreaFit( w, h ) {
		let score = Infinity
		const bestNode = new Rectangle( 0, 0, 0, 0 )
		for ( {x,y,width,height} of this.freeRectangles ) {
		// Try to place the rectangle in upright (non-flipped) orientation.
			if (width >= w && height >= h) {
				const areaFit = width * height - w * h
				if ( areaFit < score ) {
					bestNode.x = x
					bestNode.y = y
					bestNode.width = w
					bestNode.height = h
					score = areaFit
				}
			}
		}
		
		return bestNode
	}
	*/
	splitFreeNode( freeNode, usedNode ) {
		// Test with SAT if the rectangles even intersect.
		if ( usedNode.intersects( freeNode )) {
			const fleft = freeNode.x
			const fright = freeNode.x + freeNode.width
			const fbottom = freeNode.y
			const ftop = freeNode.y + freeNode.height 
			const uleft = usedNode.x
			const uright = usedNode.x + usedNode.width
			const ubottom = usedNode.y
			const utop = usedNode.y + usedNode.height 
			const rects = this.freeRectangles

			if ( uleft < fright && uright > fleft ) {
				// New node at the top side of the used node.
				if ( ubottom > fbottom && ubottom < ftop ) {
					rects.push( Rectangle( fleft, fbottom, fwidth, uy - fy ))
				}
				// New node at the bottom side of the used node.
				if ( utop < ftop ) {
					rects.push( new Rectangle( fleft, utop, fwidth, ftop - utop ))
				}
			}

			if ( ubottom < ftop && utop > fbottom ) {
				// New node at the left side of the used node.
				if ( uleft > fleft && uleft < fright ) {
					rects.push( new Rectangle( fleft, fbottom, uleft - fleft, fheight ))
				}
				// New node at the right side of the used node.
				if ( uright < fright ) {
					rects.push( new Rectangle( uright, fbottom, fright - uright, fheight ))
				}
			}

			return true
		} else {
			return false
		}
	}
/*
	function pruneFreeList() {
		// Go through each pair and remove any rectangle that is redundant.
		var i = 0;
		var j = 0;
		var len = freeRectangles.length;
		while ( i < len ) {
			j = i + 1;
			var tmpRect = freeRectangles[i];
			while (j < len) {
				var tmpRect2 = freeRectangles[j];
				if ( tmpRect2.contains( tmpRect )) {
					freeRectangles.splice( i, 1 );
					--i;
					--len;
					break;
				}
				if ( tmpRect.contains( tmpRect2 )) {
					freeRectangles.splice( j, 1 );
					--len;
					--j;
				}
				j++;
			}
			i++;
		}
	}
 */

	pruneFreeList() {
		const rects = this.freeRectangles
		for ( let i = 0; i < rects.length; ++i ) {
			for( let j = i+1; j < rects.length; ++j ) {
				if ( rects[i].contains( rects[j])) {
					rects.splice( i, 1 )
					--i
					break
				}
				if ( rects[j].contains( rects[i] )) {
					rects.splice( j, 1 )
					--j
				}
			}
		}
	}
/*
	function pruneFreeList() {
		var i = 0;
		var len = freeRectangles.length;

		while ( i < len ) {
			var irect = freeRectangles[i];	
			var j = i + 1;
			while ( j < len ) {
				var jrect = freeRectangles[j];
				if ( jrect.contains( irect )) {
					len -= 1;
					if ( i < len ) {
						freeRectangles[i] = freeRectangles[len];
						i -= 1;
					}
					break;
				}	
				if ( irect.contains( jrect )) {
					len -= 1;
					if ( j < len ) {
						freeRectangles[j] = freeRectangles[len];
						j -= 1;
					} 
				}
				j += 1;
			}
			i += 1;
		}

		freeRectangles.splice( len, freeRectangles.length - len );
	}*/
}

module.exports = {MaxRects, Rectangle}
