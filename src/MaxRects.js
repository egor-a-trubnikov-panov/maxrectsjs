import {Rectangle} from './Rectangle'

export class MaxRects {
	constructor( width, height, allowRotation = false ) {
		this.binWidth = width
		this.binHeight = height
		this.freeRectangles = [new Rectangle(0, 0, width, height)]
		this.usedRectangles = []
		this.allowRotation = allowRotation
	}

	getOccupancy() {
		return this.usedRectangles.reduce( (acc,{width,height}) => acc + width*height, 0 ) / (this.binWidth*this.binHeight);
	}
	
	insert( idwhs, fitMethod ) {
		const method = fitMethod || MaxRects.BestAreaFit
		const rects = idwhs.slice()
		while ( rects.length > 0 ) {
			let [bestScore1,bestScore2,bestRect,bestIndex] = [Infinity,Infinity,null,-1]

			rects.forEach( ([width, height, id], i) => {
				const {score1,score2,node} = method( this, width, height, id )
				if ( score1 < bestScore1 || (score1 == bestScore1 && score2 < bestScore2 )) {
					[bestScore1, bestScore2, bestRect, bestIndex] = [score1, score2, node, i]
				}
			})

			if ( bestRect != null ) {
				this.placeRect( bestRect )
				rects.splice( bestIndex, 1 )
			} else {
				return false 
			}
		}
		return true
	}

	placeRect( node ) {
		for ( let i = 0; i < this.freeRectangles.length; i++ ) {
			if ( this.splitFreeRect( this.freeRectangles[i], node )) {
				this.freeRectangles.splice( i, 1 )
				--i
			}
		}
		this.pruneFreeList()
		this.usedRectangles.push( node )
	}

	static BestAreaFit( self, width, height, id ) {
		const bestRect = new Rectangle( 0, 0, 0, 0, false )

		let [bestX,bestY,bestWidth,bestHeight,bestRotated] = [0,0,0,0,false]
		let bestAreaFit = Infinity
		let bestShortSideFit = Infinity

		self.freeRectangles.forEach( (freeRect) => {
			const areaFit = freeRect.width * freeRect.height - width * height

			// Try to place the rectangle in upright (non-flipped) orientation.
			if ( freeRect.width >= width && freeRect.height >= height ) {
				const leftoverHoriz = Math.abs( freeRect.width - width )
				const leftoverVert = Math.abs( freeRect.height - height )
				const shortSideFit = Math.min( leftoverHoriz, leftoverVert )

				if ( areaFit < bestAreaFit || ( areaFit == bestAreaFit && shortSideFit < bestShortSideFit )) {
					[bestX,bestY,bestWidth,bestHeight,bestRotated] = [freeRect.x,freeRect.y,width,height,false]
					bestShortSideFit = shortSideFit
					bestAreaFit = areaFit
				}
			}

			if ( self.allowRotation && freeRect.width >= height && freeRect.height >= width) {
				const leftoverHoriz = Math.abs( freeRect.width - height )
				const leftoverVert = Math.abs( freeRect.height - width )
				const shortSideFit = Math.min( leftoverHoriz, leftoverVert )

				if ( areaFit < bestAreaFit || ( areaFit == bestAreaFit && shortSideFit < bestShortSideFit )) {
					[bestX,bestY,bestWidth,bestHeight,bestRotated] = [freeRect.x,freeRect.y,height,width,true]
					bestShortSideFit = shortSideFit
					bestAreaFit = areaFit
				}
			}
		})

		return {
			score1: bestAreaFit,
			score2: bestShortSideFit,
			node: new Rectangle( bestX, bestY, bestWidth, bestHeight, bestRotated, id )
		}
	}
	
	splitFreeRect( freeRect, usedRect ) {
		if ( usedRect.intersects( freeRect )) {
			const rects = this.freeRectangles
			if ( usedRect.left < freeRect.right && usedRect.right > freeRect.left ) {
				// New node at the top side of the used node.
				if ( usedRect.bottom > freeRect.bottom && usedRect.bottom < freeRect.top ) {
					rects.push( new Rectangle( freeRect.left, freeRect.bottom, freeRect.width, usedRect.bottom - freeRect.bottom ))
				}
				// New node at the bottom side of the used node.
				if ( usedRect.top < freeRect.top ) {
					rects.push( new Rectangle( freeRect.left, usedRect.top, freeRect.width, freeRect.top - usedRect.top ))
				}
			}

			if ( usedRect.bottom < freeRect.top && usedRect.top > freeRect.bottom ) {
				// New node at the left side of the used node.
				if ( usedRect.left > freeRect.left && usedRect.left < freeRect.right ) {
					rects.push( new Rectangle( freeRect.left, freeRect.bottom, usedRect.left - freeRect.left, freeRect.height ))

				}
				// New node at the right side of the used node.
				if ( usedRect.right < freeRect.right ) {
					rects.push( new Rectangle( usedRect.right, freeRect.bottom, freeRect.right - usedRect.right, freeRect.height ))
				}
			}
			return true
		} else {
			return false
		}
	}

	pruneFreeList() {
		const rects = this.freeRectangles
		for ( let i = 0; i < rects.length; ++i ) {
			for( let j = i+1; j < rects.length; ++j ) {
				if ( rects[j].contains( rects[i])) {
					rects.splice( i, 1 )
					--i
					break
				}
				if ( rects[i].contains( rects[j] )) {
					rects.splice( j, 1 )
					--j
				}
			}
		}
	}
}
