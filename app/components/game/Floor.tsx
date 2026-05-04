'use client'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
    pieceSpecs: { word: string; reading?: string; kind: Kind; ownerRole?: Role }[]
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
        const goals: Goal[] = [{ x: SCENE_MAX_X / 2 + 200, slotIndex: 0 }]
        const pieceSpecs = [
            { word: f.JP, reading: f.furigana, kind: 'vocab' as Kind },
            ...f.dummies.map((d) => ({ word: d.dummy, reading: d.hiragana, kind: 'vocab' as Kind })),
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
    // Single submission goal, shifted 200px right of center.
    return [{ x: SCENE_MAX_X / 2 + 200, slotIndex: -1 }]
}

function buildInitialPieces(specs: FloorConfig['pieceSpecs']): Piece[] {
    let id = 0
    const all = shuffle(specs).map<Piece>((s) => ({
        id: id++,
        word: s.word,
        reading: s.reading,
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

// Skyblue (floor 1) → dark purple (floor 100)
function floorBgColor(floor: number): string {
    return lerpColor(floor, [135, 206, 235], [30, 8, 50])
}

// Dark (floor 1) → pure white (floor 71+), so text stays readable as bg darkens.
function floorTextColor(floor: number): string {
    const t = Math.max(0, Math.min(1, (floor - 1) / 70))
    const r = Math.round(34 + (255 - 34) * t)
    const g = Math.round(34 + (255 - 34) * t)
    const b = Math.round(34 + (255 - 34) * t)
    return `rgb(${r}, ${g}, ${b})`
}

function lerpColor(floor: number, start: number[], end: number[]): string {
    const t = Math.max(0, Math.min(1, (floor - 1) / 99))
    const r = Math.round(start[0] + (end[0] - start[0]) * t)
    const g = Math.round(start[1] + (end[1] - start[1]) * t)
    const b = Math.round(start[2] + (end[2] - start[2]) * t)
    return `rgb(${r}, ${g}, ${b})`
}

function nextMatchingSlot(word: string, expected: string[], submitted: (string | null)[]): number {
    for (let i = 0; i < expected.length; i++) {
        if (submitted[i] == null && expected[i] === word) return i
    }
    return -1
}

export default function FloorView({ floor }: { floor: FloorData }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const fromParam = searchParams.get('from')
    const fromFloor = fromParam !== null && Number.isFinite(Number(fromParam)) ? Number(fromParam) : null
    const cfg = useMemo(() => buildConfig(floor), [floor])
    const [gameState, setGameState] = useState<GameState>(() => ({
        ...initState(cfg.p1Pickup, cfg.p2Pickup),
        pieces: buildInitialPieces(cfg.pieceSpecs),
        submittedSlots: Array(cfg.slotCount).fill(null),
    }))
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    const advancedRef = useRef(false)

    // Incoming-transition state: when ?from=N is present, the curtains start
    // shut and we play the roll-up sequence before opening.
    const [curtainOpen, setCurtainOpen] = useState(fromFloor === null)
    const [enterTextRolled, setEnterTextRolled] = useState(false)
    const [enterTextVisible, setEnterTextVisible] = useState(fromFloor !== null)

    useEffect(() => {
        if (fromFloor === null) return
        const t1 = setTimeout(() => setEnterTextRolled(true), 500)   // roll number up
        const t2 = setTimeout(() => setEnterTextVisible(false), 1300) // fade text
        const t3 = setTimeout(() => setCurtainOpen(true), 1700)       // open curtains
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    }, [fromFloor])

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
        if (!allFilled || advancedRef.current) return
        advancedRef.current = true
        setGameState((p) => ({ ...p, complete: true }))
        const next = nextFloorNumber(floor.floor)
        const t = setTimeout(() => {
            if (next !== undefined) router.push(`/Game/${next}?from=${floor.floor}`)
            else router.push('/')
        }, 1800)
        return () => clearTimeout(t)
    }, [gameState.submittedSlots, cfg, floor.floor, router])

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
    const bgColor = floorBgColor(floor.floor)
    const textColor = floorTextColor(floor.floor)

    if (!mounted) return <div className={styles.gameContainer} suppressHydrationWarning />


    return (
        <div className={styles.gameContainer}>
            <div className={styles.gameScene}>
                <div className={styles.BG} style={{ backgroundColor: bgColor }}>

                    {floor.floor >= 71 && <Stars />}
                    {floor.floor >= 81 && (
                        <>
                            <div className={styles.shootingStar} style={{ animation: 'shootA 10s linear infinite' }} />
                            <div className={styles.shootingStar} style={{ animation: 'shootB 13s linear infinite', animationDelay: '4s' }} />
                            <div className={styles.shootingStar} style={{ animation: 'shootC 11s linear infinite', animationDelay: '7s' }} />
                            <div className={styles.shootingStar} style={{ animation: 'shootD 12s linear infinite', animationDelay: '2s' }} />
                            <div className={styles.shootingStar} style={{ animation: 'shootE 14s linear infinite', animationDelay: '9s' }} />
                        </>
                    )}

                    <CenterDisplay floor={floor} submitted={gameState.submittedSlots} textColor="white" />

                    {cfg.goals.map((g, i) => (
                        <Goal key={i} x={g.x} flash={gameState.boxFlash} rising={gameState.complete} />
                    ))}

                    {gameState.pieces.map((p) => {
                        const dimmed = p.state === 'onGround' && p.ownerRole !== undefined &&
                            !gameState.players.some((pl) => pl.type === p.ownerRole)
                        return <PuzzlePiece key={p.id} gameState={gameState} piece={p} dimmed={dimmed} />
                    })}

                    {gameState.players.map((p) => (
                        <Player key={p.id} player={p} frozen={gameState.frozen} />
                    ))}

                    {gameState.players.map((pl) => {
                        if (!pl.holding || pl.heldPieceId === null) return null
                        const piece = gameState.pieces.find((pc) => pc.id === pl.heldPieceId)
                        if (!piece || !piece.reading) return null
                        const playerWidthPx = pl.width * 16
                        return (
                            <div key={`reading-${pl.id}`} style={{
                                position: 'absolute',
                                top: `${pl.y - PIECE_SIZE - 36}px`,
                                left: `${pl.x + playerWidthPx / 2}px`,
                                transform: 'translateX(-50%)',
                                color: 'white',
                                fontFamily: "'JapanesePF', 'EnglishPixelFont', monospace",
                                fontSize: '1.2rem',
                                whiteSpace: 'nowrap',
                                pointerEvents: 'none',
                                textShadow: '0 0 4px black',
                            }}>
                                {piece.reading}
                            </div>
                        )
                    })}

                </div>
                <div className={styles.GROUND} />
                {(() => {
                    const curtainShut = gameState.complete || !curtainOpen
                    return (
                        <>
                            <div style={{
                                position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%',
                                backgroundColor: 'black',
                                transform: curtainShut ? 'translateX(0)' : 'translateX(-100%)',
                                transition: gameState.complete ? 'transform 1s ease-in' : 'transform 0.8s ease-out',
                                zIndex: 20,
                                pointerEvents: 'none',
                            }} />
                            <div style={{
                                position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%',
                                backgroundColor: 'black',
                                transform: curtainShut ? 'translateX(0)' : 'translateX(100%)',
                                transition: gameState.complete ? 'transform 1s ease-in' : 'transform 0.8s ease-out',
                                zIndex: 20,
                                pointerEvents: 'none',
                            }} />
                        </>
                    )
                })()}

                {/* Outgoing: "FLOOR N COMPLETE" appears after curtains close on this floor */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontFamily: "'EnglishPixelFont', monospace",
                    fontSize: '3rem', letterSpacing: '0.1em',
                    opacity: gameState.complete ? 1 : 0,
                    transition: 'opacity 0.25s ease 1.125s',
                    zIndex: 21,
                    pointerEvents: 'none',
                }}>
                    FLOOR {floor.floor} COMPLETE!!
                </div>

                {/* Incoming: "FLOOR {from→current} COMPLETE" rolls up, then fades */}
                {fromFloor !== null && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontFamily: "'EnglishPixelFont', monospace",
                        fontSize: '3rem', letterSpacing: '0.1em',
                        opacity: enterTextVisible ? 1 : 0,
                        transition: 'opacity 0.4s ease',
                        zIndex: 21,
                        pointerEvents: 'none',
                    }}>
                        <span>FLOOR&nbsp;</span>
                        <span style={{ display: 'inline-block', height: '1em', overflow: 'hidden', verticalAlign: 'bottom', lineHeight: '1em' }}>
                            <span style={{
                                display: 'block',
                                transform: enterTextRolled ? 'translateY(-1em)' : 'translateY(0)',
                                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}>
                                <span style={{ display: 'block', height: '1em' }}>{fromFloor}</span>
                                <span style={{ display: 'block', height: '1em' }}>{floor.floor}</span>
                            </span>
                        </span>
                        <span>&nbsp;COMPLETE!!</span>
                    </div>
                )}
            </div>
            <div style={{
                textAlign: 'center', color: '#222', fontFamily: "'EnglishPixelFont', monospace",
                fontSize: '1rem', marginTop: '0.5rem',
            }}>
                Floor {floor.floor} / {TOTAL_FLOORS}<br/>
                <Link href="/" style={{ color: '#03AED2', paddingTop: '2rem' }}>back to home</Link>
            </div>
        </div>
    )
}

function CenterDisplay({ floor, submitted, textColor }: { floor: FloorData; submitted: (string | null)[]; textColor: string }) {
    if (floor.tier === 'vocabulary') {
        const f = floor
        return (
            <div style={{
                position: 'absolute', top: 100, left: 0, right: 0,
                textAlign: 'center', color: textColor, zIndex: 5,
            }}>
                <div style={{ fontSize: '3.5rem', letterSpacing: '0.1em' }}>{f.EN}</div>
                {f.furigana && (
                    <div style={{ fontSize: '2rem', opacity: 0.6, marginTop: '0.5rem' }}>
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
                textAlign: 'center', color: textColor, zIndex: 5,
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
            textAlign: 'center', color: textColor, zIndex: 5,
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

function Stars() {
    const stars = useMemo(() => Array.from({ length: 60 }, () => ({
        x: Math.random() * SCENE_MAX_X,
        y: Math.random() * (GROUND_TOP - 40),
        size: Math.random() < 0.2 ? 3 : Math.random() < 0.6 ? 2 : 1,
        opacity: 0.5 + Math.random() * 0.5,
    })), [])
    return (
        <>
            {stars.map((s, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    left: `${s.x}px`, top: `${s.y}px`,
                    width: `${s.size}px`, height: `${s.size}px`,
                    backgroundColor: 'white',
                    opacity: s.opacity,
                    pointerEvents: 'none',
                }} />
            ))}
        </>
    )
}

function Goal({ x, flash, rising }: { x: number; flash: 'none' | 'correct' | 'wrong'; rising?: boolean }) {
    const ductTop = GROUND_TOP - RIM.BASE_HEIGHT - RIM.UPRIGHT_HEIGHT
    const ductHeight = RIM.UPRIGHT_HEIGHT
    const ductWidth = RIM.RIM_WIDTH
    const ductLeft = x - ductWidth / 2

    const ductFill = flash === 'correct' ? RIM.COLOR_CORRECT
        : flash === 'wrong' ? RIM.COLOR_WRONG
            : 'black'

    // Curved hose behind the duct: 100px wide stroke, starts at top of duct, sweeps up.
    const hoseStartX = x
    const hoseStartY = ductTop + 10
    const hoseEndX = x + 320
    const hoseEndY = -20
    const c1x = x - 40
    const c1y = ductTop - 180
    const c2x = x + 360
    const c2y = 220

    const riseTransform = rising ? 'translateY(-800px)' : 'translateY(0)'
    const riseTransition = 'transform 1.4s cubic-bezier(0.4, 0, 0.6, 1)'

    return (
        <>
            <svg
                style={{
                    position: 'absolute', left: 0, top: 0,
                    width: SCENE_MAX_X, height: GROUND_TOP,
                    pointerEvents: 'none', overflow: 'visible',
                    transform: riseTransform, transition: riseTransition,
                }}
            >
                <path
                    d={`M ${hoseStartX} ${hoseStartY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${hoseEndX} ${hoseEndY}`}
                    stroke="#5a5a5a"
                    strokeWidth={50}
                    strokeLinecap="round"
                    fill="none"
                />
                <path
                    d={`M ${hoseStartX} ${hoseStartY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${hoseEndX} ${hoseEndY}`}
                    stroke="#7d7d7d"
                    strokeWidth={50}
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray="2 18"
                    opacity={0.35}
                />
            </svg>
            <div style={{
                position: 'absolute',
                left: `${ductLeft}px`,
                top: `${ductTop}px`,
                width: `${ductWidth}px`,
                height: `${ductHeight}px`,
                backgroundColor: ductFill,
                border: '6px solid #7d7d7d',
                boxSizing: 'border-box',
                transform: riseTransform,
                transition: `background-color 0.2s, ${riseTransition}`,
            }} />
        </>
    )
}
