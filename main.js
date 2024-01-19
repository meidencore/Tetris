import './style.css'


// Inicializar el canvas
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
const BLOCK_SIZE = 20
const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20

const $score = document.querySelector('span')

let score = 0

canvas.height = BLOCK_SIZE * BOARD_HEIGHT
canvas.width = BLOCK_SIZE * BOARD_WIDTH

context.scale(BLOCK_SIZE, BLOCK_SIZE)

function createBoard(height, width) {
  return Array(height).fill().map(() => Array(width).fill(0))
}

const board = createBoard(BOARD_HEIGHT, BOARD_WIDTH)

// Pieces
const PIECES = [
  [
    [1,1],
    [1,1]
  ],
  [
    [0,1,0],
    [1,1,1]
  ],
  [
    [1,1,0],
    [0,1,1]
  ],
  [
    [0,1,1],
    [1,1,0]
  ],
  [
    [0,1],
    [0,1],
    [1,1]
  ],
  [
    [1,0],
    [1,0],
    [1,1]
  ],
  [
    [1],
    [1],
    [1],
    [1]
  ]  
]

const piece = {
  position: {x: 6, y: 0},
  shape: [
    [1,1],
    [1,1],
  ]
}


// Game Loop & AutoDrop

let dropCounter = 0
let lastTime = 0

function update (time = 0) {
  const deltaTime = time - lastTime
  lastTime = time

  dropCounter += deltaTime

  if(dropCounter > 1000) {
    piece.position.y++ 
    if (checkCollision(piece.shape)) {
      piece.position.y--
      solidifyPiece()
      removeRows()
    }
    dropCounter = 0
  }

  draw()
  window.requestAnimationFrame(update)

}
 

function draw() {
  context.fillStyle = '#000'
  context.fillRect( 0, 0, canvas.width, canvas.height)

  board.forEach((row, y) =>{
    row.forEach((value, x) => {
      if (value === 1) {
        context.fillStyle = 'yellow'
        context.fillRect(x, y, 1, 1)
      }
    })
  })

  piece.shape.forEach((row, y) =>{
    row.forEach((value, x) => {
      if (value === 1) {
        context.fillStyle = 'red'
        context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1)
      }
    })
  })
}

// Rotate Piece

function rotatePiece (pieceShape) {
  const rows = pieceShape.length;
  const columns = pieceShape[0].length;
  const rotatedPiece = Array(columns).fill().map(() => Array(rows).fill(0));
  for (let i = 0; i < rows; i++ ) {
    const mirrorPosition = rows-1-i
    for (let j = 0; j < columns; j++) {
      rotatedPiece[j][mirrorPosition] = pieceShape[i][j]
    }
  }
  
  const prevShape = pieceShape
  if (checkCollision(rotatedPiece)) {
    return prevShape
  }

  return rotatedPiece
}

document.addEventListener('keydown', event => {
  // Move Left
  if (event.key === 'ArrowLeft') {
    piece.position.x--
    if (checkCollision(piece.shape)) {
      piece.position.x++
    }
  }
  // Move Right
  if (event.key === 'ArrowRight') {
    piece.position.x++
    if (checkCollision(piece.shape)) {
      piece.position.x--
    }
  }
  // Drop Faster
  if (event.key === 'ArrowDown') {
    piece.position.y++
    if (checkCollision(piece.shape)) {
      piece.position.y--
      solidifyPiece()
      removeRows()
    }
  }
  // Rotate
  if (event.key === 'ArrowUp') {piece.shape = rotatePiece(piece.shape)}
  } 
)

function checkCollision (pieceShape) {
  return pieceShape.find((row, y) => {
    return row.find((value, x) => {
      return (
        value !== 0 &&
        board[y + piece.position.y]?.[x + piece.position.x] !== 0
      )
    })
  })
}

function solidifyPiece() {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        board[y + piece.position.y][x + piece.position.x] = 1
      }
    })
  })
  
  /// New Piece and reset position
  piece.shape = PIECES[Math.floor(Math.random() * PIECES.length)]
  piece.position.x = Math.floor(Math.random() * (BOARD_WIDTH - (piece.shape[0].length - 1)))
  piece.position.y = 0
  if (checkCollision(piece.shape)) {
    window.alert('Game Over, Sorry!!')
    board.forEach(rows => rows.fill(0))
  }

}

function removeRows () {
  const rowsToRemove = []

  board.forEach((row, y) => {
    if (row.every(value => value === 1)) {
      rowsToRemove.push(y)
      score += 10
      $score.innerText = score
    }
  })

  rowsToRemove.forEach(y =>{
    board.splice(y, 1)
    const newRow = Array(BOARD_WIDTH).fill(0)
    board.unshift(newRow)
  })
}

const $section = document.querySelector('section')
$section.addEventListener('click', () => {
  
  $section.remove()

  update()
  const audio = new window.Audio('./media/tetris.mp3')
  audio.volume = 0.5
  audio.loop = true
  audio.play()
})