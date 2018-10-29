function isLetter(str) {
  if (str == null || str.length < 1)
    return false;
  return str.length === 1 && str.match(/[a-z]/i);
}


// this converts a FEN position into an array
function parsePosition(pos) {
	position = [ [], [], [], [], [], [], [], [] ];
	var j = 0;
	var k = 0;
	for (var i = 0; i < pos.length; i++) {
		
		// a '/' indicates a new rank
		if (pos[i] == '/') {
			j++;
			k = 0;
		}
		
		// a number x indicates a sequence of x empty cells
		else if (!isNaN(pos[i])) {
      for (var b = 0; b < pos[i]; b++) {
        position[j][k] = '0';
        k++;
      }
    }
		
		// a letter indicates a piece
		else if (isLetter(pos[i])) {
			position[j][k] = pos[i];
			k++;
		}		
	}
	
	return position;
}

// this coverts the position array into a FEN position
function encodePosition() {
  var FEN = '';
  var emptySquares = 0;
  var numberWritten = false

  for (var i = 0; i < position.length; i++) {
    emptySquares = 0;
    numberWritten = false;
    for (var j = 0; j < position[i].length; j++) {      
      if (isLetter(position[i][j])) {
        FEN += position[i][j];
        emptySquares = 0;
        numberWritten = false;
      }
      else {
        emptySquares++;
        if (j < 7 && isLetter(position[i][j + 1])) {
          FEN += emptySquares;
          numberWritten = true;
        }
        else if (j == 7 && !numberWritten)
          FEN += emptySquares;
      }
    }
    if (i < 7)
      FEN += '/';
  }

  pieces = FEN;
  updateFEN();
}

// this updates a table cell based on the contents of an array element
function setSquare(square, coords) {
	var rank = coords[0];
	var file = coords[1];
	var img = "";

	switch (position[rank][file]) {
		case 'p':
			img = bPimg;
			break;
		case 'r':
			img = bRimg;
			break;
		case 'n':
			img = bNimg;
			break;
		case 'b':
			img = bBimg;
			break;
		case 'q':
			img = bQimg;
			break;
		case 'k':
			img = bKimg;
			break;
		case 'P':
			img = wPimg;
			break;
		case 'R':
			img = wRimg;
			break;
		case 'N':
			img = wNimg;
			break;
		case 'B':
			img = wBimg;
			break;
		case 'Q':
			img = wQimg;
			break;
		case 'K':
			img = wKimg;
			break;
		default:
			img = blank;
			break;
	}

	document.getElementById(square).innerHTML = '<img src=\"' + img + '\">';
}


// this updates the table based on the contents of the position array
function displayPosition() {

  for (var key in coordMap) {
    setSquare(key, coordMap[key]);
  }
}


function createTable(view) {
  const files = 'abcdefgh';
  var table = document.createElement('table');
  table.className = 'board';

  if (view == 'w') {
    for (var rank = 8; rank > 0; rank--) {
      var tr = document.createElement('tr');
      for (var file = 0; file < 8; file++) {
        var td = document.createElement('td');
        td.setAttribute('id', files[file].toString() + rank.toString());
        td.setAttribute('onclick', 'onSelect(\'' + files[file].toString() + rank.toString() + '\')');
        if ((file % 2 != 0 && rank % 2 == 0) || (file % 2 == 0 && rank % 2 != 0))
          td.setAttribute('class', 'dark');
        else
          td.setAttribute('class', 'light');
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
  }
  else {
    for (var rank = 1; rank <= 8; rank++) {
      var tr = document.createElement('tr');
      for (var file = 7; file >= 0; file--) {
        var td = document.createElement('td');
        td.setAttribute('id', files[file].toString() + rank.toString());
        td.setAttribute('onclick', 'onSelect(\'' + files[file].toString() + rank.toString() + '\')');
        if ((file % 2 != 0 && rank % 2 == 0) || (file % 2 == 0 && rank % 2 != 0))
          td.setAttribute('class', 'dark');
        else
          td.setAttribute('class', 'light');
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
  }

  document.getElementById('chessboard').appendChild(table);
}


function clearTable() {
  const boardArea = document.getElementById('chessboard');
  if (boardArea.childNodes.length > 0)
    boardArea.removeChild(boardArea.childNodes[0]);
}


function flipBoard() {
  clearTable();
  if (view == 'w') {
    view = 'b';
    createTable('b');
  }
  else {
    view = 'w';
    createTable('w');
  }
  displayPosition();
}


function updateBoard() {
  position = parsePosition(pieces);
  clearTable();
  createTable('w');
  displayPosition();
  updateFEN();
}


function resetBoard() {
  pieces = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
  view = 'w';
  pieceSelected = false;
  moves = [];
  turn = 'w';
  fullMoves = 1;
  halfMoveClock = 0;
  enPassantSquare = '-';
  castlingOptions = 'KQkq';
  updateBoard();
}


function loadPosition(FEN) {
  FEN = FEN.split(' ');
  pieces = FEN[0];
  turn = FEN[1];
  castlingOptions = FEN[2];
  enPassantSquare = FEN[3];
  halfMoveClock = FEN[4];
  fullMoves = FEN[5];
  updateBoard();
}


function updateFEN() {
  positionFEN = pieces + ' ' + turn + ' ' + castlingOptions + ' ' 
	+ enPassantSquare + ' ' + halfMoveClock + ' ' + fullMoves;
  document.getElementById('FEN').value = positionFEN;
}


function customPosition() {
 const FEN = document.getElementById('FEN').value;
 loadPosition(FEN);
}
