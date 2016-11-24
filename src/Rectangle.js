export class Rectangle {
	constructor( x, y, width, height ) {
		this.x = x
		this.y = y
		this.width = width
		this.height = height
	}

	contains( {x,y,width,height} ) {
		return this.x <= x && this.y <= y && this.x + this.width >= x + width && this.y + this.height >= y + height
	}

	intersects( {x,y,width,height} ) {
		return this.x < x+width && this.x + this.width > x && this.y < y + height && this.y + this.height > y
	}
}
