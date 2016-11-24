import {Rectangle} from './Rectangle'

export class MaxRects {
	constructor( width, height, allowRotation ) {
		this.binWidth = width
		this.binHeight = height
		this.freeRectangles = [new Rectangle(0, 0, width, height)]
		this.usedRectangles = []
		this.allowRotation = allowRotation
	}

	getOccupancy() {
		return this.usedRectangles.reduce( (acc,{width,height}) => acc + width*height, 0 ) / (this.binWidth*this.binHeight);
	}
	
	insert( whs, fitMethod ) {
		const method = fitMethod || MaxRects.BestAreaFit
		const rects = whs.slice()
		while ( rects.length > 0 ) {
			let bestScore1 = Infinity
			let bestScore2 = Infinity
			let bestRect = null
			let bestRectIndex = -1

			rects.forEach( ([width,height], i) => {
				const {score1,score2,node} = method( this, width, height )
				if ( score1 < bestScore1 || (score1 == bestScore1 && score2 < bestScore2 )) {
					bestScore1 = score1
					bestScore2 = score2
					bestRect = node
					bestRectIndex = i
				}
			})

			if ( bestRect != null ) {
				this.placeRect( bestRect )
				rects.splice( bestRectIndex, 1 )
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

	static BestAreaFit( self, width, height ) {
		const bestRect = new Rectangle( 0, 0, 0, 0 )

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
					bestRect.x = freeRect.x
					bestRect.y = freeRect.y
					bestRect.width = width
					bestRect.height = height
					bestShortSideFit = shortSideFit
					bestAreaFit = areaFit
				}
			}

			if ( self.allowRotation && freeRect.width >= height && freeRect.height >= width) {
				const leftoverHoriz = Math.abs( freeRect.width - height )
				const leftoverVert = Math.abs( freeRect.height - width )
				const shortSideFit = Math.min( leftoverHoriz, leftoverVert )

				if ( areaFit < bestAreaFit || ( areaFit == bestAreaFit && shortSideFit < bestShortSideFit )) {
					bestRect.x = freeRect.x
					bestRect.y = freeRect.y
					bestRect.width = height
					bestRect.height = width
					bestShortSideFit = shortSideFit
					bestAreaFit = areaFit
				}
			}
		})

		return { score1: bestAreaFit, score2: bestShortSideFit, node: bestRect }
	}
	
	splitFreeRect( freeRect, usedRect ) {
		if ( usedRect.intersects( freeRect )) {
			const fleft = freeRect.x
			const fright = freeRect.x + freeRect.width
			const fbottom = freeRect.y
			const ftop = freeRect.y + freeRect.height 
			const uleft = usedRect.x
			const uright = usedRect.x + usedRect.width
			const ubottom = usedRect.y
			const utop = usedRect.y + usedRect.height 
			const rects = this.freeRectangles
			if ( uleft < fright && uright > fleft ) {
				// New node at the top side of the used node.
				if ( ubottom > fbottom && ubottom < ftop ) {
					rects.push( new Rectangle( fleft, fbottom, freeRect.width, ubottom - fbottom ))
				}
				// New node at the bottom side of the used node.
				if ( utop < ftop ) {
					rects.push( new Rectangle( fleft, utop, freeRect.width, ftop - utop ))
				}
			}

			if ( ubottom < ftop && utop > fbottom ) {
				// New node at the left side of the used node.
				if ( uleft > fleft && uleft < fright ) {
					rects.push( new Rectangle( fleft, fbottom, uleft - fleft, freeRect.height ))

				}
				// New node at the right side of the used node.
				if ( uright < fright ) {
					rects.push( new Rectangle( uright, fbottom, fright - uright, freeRect.height ))
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
