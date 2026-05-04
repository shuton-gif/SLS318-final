'use client'
import { GameState, GROUND_TOP, Piece, Role, ROLE_COLORS } from './gameState'

const PIECE_SIZE = 60
const PIECE_MIN_WIDTH = 60
const PIECE_CHAR_WIDTH = 18
const PIECE_PADDING = 20

export function pieceWidth(word: string): number {
    return Math.max(PIECE_MIN_WIDTH, word.length * PIECE_CHAR_WIDTH + PIECE_PADDING)
}

export default function PuzzlePiece({ gameState, piece, dimmed }: { gameState: GameState; piece: Piece; dimmed?: boolean }) {
    const holder = piece.state === 'held'
        ? gameState.players.find((p) => p.heldPieceId === piece.id)
        : undefined

    let top: number
    let left: number

    const w = pieceWidth(piece.word)
    if (holder) {
        top = holder.y - PIECE_SIZE - 8
        left = holder.x + (holder.width * 16 - w) / 2
    } else if (piece.state === 'flying') {
        top = piece.y
        left = piece.x
    } else {
        top = GROUND_TOP - PIECE_SIZE
        left = piece.x
    }

    // Color: if owner is set, use that role's color; else neutral white.
    const bg = piece.ownerRole ? ROLE_COLORS[piece.ownerRole as Role] : '#ffffff'

    return (
        <div
            style={{
                position: 'absolute',
                height: `${PIECE_SIZE}px`,
                width: `${w}px`,
                top: `${top}px`,
                left: `${left}px`,

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                fontSize: '1.6rem',
                color: 'black',
                backgroundColor: bg,
                border: '2px solid #222',
                opacity: dimmed ? 0.35 : 1,
                userSelect: 'none',
            }}
        >
            {piece.word}
        </div>
    )
}

export { PIECE_SIZE }
