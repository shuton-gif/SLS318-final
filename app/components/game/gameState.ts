import { toRem } from '../../../utils/toRem'

export type Action = 'left' | 'right' | 'idle'

export type Role = '1' | '2'

export const ROLE_COLORS: Record<Role, string> = {
    '1': '#03AED2',
    '2': '#FCB7C7',
}

export const ROLES: Role[] = ['1', '2']

export type Kind = 'vocab' | 'particle'

export type Player = {
    id: number
    type: Role
    pickupKind?: Kind     // tier-3 gating; undefined = anyone
    x: number
    y: number
    width: number
    height: number
    scale: number
    action: Action
    facing: 'left' | 'right'
    holding: boolean
    heldPieceId: number | null
}

export type PieceState = 'onGround' | 'held' | 'flying'

export type Piece = {
    id: number
    word: string
    kind: Kind
    ownerRole?: Role
    x: number
    y: number
    vx: number
    vy: number
    state: PieceState
}

export type BoxFlash = 'none' | 'correct' | 'wrong'

export type GameState = {
    players: Player[]
    pieces: Piece[]
    submittedSlots: (string | null)[]
    boxFlash: BoxFlash
    flashSlot: number | null
    frozen: boolean
    complete: boolean
    timer: number
}

const HEIGHT: number = 70
const WIDTH: number = 40

export const GROUND_TOP: number = 480
export const PLAYER_Y: number = GROUND_TOP - HEIGHT

// Physics
export const GRAVITY = 0.8
export const THROW_VX = 14
export const THROW_VY = -14

// Goal-rim geometry (single rim's footprint; the x position is per-goal)
export const RIM = {
    BASE_HEIGHT: 150,
    RIM_WIDTH: 200,
    UPRIGHT_HEIGHT: 50,
    BAR_THICKNESS: 8,
    COLOR: 'white',
    COLOR_CORRECT: '#2ecc71',
    COLOR_WRONG: '#e74c3c',
}

export const SCENE_MAX_X = 1100

// Per-player keybindings, indexed by player id.
export type Keymap = { left: string; right: string; action: string; drop: string }
export const KEYMAPS: Keymap[] = [
    { left: 'KeyA', right: 'KeyD', action: 'KeyW', drop: 'KeyS' },
    { left: 'ArrowLeft', right: 'ArrowRight', action: 'ArrowUp', drop: 'ArrowDown' },
]

const makePlayer = (id: number, type: Role, x: number, pickupKind?: Kind): Player => ({
    id,
    type,
    pickupKind,
    x,
    y: PLAYER_Y,
    width: toRem(WIDTH),
    height: toRem(HEIGHT),
    scale: 1,
    action: 'idle',
    facing: 'right',
    holding: false,
    heldPieceId: null,
})

export const initState = (p1Pickup?: Kind, p2Pickup?: Kind): GameState => ({
    players: [
        makePlayer(0, '1', 200, p1Pickup),
        makePlayer(1, '2', 800, p2Pickup),
    ],
    pieces: [],
    submittedSlots: [],
    boxFlash: 'none',
    flashSlot: null,
    frozen: false,
    complete: false,
    timer: 0,
})
