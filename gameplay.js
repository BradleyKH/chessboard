/*
when a pawn moves up 2 spaces, store the en passant square
when a pawn attempts to capture, check the en passant square
when a pawn moves, check for promotion on 8th rank
when a piece is captured, add it to a captured array and show it on the interface
when a king or rook moves, adjust the castling availability

need a function to...
 generate move notation
 parse move notation
 check for available moves
 check for checks
 check if castling is legal
 show pawn promotion options
need an object for each kind of piece, determining how it moves.
*/


function nextTurn() {
	turn = turn == 'w' ? 'b' : 'w';
}


function onSelect(clickedSquare) {
	// view is not the latest move
	if (viewHalfMove != halfMoves) {
		warn('You are not viewing the latest position. Scroll forward to move.');
		return;
	}

	var newCoord = getCoord(clickedSquare);
	if (pieceSelected) {
		
		// clear the selectColor if the same piece is clicked twice
		if (clickedSquare == selectedSquare) {
			pieceSelected = false;
			updateBoard();
			return;
		}
		
		var oldCoord = getCoord(selectedSquare);
		var piece = getPiece(oldCoord);
		var target = getPiece(newCoord);
		var capture = target != '0' || clickedSquare == enPassantSquare;
		
		// black cannot capture black pieces
		if (piece == piece.toLowerCase() && target == target.toLowerCase() && target != '0') {
			updateBoard();
			document.getElementById(clickedSquare).style.background = selectColor;
			selectedSquare = clickedSquare;
			return;
		}
		
		// white cannot capture white pieces
		else if (piece == piece.toUpperCase() && target == target.toUpperCase() && target != '0') {
			updateBoard();
			document.getElementById(clickedSquare).style.background = selectColor;
			selectedSquare = clickedSquare;
			return;
		}
		
		if (isLegalMove(piece, selectedSquare, clickedSquare, capture)) {
			move(piece, selectedSquare, clickedSquare, capture);
			clearAlerts();
		}
	}
  
	// no piece already selected
	else {
		
		// clear selectColor that may be on another piece of the same color
		updateBoard();
		
		var piece = position[newCoord[0]][newCoord[1]];
		
		// white cannot move black pieces
		if (turn == 'w') {
			if (piece == piece.toLowerCase() && piece != '0') {
				warn('It is White\'s turn.');
				document.getElementById(clickedSquare).style.background = selectColor;
				return;
			}
		}
		
		// black cannot move white pieces
		else {
			if (piece == piece.toUpperCase() && piece != '0') {
				warn('It is Black\'s turn.');
				document.getElementById(clickedSquare).style.background = selectColor;
				return;
			}
		}
		
		// do not select empty squares
		if (document.getElementById(clickedSquare).innerHTML != '<img src=\"images/blank.png\">') {
			document.getElementById(clickedSquare).style.background = selectColor;
			pieceSelected = true;
			selectedSquare = clickedSquare;
		}
		
		// show possible moves if enabled
		if (showPossibleMoves && piece != '0')
			showPossibleMoves(selectedSquare);
	}
}


function isLegalMove(piece, origin, destination, capture) { // needs a lot of work
	var endCoord = getCoord(destination);
	var startCoord = getCoord(origin);
	
	// check checks
	// not implemented
	
	switch (piece) {
		case 'P':
			// white pawn moves 1 space forward
			if (
				!capture && // not a capture
				origin[0] == destination[0] && // same file
				destination[1] - origin[1] == 1 // move 1 space forward
			)
				return true;
                
			// white pawn captures
			else if (
				capture && // is a capture
                destination[1] - origin[1] == 1 && Math.abs(startCoord[1] - endCoord[1]) == 1 // moves 1 space diagonally forward
			)
				return true;
                
			// white pawn moves 2 spaces forward
			else if (
				!capture && // not a capture
				origin[0] == destination[0] && // same file
				destination[1] - origin[1] == 2 && // move 2 spaces forward
				origin[1] == '2' && // pawn is on the second rank, so it hasn't moved yet
				getPiece((parseInt(startCoord[0]) - 1).toString() + startCoord[1]) == '0' // no piece in front of pawn
			)
				return true;
			else
				return false;
			break;
		case 'p':
			// black pawn moves 1 space forward
			if (
				!capture && // not a capture
				origin[0] == destination[0] && // same file
				origin[1] - destination[1] == 1 // move 1 space forward
			)
				return true;

			// black pawn captures
			else if (
				capture && // is a capture
                origin[1] - destination[1] == 1 && Math.abs(startCoord[1] - endCoord[1]) == 1 // moves 1 space diagonally forward
			)
				return true;
                
			// black pawn moves 2 spaces forward
			else if (
				!capture && // not a capture
				origin[0] == destination[0] && // same file
				origin[1] - destination[1] == 2 && // move 2 spaces forward
				origin[1] == '7' && // pawn is on the seventh rank, so it hasn't moved yet
				getPiece((parseInt(startCoord[0]) + 1).toString() + startCoord[1]) == '0' // no piece in front of pawn
			)
				return true;
			else
				return false;
			break;
		case 'R':
		case 'r':
			// the move is on the same file
			
			// the move is on the same rank
			break;
		case 'B':
		case 'b':
			// the move is diagonal
			break;
		case 'N':
		case 'n':
			break;
		case 'Q':
		case 'q':
			// the move is on the same file
			
			// the move is on the same rank
			
			// the move is diagonal
			break;
		case 'K':
			// white king moves to an adjacent square
			if (Math.abs(endCoord[0] - startCoord[0]) < 2 && Math.abs(endCoord[1] - startCoord[1]) < 2)
				return true;
						
			// white king moves to a castling square
			else if (origin == 'e1' && destination == 'g1')
				return canCastle('K');
			else if (origin == 'e1' && destination == 'c1')
				return canCastle('Q');
			else
				return false;
			break;
		case 'k':
			// black king moves to an adjacent square
			if (Math.abs(endCoord[0] - startCoord[0]) < 2 && Math.abs(endCoord[1] - startCoord[1]) < 2)
				return true;
			
			// black king moves to a castling square
			else if (origin == 'e8' && destination == 'g8')
				return canCastle('k');
			else if (origin == 'e8' && destination == 'c8')
				return canCastle('q');
			else
				return false;
			break;		
	}
	
	return true;
}


function move(piece, origin, destination, capture) {
	var endCoord = getCoord(destination);
	var startCoord = getCoord(origin);
	position[endCoord[0]][endCoord[1]] = piece;
	position[startCoord[0]][startCoord[1]] = '0';	
	
	// update castling options for king and rook moves
	if (piece.toLowerCase() == 'k' || piece.toLowerCase() == 'r')
		updateCastlingOptions(piece, origin[0]);
	
	// handle castling
	if (piece.toLowerCase() == 'k') {		
		if (origin == 'e8' && destination == 'g8')
			castle('k');
		else if (origin == 'e8' && destination == 'c8')
			castle('q');
		else if (origin == 'e1' && destination == 'g1')
			castle('K');
		else if (origin == 'e1' && destination == 'c1')
			castle('Q');
	}
	
	// notate the move
	recordMove(piece, origin, destination, capture);
	
	// if initial pawn 2-space move, store ep square, else clear ep square
	
	// update halfMoveClock for 50-move rule
	if (piece.toLowerCase() == 'p' || capture)
		halfMoveClock = 0;	
	else
		halfMoveClock++;
	
	halfMoves++;
	viewHalfMove++;
	if (turn == 'b')
		fullMoves++;
	nextTurn();
	pieceSelected = false;
	encodePosition();
	recordPosition();
	if (autoFlip)
		flipBoard();
	else
		updateBoard();
}


function showPossibleMoves(square) {
	// not implemented
}


function recordMove(piece, origin, destination, capture) {
	var move = '';
	
	// castling
	if (piece.toLowerCase() == 'k' && origin[0] == 'e' && destination[0] == 'g')
		move += 'O-O';
	else if (piece.toLowerCase() == 'k' && origin[0] == 'e' && destination[0] == 'c')
		move += 'O-O-O';
		
	else {
		if (piece.toLowerCase() != 'p')
			move += piece.toUpperCase();
	
		// need to account for multiple Knights or Rooks able to move to destination (e.g. Nbd2)
	
		if (piece.toLowerCase() == 'p' && capture)
			move += origin[0];
		
		if (capture)
			move += 'x';
		
		move += destination;
	}

	// need to account for checks

	moves[moves.length] = move;
	
	updateMoves();
}


function updateMoves() {
	var moveRecord = '';
	var moveNumber = 1;
	
	for (var i = 0; i < moves.length; i++) {
		if (i % 2 == 0) {
			moveRecord += moveNumber + '. ';
			moveNumber++
		}
		moveRecord += moves[i] + ' ';
	}
	
	document.getElementById('moves').innerHTML = moveRecord;
}


function castle(corner) {
	switch(corner) {
		case "K":
			position[7][4] = '0';
			position[7][5] = 'R';
			position[7][6] = 'K';
			position[7][7] = '0';
			break;
		case "k":
			position[0][4] = '0';
			position[0][5] = 'r';
			position[0][6] = 'k';
			position[0][7] = '0';
			break;
		case "Q":
			position[7][0] = '0';
			position[7][2] = 'K';
			position[7][3] = 'R';
			position[7][4] = '0';
			break;
		case "q":
			position[0][0] = '0';
			position[0][2] = 'k';
			position[0][3] = 'r';
			position[0][4] = '0';
			break;
	}
}


function canCastle(corner) {
	// not implemented
	var isOption = false;
	var isClear = false;	
	
	// determine if the king or rook has moved
	for (var i = 0; i < castlingOptions.length; i++) {		
		if (castlingOptions[i] == corner)
			isOption = true;
	}
	
	// determine if there are no pieces between the king and rook
	switch (corner) {
		case "K":
			if (position[7][5] == '0' && position[7][6] == '0')
				isClear = true;
			break;
		case "k":
			if (position[0][5] == '0' && position[0][6] == '0')
				isClear = true;			
			break;
		case "Q":
			if (position[7][1] == '0' && position[7][2] == '0' && position[7][3] == '0')
				isClear = true;
			break;
		case "q":
			if (position[0][1] == '0' && position[0][2] == '0' && position[0][3] == '0')
				isClear = true;
			break;
	}
	
	// determine if any of the 3 squares are in check
	//not implemented
	var noChecks = true;
	
	return isOption && isClear && noChecks;
}


// updates castling options for king and rook moves
function updateCastlingOptions(piece, file) {	
	
	var newCastlingOptions = '';
	
	// king moves
	if (piece.toLowerCase() == 'k') {
		
		// remove all castling options for a color when its king moves
		if (turn == 'w' && castlingOptions != '-') {
			newCastlingOptions = removeFromString(castlingOptions, 'K');
			newCastlingOptions = removeFromString(castlingOptions, 'Q');
		}
		else if (turn == 'b' && castlingOptions != '-') {
			newCastlingOptions = removeFromString(castlingOptions, 'k');
			newCastlingOptions = removeFromString(castlingOptions, 'q');
		}
		
		castlingOptions = newCastlingOptions == '' ? '-' : newCastlingOptions;
	}
	
	// queen's rook moves
	if (piece.toLowerCase() == 'r' && file == 'a') {		
		
		if (turn == 'w' && castlingOptions != '-')
			newCastlingOptions = removeFromString(castlingOptions, 'Q');
		else if (turn == 'b' && castlingOptions != '-')
			newCastlingOptions = removeFromString(castlingOptions, 'q');
		
		castlingOptions = newCastlingOptions == '' ? '-' : newCastlingOptions;
	}
	
	// king's rook moves
	if (piece.toLowerCase() == 'r' && file == 'h') {		
		
		if (turn == 'w' && castlingOptions != '-')
			newCastlingOptions = removeFromString(castlingOptions, 'K');
		else if (turn == 'b' && castlingOptions != '-')
			newCastlingOptions = removeFromString(castlingOptions, 'k');
		
		castlingOptions = newCastlingOptions == '' ? '-' : newCastlingOptions;
	}	
}