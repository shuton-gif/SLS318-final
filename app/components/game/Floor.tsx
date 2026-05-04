'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './Game.module.css'
import {
    GameState, KEYMAPS, Kind, Piece, Player as PlayerType, Role,
    GROUND_TOP, GRAVITY, RIM, SCENE_MAX_X, THROW_VX, THROW_VY, initState,
} from './gameState'
import Player from '../../Player/player'
import PuzzlePiece, { PIECE_SIZE, pieceWidth } from './PuzzlePiece'
import HUD from './HUD'
import { Floor as FloorData, getRoleAssignment, nextFloorNumber, TOTAL_FLOORS } from '../../../data/floors'

const TIER_ACCENT: Record<FloorData['tier'], string> = {
    vocabulary: '#03AED2',
    particles: '#FEFD99',
    construction: '#FF6BD6',
}

type Goal = { x: number; slotIndex: number }

type FloorConfig = {
    slotCount: number
    expected: string[]
    goals: Goal[]
    pieceSpecs: { word: string; kind: Kind; ownerRole?: Role }[]
    p1Pickup?: Kind
    p2Pickup?: Kind
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

function buildConfig(f: FloorData): FloorConfig {
    if (f.tier === 'vocabulary') {
        const slotCount = 1
        const expected = [f.JP]
        const goals: Goal[] = [{ x: SCENE_MAX_X / 2, slotIndex: 0 }]
        const pieceSpecs = [
            { word: f.JP, kind: 'vocab' as Kind },
            ...f.dummies.map((w) => ({ word: w, kind: 'vocab' as Kind })),
        ]
        return { slotCount, expected, goals, pieceSpecs }
    }
    if (f.tier === 'particles') {
        const slotCount = f.answer.length
        const expected = f.answer
        const goals = layoutGoals(slotCount)
        const pieceSpecs = [
            ...f.answer.map((w) => ({ word: w, kind: 'particle' as Kind })),
            ...f.dummies.map((w) => ({ word: w, kind: 'particle' as Kind })),
        ]
        return { slotCount, expected, goals, pieceSpecs }
    }
    // construction
    const role = getRoleAssignment(f.floor)
    const p1Role: Role = '1'
    const p2Role: Role = '2'
    const slotCount = f.answer.length
    const expected = f.answer
    const goals = layoutGoals(slotCount)
    const ownerForKind = (k: Kind): Role => (role.p1 === k ? p1Role : p2Role)
    const pieceSpecs = [
        ...f.vocab_pieces.map((w) => ({ word: w, kind: 'vocab' as Kind, ownerRole: ownerForKind('vocab') })),
        ...f.particle_pieces.map((w) => ({ word: w, kind: 'particle' as Kind, ownerRole: ownerForKind('particle') })),
        ...f.dummies.vocab.map((w) => ({ word: w, kind: 'vocab' as Kind, ownerRole: ownerForKind('vocab') })),
        ...f.dummies.particle.map((w) => ({ word: w, kind: 'particle' as Kind, ownerRole: ownerForKind('particle') })),
    ]
    return { slotCount, expected, goals, pieceSpecs, p1Pickup: role.p1, p2Pickup: role.p2 }
}

function layoutGoals(_n: number): Goal[] {
    // Single submission goal at center-bottom for all tiers; slot index is
    // resolved per-throw against the next matching empty slot.
    return [{ x: SCENE_MAX_X / 2, slotIndex: -1 }]
}

function buildInitialPieces(specs: FloorConfig['pieceSpecs']): Piece[] {
    let id = 0
    const all = shuffle(specs).map<Piece>((s) => ({
        id: id++,
        word: s.word,
        kind: s.kind,
        ownerRole: s.ownerRole,
        x: 0,
        y: GROUND_TOP - PIECE_SIZE,
        vx: 0,
        vy: 0,
        state: 'onGround',
    }))
    let cursor = 80
    const gap = 20
    for (const p of all) {
        p.x = cursor
        cursor += pieceWidth(p.word) + gap
    }
    return all
}

function isInAnyGoal(piece: Piece, goals: Goal[]): boolean {
    const cx = piece.x + pieceWidth(piece.word) / 2
    const cy = piece.y + PIECE_SIZE / 2
    for (const g of goals) {
        const left = g.x - RIM.RIM_WIDTH / 2 + RIM.BAR_THICKNESS
        const right = g.x + RIM.RIM_WIDTH / 2 - RIM.BAR_THICKNESS
        const top = GROUND_TOP - RIM.BASE_HEIGHT - RIM.UPRIGHT_HEIGHT
        const bottom = GROUND_TOP - RIM.BASE_HEIGHT
        if (cx >= left && cx <= right && cy >= top && cy <= bottom) return true
    }
    return false
}

function nextMatchingSlot(word: string, expected: string[], submitted: (string | null)[]): number {
    for (let i = 0; i < expected.length; i++) {
        if (submitted[i] == null && expected[i] === word) return i
    }
    return -1
}

export default function FloorView({ floor }: { floor: FloorData }) {
    const router = useRouter()
    const cfg = useMemo(() => buildConfig(floor), [floor])
    const [gameState, setGameState] = useState<GameState>(() => ({
        ...initState(cfg.p1Pickup, cfg.p2Pickup),
        pieces: buildInitialPieces(cfg.pieceSpecs),
        submittedSlots: Array(cfg.slotCount).fill(null),
    }))
    const cfgRef = useRef(cfg)
    useEffect(() => { cfgRef.current = cfg }, [cfg])
    const frozenRef = useRef(false)
    useEffect(() => { frozenRef.current = gameState.frozen }, [gameState.frozen])

    // unfreeze after wrong throw
    useEffect(() => {
        if (!gameState.frozen) return
        const t = setTimeout(() => setGameState((p) => ({ ...p, frozen: false })), 1500)
        return () => clearTimeout(t)
    }, [gameState.frozen])

    // clear flash
    useEffect(() => {
        if (gameState.boxFlash === 'none') return
        const t = setTimeout(() => setGameState((p) => ({ ...p, boxFlash: 'none', flashSlot: null })), 500)
        return () => clearTimeout(t)
    }, [gameState.boxFlash])

    // win detection → advance
    useEffect(() => {
        const allFilled = gameState.submittedSlots.length === cfg.slotCount
            && gameState.submittedSlots.every((w, i) => w === cfg.expected[i])
        if (!allFilled || gameState.complete) return
        setGameState((p) => ({ ...p, complete: true }))
        const next = nextFloorNumber(floor.floor)
        const t = setTimeout(() => {
            if (next !== undefined) router.push(`/Game/${next}`)
            else router.push('/')
        }, 1500)
        return () => clearTimeout(t)
    }, [gameState.submittedSlots, cfg, floor.floor, router, gameState.complete])

    // input + tick
    useEffect(() => {
        const keysPressed = new Set<string>()

        type KeyKind = 'left' | 'right' | 'action' | 'drop'
        const keyLookup = new Map<string, { id: number; kind: KeyKind }>()
        KEYMAPS.forEach((km, id) => {
            keyLookup.set(km.left, { id, kind: 'left' })
            keyLookup.set(km.right, { id, kind: 'right' })
            keyLookup.set(km.action, { id, kind: 'action' })
            keyLookup.set(km.drop, { id, kind: 'drop' })
        })

        const updateActions = () => {
            setGameState((prev) => ({
                ...prev,
                players: prev.players.map((p) => {
                    const km = KEYMAPS[p.id]
                    const left = keysPressed.has(km.left)
                    const right = keysPressed.has(km.right)
                    let action: PlayerType['action'] = 'idle'
                    let facing = p.facing
                    if (left) { action = 'left'; facing = 'left' }
                    else if (right) { action = 'right'; facing = 'right' }
                    return { ...p, action, facing }
                }),
            }))
        }

        const tryPickupOrThrow = (playerId: number) => {
            setGameState((prev) => {
                const player = prev.players[playerId]
                if (!player) return prev

                if (player.holding && player.heldPieceId !== null) {
                    const heldId = player.heldPieceId
                    const heldPiece = prev.pieces.find((p) => p.id === heldId)
                    const heldW = heldPiece ? pieceWidth(heldPiece.word) : PIECE_SIZE
                    const playerWidthPx = player.width * 16
                    const startX = player.x + (playerWidthPx - heldW) / 2
                    const startY = player.y - PIECE_SIZE - 8
                    const vx = player.facing === 'right' ? THROW_VX : -THROW_VX
                    const vy = THROW_VY
                    return {
                        ...prev,
                        pieces: prev.pieces.map((p) =>
                            p.id === heldId
                                ? { ...p, state: 'flying', x: startX, y: startY, vx, vy }
                                : p
                        ),
                        players: prev.players.map((p) =>
                            p.id === playerId ? { ...p, holding: false, heldPieceId: null } : p
                        ),
                    }
                }

                const reach = 60
                const center = player.x + (player.width * 16) / 2
                const candidates = prev.pieces.filter((p) =>
                    p.state === 'onGround' &&
                    Math.abs((p.x + pieceWidth(p.word) / 2) - center) < reach &&
                    (player.pickupKind === undefined || p.kind === player.pickupKind) &&
                    (p.ownerRole === undefined || p.ownerRole === player.type)
                )
                if (candidates.length === 0) return prev
                candidates.sort((a, b) =>
                    Math.abs((a.x + pieceWidth(a.word) / 2) - center) - Math.abs((b.x + pieceWidth(b.word) / 2) - center)
                )
                const target = candidates[0]
                return {
                    ...prev,
                    pieces: prev.pieces.map((p) => p.id === target.id ? { ...p, state: 'held' } : p),
                    players: prev.players.map((p) =>
                        p.id === playerId ? { ...p, holding: true, heldPieceId: target.id } : p
                    ),
                }
            })
        }

        const tryDrop = (playerId: number) => {
            setGameState((prev) => {
                const player = prev.players[playerId]
                if (!player || !player.holding || player.heldPieceId === null) return prev
                const heldId = player.heldPieceId
                const heldPiece = prev.pieces.find((p) => p.id === heldId)
                const heldW = heldPiece ? pieceWidth(heldPiece.word) : PIECE_SIZE
                const playerWidthPx = player.width * 16
                const dropX = player.x + (playerWidthPx - heldW) / 2
                return {
                    ...prev,
                    pieces: prev.pieces.map((p) =>
                        p.id === heldId
                            ? { ...p, state: 'onGround', x: dropX, y: GROUND_TOP - PIECE_SIZE, vx: 0, vy: 0 }
                            : p
                    ),
                    players: prev.players.map((p) =>
                        p.id === playerId ? { ...p, holding: false, heldPieceId: null } : p
                    ),
                }
            })
        }

        const keyDown = (e: KeyboardEvent) => {
            const entry = keyLookup.get(e.code)
            if (!entry) return
            e.preventDefault()
            if (frozenRef.current) return
            if (keysPressed.has(e.code)) return
            keysPressed.add(e.code)
            if (entry.kind === 'action') tryPickupOrThrow(entry.id)
            else if (entry.kind === 'drop') tryDrop(entry.id)
            else updateActions()
        }

        const keyUp = (e: KeyboardEvent) => {
            if (!keyLookup.has(e.code)) return
            keysPressed.delete(e.code)
            updateActions()
        }

        const speed = 15
        const tick = () => {
            setGameState((prev) => {
                const players = prev.frozen ? prev.players : prev.players.map((p) => {
                    let x = p.x
                    if (p.action === 'left') x -= 0.625 * speed
                    else if (p.action === 'right') x += 0.625 * speed
                    x = Math.max(0, Math.min(x, SCENE_MAX_X))
                    return { ...p, x }
                })

                let boxFlash = prev.boxFlash
                let flashSlot = prev.flashSlot
                let submitted = prev.submittedSlots
                let frozen = prev.frozen
                const cfgNow = cfgRef.current

                const next: Piece[] = []
                for (const piece of prev.pieces) {
                    if (piece.state !== 'flying') { next.push(piece); continue }

                    const nextVy = piece.vy + GRAVITY
                    const candidate: Piece = { ...piece, x: piece.x + piece.vx, y: piece.y + nextVy, vy: nextVy }

                    if (isInAnyGoal(candidate, cfgNow.goals)) {
                        const slot = nextMatchingSlot(piece.word, cfgNow.expected, submitted)
                        if (slot >= 0) {
                            const newSubmitted = [...submitted]
                            newSubmitted[slot] = piece.word
                            submitted = newSubmitted
                            boxFlash = 'correct'
                            flashSlot = slot
                            continue
                        } else {
                            boxFlash = 'wrong'
                            flashSlot = null
                            frozen = true
                            const pw = pieceWidth(candidate.word)
                            const landX = Math.max(0, Math.min(candidate.x, SCENE_MAX_X - pw))
                            next.push({ ...candidate, x: landX, y: GROUND_TOP - PIECE_SIZE, vx: 0, vy: 0, state: 'onGround' })
                            continue
                        }
                    }

                    const pw = pieceWidth(candidate.word)
                    if (candidate.y + PIECE_SIZE >= GROUND_TOP) {
                        const landX = Math.max(0, Math.min(candidate.x, SCENE_MAX_X - pw))
                        next.push({ ...candidate, x: landX, y: GROUND_TOP - PIECE_SIZE, vx: 0, vy: 0, state: 'onGround' })
                        continue
                    }
                    if (candidate.x < 0 || candidate.x > SCENE_MAX_X - pw) {
                        const clampedX = Math.max(0, Math.min(candidate.x, SCENE_MAX_X - pw))
                        next.push({ ...candidate, x: clampedX })
                        continue
                    }
                    next.push(candidate)
                }

                return { ...prev, players, pieces: next, submittedSlots: submitted, boxFlash, flashSlot, frozen }
            })
        }

        window.addEventListener('keydown', keyDown)
        window.addEventListener('keyup', keyUp)
        const tid = setInterval(tick, 32)
        return () => {
            window.removeEventListener('keydown', keyDown)
            window.removeEventListener('keyup', keyUp)
            clearInterval(tid)
        }
    }, [])

    const accent = TIER_ACCENT[floor.tier]

    return (
        <div className={styles.gameContainer}>
            <div className={styles.gameScene}>
                <div className={styles.BG}>

                    <CenterDisplay floor={floor} submitted={gameState.submittedSlots} />

                    {cfg.goals.map((g, i) => (
                        <Goal key={i} x={g.x} flash={gameState.boxFlash} />
                    ))}

                    {gameState.pieces.map((p) => {
                        const dimmed = p.state === 'onGround' && p.ownerRole !== undefined &&
                            !gameState.players.some((pl) => pl.type === p.ownerRole)
                        return <PuzzlePiece key={p.id} gameState={gameState} piece={p} dimmed={dimmed} />
                    })}

                    {gameState.players.map((p) => (
                        <Player key={p.id} player={p} frozen={gameState.frozen} />
                    ))}

                </div>
                <div className={styles.GROUND} />
                {gameState.complete && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(46, 204, 113, 0.85)', color: 'white',
                        fontSize: '4rem', flexDirection: 'column', gap: '1rem',
                    }}>
                        <div>Floor {floor.floor} cleared!</div>
                        <div style={{ fontSize: '1.5rem' }}>{floor.JP} — {floor.EN}</div>
                    </div>
                )}
            </div>
            <div style={{
                textAlign: 'center', color: '#222', fontFamily: "'EnglishPixelFont', monospace",
                fontSize: '1rem', marginTop: '0.5rem',
            }}>
                Floor {floor.floor} / {TOTAL_FLOORS}
            </div>
        </div>
    )
}

function CenterDisplay({ floor, submitted }: { floor: FloorData; submitted: (string | null)[] }) {
    if (floor.tier === 'vocabulary') {
        const f = floor
        return (
            <div style={{
                position: 'absolute', top: 100, left: 0, right: 0,
                textAlign: 'center', color: '#222',
            }}>
                <div style={{ fontSize: '3.5rem', letterSpacing: '0.1em' }}>{f.EN}</div>
                {f.furigana && (
                    <div style={{ fontSize: '1rem', opacity: 0.6, marginTop: '0.5rem' }}>
                        ({f.furigana})
                    </div>
                )}
            </div>
        )
    }
    if (floor.tier === 'particles') {
        let blankIdx = 0
        return (
            <div style={{
                position: 'absolute', top: 80, left: 0, right: 0,
                textAlign: 'center', color: '#222',
            }}>
                <div style={{ fontSize: '2.5rem' }}>
                    {floor.incomplete.map((tok, i) => {
                        if (tok === '_') {
                            const filled = submitted[blankIdx++]
                            return (
                                <span key={i} style={{ color: filled ? '#FEFD99' : '#888', margin: '0 0.25em' }}>
                                    {filled ?? '＿'}
                                </span>
                            )
                        }
                        return <span key={i} style={{ margin: '0 0.1em' }}>{tok}</span>
                    })}
                </div>
                <div style={{ fontSize: '1rem', marginTop: '0.5rem', opacity: 0.7 }}>{floor.EN}</div>
            </div>
        )
    }
    // construction
    return (
        <div style={{
            position: 'absolute', top: 80, left: 0, right: 0,
            textAlign: 'center', color: 'white',
        }}>
            <div style={{ fontSize: '2.5rem' }}>
                {floor.incomplete.map((_, i) => {
                    const filled = submitted[i]
                    return (
                        <span key={i} style={{ color: filled ? '#FF6BD6' : '#888', margin: '0 0.25em' }}>
                            {filled ?? '＿'}
                        </span>
                    )
                })}
            </div>
            <div style={{ fontSize: '1rem', marginTop: '0.5rem', opacity: 0.7 }}>{floor.EN}</div>
        </div>
    )
}

function Goal({ x, flash }: { x: number; flash: 'none' | 'correct' | 'wrong' }) {
    const rimColor = flash === 'correct' ? RIM.COLOR_CORRECT
        : flash === 'wrong' ? RIM.COLOR_WRONG
        : RIM.COLOR
    const baseTop = GROUND_TOP - RIM.BASE_HEIGHT
    const uprightTop = baseTop - RIM.UPRIGHT_HEIGHT
    const bar = (bg: string) => ({ position: 'absolute' as const, backgroundColor: bg, transition: 'background-color 0.2s' })
    return (
        <>
            <div style={{ ...bar(RIM.COLOR), left: `${x - RIM.BAR_THICKNESS / 2}px`, top: `${baseTop}px`, width: `${RIM.BAR_THICKNESS}px`, height: `${RIM.BASE_HEIGHT}px` }} />
            <div style={{ ...bar(rimColor), left: `${x - RIM.RIM_WIDTH / 2}px`, top: `${baseTop}px`, width: `${RIM.RIM_WIDTH}px`, height: `${RIM.BAR_THICKNESS}px` }} />
            <div style={{ ...bar(rimColor), left: `${x - RIM.RIM_WIDTH / 2}px`, top: `${uprightTop}px`, width: `${RIM.BAR_THICKNESS}px`, height: `${RIM.UPRIGHT_HEIGHT}px` }} />
            <div style={{ ...bar(rimColor), left: `${x + RIM.RIM_WIDTH / 2 - RIM.BAR_THICKNESS}px`, top: `${uprightTop}px`, width: `${RIM.BAR_THICKNESS}px`, height: `${RIM.UPRIGHT_HEIGHT}px` }} />
        </>
    )
}
