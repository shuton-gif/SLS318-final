// Client-side run cache. Persists where the player is, how much clock they
// have left on the current floor, when they last closed the tab, and what
// they have cleared so far. localStorage only — no server, no accounts.
import { Tier } from '../../../data/floors'

export const SAVE_KEY = 'tob.save.v1'
export const SAVE_VERSION = 1

/** Clock budget for a single floor. */
export const FLOOR_TIME_MS = 90_000

/** A floor the player finished, kept for the run summary. */
export type FloorRecord = {
    floor: number
    tier: Tier
    clearedAt: number       // epoch ms
    timeLeftMs: number      // clock remaining at the moment it was cleared
    mistakes: number        // wrong throws on that floor
    timeouts: number        // times the clock ran out before clearing it
}

export type RunProgress = {
    startedAt: number
    highestFloor: number
    clearedFloors: number[]
    history: FloorRecord[]
    mistakes: number
    timeouts: number
    playedMs: number        // active play time, excludes hidden/closed tab
}

export type SaveData = {
    version: number
    savedAt: number         // epoch ms of the last write
    closedAt: number | null // epoch ms the tab was last hidden or unloaded
    floor: number           // floor the player is standing on
    remainingMs: number     // clock left on that floor
    progress: RunProgress
}

export const newSave = (floor: number, now = Date.now()): SaveData => ({
    version: SAVE_VERSION,
    savedAt: now,
    closedAt: null,
    floor,
    remainingMs: FLOOR_TIME_MS,
    progress: {
        startedAt: now,
        highestFloor: floor,
        clearedFloors: [],
        history: [],
        mistakes: 0,
        timeouts: 0,
        playedMs: 0,
    },
})

// Anything that fails this came from an older build or a hand-edited value,
// so it is dropped rather than half-trusted.
function isSaveData(v: unknown): v is SaveData {
    if (typeof v !== 'object' || v === null) return false
    const s = v as Record<string, unknown>
    const p = s.progress as Record<string, unknown> | undefined
    return (
        s.version === SAVE_VERSION &&
        typeof s.savedAt === 'number' &&
        (s.closedAt === null || typeof s.closedAt === 'number') &&
        typeof s.floor === 'number' &&
        typeof s.remainingMs === 'number' &&
        typeof p === 'object' && p !== null &&
        typeof p.startedAt === 'number' &&
        typeof p.highestFloor === 'number' &&
        Array.isArray(p.clearedFloors) &&
        Array.isArray(p.history) &&
        typeof p.mistakes === 'number' &&
        typeof p.timeouts === 'number' &&
        typeof p.playedMs === 'number'
    )
}

export function loadSave(): SaveData | null {
    if (typeof window === 'undefined') return null
    try {
        const raw = window.localStorage.getItem(SAVE_KEY)
        if (!raw) return null
        const parsed: unknown = JSON.parse(raw)
        if (!isSaveData(parsed)) {
            window.localStorage.removeItem(SAVE_KEY)
            return null
        }
        return parsed
    } catch {
        return null
    }
}

export function writeSave(save: SaveData): void {
    if (typeof window === 'undefined') return
    try {
        window.localStorage.setItem(SAVE_KEY, JSON.stringify({ ...save, savedAt: Date.now() }))
    } catch {
        // private mode or quota exhausted — the run just goes unsaved
    }
}

export function clearSave(): void {
    if (typeof window === 'undefined') return
    try {
        window.localStorage.removeItem(SAVE_KEY)
    } catch {
        // ignore
    }
}

/** "1:07" — the clock format used in the HUD and on the resume card. */
export function formatClock(ms: number): string {
    const total = Math.max(0, Math.ceil(ms / 1000))
    const m = Math.floor(total / 60)
    const s = total % 60
    return `${m}:${String(s).padStart(2, '0')}`
}

/** "2 hours ago" — coarse on purpose, this only labels a resume card. */
export function formatAgo(then: number, now = Date.now()): string {
    const sec = Math.max(0, Math.round((now - then) / 1000))
    if (sec < 60) return 'just now'
    const min = Math.round(sec / 60)
    if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`
    const hr = Math.round(min / 60)
    if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`
    const day = Math.round(hr / 24)
    return `${day} day${day === 1 ? '' : 's'} ago`
}
