'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Tier } from '../../../data/floors'
import {
    FLOOR_TIME_MS, FloorRecord, SaveData,
    loadSave, newSave, writeSave,
} from './saveCache'

const TICK_MS = 200
const AUTOSAVE_MS = 2000

type Options = {
    floor: number
    tier: Tier
    /** Clock drains only while this is true (curtains open, floor not cleared). */
    running: boolean
    /** Fired when the clock hits zero. The clock refills right after. */
    onExpire: () => void
}

export type RunCache = {
    /** False until the saved clock has been read, so the HUD never flashes a wrong number. */
    ready: boolean
    remainingMs: number
    /** Count a wrong throw against the run. */
    recordMistake: () => void
    /** Bank the current floor and point the save at the next one. */
    recordCleared: (nextFloor: number | undefined) => void
}

/**
 * Owns the per-floor countdown and mirrors it into localStorage.
 *
 * Resuming: if the save already sits on this floor, its remaining clock is
 * picked back up; landing on any other floor starts a fresh budget and
 * re-points the save. The clock is wall-clock based and pauses while the tab
 * is hidden, so a backgrounded tab does not silently burn the floor.
 */
export function useRunCache({ floor, tier, running, onExpire }: Options): RunCache {
    const [ready, setReady] = useState(false)
    const [remainingMs, setRemainingMs] = useState(FLOOR_TIME_MS)

    const saveRef = useRef<SaveData | null>(null)
    const remainingRef = useRef(FLOOR_TIME_MS)
    const mistakesRef = useRef(0)
    const timeoutsRef = useRef(0)
    const onExpireRef = useRef(onExpire)
    // Set once this floor is banked: the save now points at the next floor and
    // must not be dragged back by a late autosave or the unmount write.
    const clearedRef = useRef(false)

    useEffect(() => { onExpireRef.current = onExpire }, [onExpire])
    useEffect(() => { remainingRef.current = remainingMs }, [remainingMs])

    // Write the live clock back into the cache. `closing` stamps closedAt, which
    // is what the landing page reads to say when the player last walked away.
    const persist = useCallback((closing = false) => {
        const save = saveRef.current
        if (!save) return
        if (!clearedRef.current) {
            save.floor = floor
            save.remainingMs = remainingRef.current
        }
        if (closing) save.closedAt = Date.now()
        writeSave(save)
    }, [floor])

    // Load or start the save for this floor.
    useEffect(() => {
        const existing = loadSave()
        const save = existing ?? newSave(floor)

        const resuming = existing !== null && existing.floor === floor && existing.remainingMs > 0
        const startMs = resuming ? existing.remainingMs : FLOOR_TIME_MS

        save.floor = floor
        save.remainingMs = startMs
        save.progress.highestFloor = Math.max(save.progress.highestFloor, floor)

        mistakesRef.current = 0
        timeoutsRef.current = 0
        clearedRef.current = false
        saveRef.current = save
        remainingRef.current = startMs
        setRemainingMs(startMs)
        setReady(true)
        writeSave(save)
    }, [floor])

    // Countdown. Uses wall-clock deltas so a throttled interval cannot stretch
    // the floor, and skips draining whenever the tab is not in front.
    useEffect(() => {
        if (!ready || !running) return
        let last = Date.now()
        const id = setInterval(() => {
            const now = Date.now()
            const dt = now - last
            last = now
            if (document.visibilityState === 'hidden') return
            setRemainingMs((prev) => Math.max(0, prev - dt))
            const save = saveRef.current
            if (save) save.progress.playedMs += dt
        }, TICK_MS)
        return () => clearInterval(id)
    }, [ready, running])

    // Clock ran out: bank the timeout, refill, and let the floor reset itself.
    useEffect(() => {
        if (!ready || remainingMs > 0) return
        timeoutsRef.current += 1
        const save = saveRef.current
        if (save) save.progress.timeouts += 1
        remainingRef.current = FLOOR_TIME_MS
        setRemainingMs(FLOOR_TIME_MS)
        persist()
        onExpireRef.current()
    }, [ready, remainingMs, persist])

    // Autosave, plus the writes that actually matter: the tab going away.
    useEffect(() => {
        if (!ready) return
        const id = setInterval(() => persist(), AUTOSAVE_MS)
        const onHide = () => { if (document.visibilityState === 'hidden') persist(true) }
        const onPageHide = () => persist(true)

        document.addEventListener('visibilitychange', onHide)
        window.addEventListener('pagehide', onPageHide)
        return () => {
            clearInterval(id)
            document.removeEventListener('visibilitychange', onHide)
            window.removeEventListener('pagehide', onPageHide)
            persist()
        }
    }, [ready, persist])

    const recordMistake = useCallback(() => {
        mistakesRef.current += 1
        const save = saveRef.current
        if (!save) return
        save.progress.mistakes += 1
        persist()
    }, [persist])

    const recordCleared = useCallback((nextFloor: number | undefined) => {
        const save = saveRef.current
        if (!save) return
        const record: FloorRecord = {
            floor,
            tier,
            clearedAt: Date.now(),
            timeLeftMs: remainingRef.current,
            mistakes: mistakesRef.current,
            timeouts: timeoutsRef.current,
        }
        save.progress.history = [...save.progress.history.filter((h) => h.floor !== floor), record]
        if (!save.progress.clearedFloors.includes(floor)) {
            save.progress.clearedFloors = [...save.progress.clearedFloors, floor].sort((a, b) => a - b)
        }
        // Point the save at the next floor now, so a tab closed during the
        // transition reopens on the floor the player earned.
        if (nextFloor !== undefined) {
            save.floor = nextFloor
            save.remainingMs = FLOOR_TIME_MS
            save.progress.highestFloor = Math.max(save.progress.highestFloor, nextFloor)
            remainingRef.current = FLOOR_TIME_MS
        }
        clearedRef.current = true
        writeSave(save)
    }, [floor, tier])

    return { ready, remainingMs, recordMistake, recordCleared }
}
