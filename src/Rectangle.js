export class Rectangle {
	constructor( x, y, width, height, rotated = false, id = -1 ) {
		this.x = x
		this.y = y
		this.width = width
		this.height = height
		this.rotated = rotated
		this.id = id
	}

	get left() {
		return this.x
	}

	get right() {
		return this.x + this.width
	}

	get bottom() {
		return this.y
	}

	get top() {
		return this.y + this.height
	}

	contains( {x,y,width,height} ) {
		return this.x <= x && this.y <= y && this.x + this.width >= x + width && this.y + this.height >= y + height
	}

	intersects( {x,y,width,height} ) {
		return this.x < x+width && this.x + this.width > x && this.y < y + height && this.y + this.height > y
	}
}
