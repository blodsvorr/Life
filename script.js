// GAME OF LIFE

// 8 Direction enum
const D = Object.freeze( {
	N: 1 ,
	S: 2 ,
	E: 4 ,
	W: 8 ,
	NE: 5,
	SE: 6,
	SW: 10,
	NW: 9
} );

// class Cell to store 2d matrix coords and methods to probe neighbors.
class Cell {
	constructor ( y , x ) {
		this.y = y ;
		this.x = x ;
	}
	get y () { return this._y }
	get x () { return this._x }
	set y (y) { this._y = y }
	set x (x) { this._x = x }

	/**
	* @param {number[][]}
	* {@return {Cell[]}
	* Collect all 8 neighbors. If their indices are out of bounds,
	* they will be undefined upon access and will NOT throw an error.
	*/
	getNeighbors () {
		let directions = Object.keys( D ) ;
		let neighbors = [] ;
		for ( let direction of directions ) {
			let neighbor = new Cell ( this.y , this.x ) ;
			if ( (D[direction] & D.N) === D.N ) { neighbor.y -= 1 ;}
			if ( (D[direction] & D.S) === D.S ) { neighbor.y += 1 ;}
			if ( (D[direction] & D.E) === D.E ) { neighbor.x += 1 ;}
			if ( (D[direction] & D.W) === D.W ) { neighbor.x -= 1 ;}
			neighbors.push ( neighbor ) ;
		}
		return neighbors ;
	};

	/**
	* @param {Cell[]} {number[][]}
	* @return {number}
	*/
	tallyLiveNs ( grid ) {
		let neighbors = this.getNeighbors() ;
		let alive = 0 ;
		for (var i = 0 ; i < neighbors.length ; i++ ) {
			let c = neighbors[i] ;
      		if ( (c.y >= 0 && c.y < grid.length) && (c.x >= 0 && c.x < grid[0].length) )
		  		{ alive += ( grid[c.y][c.x] === 1 ? 1 : 0 ) ;}
		}
		return alive ;
	};

	/**
 	* @param {number} {number}
	* @return {number 1 || 0}
	*/
	nextGenVal ( grid ) {
		let cellVal = grid[this.y][this.x] ;
		let liveNeighbors = this.tallyLiveNs ( grid ) ;
		if ( cellVal === 1 ) {
        	if ( liveNeighbors === 2 || liveNeighbors === 3 )
          		{ return 1 ;}
        	if ( liveNeighbors < 2 || liveNeighbors > 3 )
          		{ return 0 ;}
		}
		if ( cellVal === 0 && liveNeighbors === 3 )
			{ return 1 ;}

    	return cellVal ;
	};
}


// XORSHIFT RNG

function xorshRNG ( seed=0, min=0, max=19 ) {
	let ms = Date.now() ;
	let bulb =  (ms >>> 4) + 1 + seed ;
	let blossom = bulb ;

	for ( var i = 0 ; i < 64 * ( bulb % 4 === 0 ? 1 : 2 ) ; i++ ) {
		blossom ^= blossom << 7 ;
		blossom ^= blossom >> 9 ;
		blossom ^= blossom << 8 ;
	}

	let spread = max - min + 1 ;
	let bloom = blossom % spread ;

	bloom = ( bloom < 0 ? ~bloom + 1 : bloom ) ;
	bloom = ( bloom === -0 ? 0 : bloom ) ;

	return bloom ;
};

// @param {number(chars)} {number(chars)} {number(decimal fraction)}
// @return {number[](indices)}
function zStateGOLmatrix ( gridHeight, gridWidth, density ) {
	const TOTALCELLSPACE = gridHeight * gridWidth ;
	let zStateLiveCellQuantity = Math.floor ( TOTALCELLSPACE * density ) ;
	let liveIndices = [] ;
	let matrix = [] ;

	// fill matrix with dead cells (0s)
	for ( var y = 0 ; y < gridHeight ; y++ ) {
		let row = []
		for ( var x = 0 ; x < gridWidth ; x++ )
			{ row[x] = 0 ;}
		matrix[y] = row ;
	}

	// get liveCell indices (from 0 to TOTALCELLSPACE)
	for ( var i = 0 ; i < zStateLiveCellQuantity ; i++ ) {
		liveIndices[i] = xorshRNG ( i+1 , 0 , TOTALCELLSPACE - 1 ) ;
	}

	// activate live cells
	for ( var k = 0 ; k < liveIndices.length ; k++ ) {
		var y1 = Math.floor ( liveIndices[k] / gridWidth ) ;
		var x1 = liveIndices[k] - y1 * gridWidth ;
		matrix[y1][x1] = 1 ;
	}

	return matrix  ;
};

// STRING BUILDER FROM 2D ARRAY
// @param {number(decimal fraction} {number(chars)} {number(chars)}
// @return {number[][]}
function buildStateStr ( grid ) {
	let str = '' ;

	for ( var y in grid ) {
		for ( var x in grid[y] ) {
			if ( grid[y][x] === 1)
				{ str += 'O' ;}
			else
				{ str += '&nbsp;' ;}
		}
		str += '\n\r'
	}

	return str ;
};


/**
* @param {number[][] 1 || 0}
* @return {void}
*/
var stepOfLife = function ( board ) {
	let stack = [] ;
  	let cellVal ;
  	let nextGenVal ;

	for ( var i = 0 ; i < board.length ; i++ ) {
		for ( var j = 0 ; j < board[0].length ; j++ ) {
			let cell = new Cell ( i , j ) ;
			cellVal = board[i][j] ;
			nextGenVal = cell.nextGenVal ( board ) ;
			if ( nextGenVal != cellVal ) {
				{ stack.push ( cell ) ;}
      		}
		}
	}

	for ( var c = 0 ; c < stack.length ; c++ ) {
    let cell = stack[c] ;
		let val = board[cell.y][cell.x] ;
		board[cell.y][cell.x] = 1 - val ;
	}

	return ;
};

// Main Function : GAME OF LIFE
function gameOfLife () {
	const zState = zStateGOLmatrix ( 256, 256 , 0.5 ) ;
	let currState = zState ;
	let startStateStr = buildStateStr ( zState ) ;
	let stateStr ;
	document.getElementById ( 'windowOfLife' ).innerHTML = zState ;

	function interval () {
		let stateStr = buildStateStr ( currState ) ;
		document.getElementById ( 'windowOfLife' ).innerHTML = stateStr ;
		stepOfLife ( currState ) ;
		return ;
	};

	setInterval ( interval, 100 ) ;

	return
};

gameOfLife() ;
