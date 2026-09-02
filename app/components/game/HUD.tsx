'use client'
import { Floor } from '../../../data/floors'
import { ROLE_COLORS, ROLES } from './gameState'
import { formatClock } from './saveCache'

const TIER_LABEL: Record<Floor['tier'], string> = {
    vocabulary: 'VOCABULARY',
    particles: 'PARTICLES',
    construction: 'CONSTRUCTION',
}

const LOW_TIME_MS = 10_000

export default function HUD({
    floor, accent, remainingMs, clockReady,
}: {
    floor: Floor
    accent: string
    remainingMs: number
    /** Held back until the saved clock is read, so a resumed floor never flashes a full bar. */
    clockReady: boolean
}) {
    const low = remainingMs <= LOW_TIME_MS
    return (
        <>
            <div style={{
                position: 'absolute', top: 10, left: 20,
                color: '#222', fontFamily: "'EnglishPixelFont', monospace", fontSize: '1.25rem',
            }}>
                <span>FLOOR {floor.floor} / 100</span>
                <span style={{ margin: '0 0.5rem', color: accent }}>·</span>
                <span style={{ color: accent }}>{TIER_LABEL[floor.tier]}</span>
            </div>
            <div style={{
                position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
                fontFamily: "'EnglishPixelFont', monospace", fontSize: '1.5rem',
                color: low ? '#e74c3c' : '#222',
                opacity: clockReady ? 1 : 0,
                transition: 'color 0.2s, opacity 0.2s',
            }}>
                {formatClock(remainingMs)}
            </div>
            <div style={{ position: 'absolute', top: 10, right: 20, display: 'flex', gap: '0.5rem' }}>
                {ROLES.map((r) => (
                    <span key={r} style={{
                        display: 'inline-block', width: '1.25rem', height: '1.25rem',
                        backgroundColor: ROLE_COLORS[r], border: '2px solid #222',
                    }} />
                ))}
            </div>
        </>
    )
}
