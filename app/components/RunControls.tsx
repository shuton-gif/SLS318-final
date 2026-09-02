'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { clearSave, formatAgo, formatClock, loadSave, SaveData } from './game/saveCache'

const BUTTON: React.CSSProperties = {
    display: 'inline-block', padding: '1rem 2rem', fontSize: '1.5rem',
    backgroundColor: '#03AED2', color: '#0b1d2a',
    border: '4px solid white', textDecoration: 'none',
    fontFamily: "'EnglishPixelFont', monospace",
    cursor: 'pointer',
}

export default function RunControls() {
    const router = useRouter()
    // localStorage is not available while rendering on the server, so the saved
    // run is read after mount and the card fades in once it is known.
    const [save, setSave] = useState<SaveData | null>(null)
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        setSave(loadSave())
        setChecked(true)
    }, [])

    const startNew = () => {
        clearSave()
        router.push('/Game/1')
    }

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
            minHeight: '11rem', // reserve the resume card's space so nothing jumps on mount
        }}>
            {checked && save && (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                    border: '2px solid #FCB7C7', padding: '1rem 1.5rem', minWidth: '22rem',
                }}>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6, letterSpacing: '0.1em' }}>
                        SAVED RUN
                    </div>
                    <Link href={`/Game/${save.floor}`} style={{ ...BUTTON, backgroundColor: '#FCB7C7' }}>
                        CONTINUE — FLOOR {save.floor}
                    </Link>
                    <div style={{ fontSize: '0.875rem', opacity: 0.75, textAlign: 'center' }}>
                        {formatClock(save.remainingMs)} left · {save.progress.clearedFloors.length} floor
                        {save.progress.clearedFloors.length === 1 ? '' : 's'} cleared
                    </div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.5 }}>
                        {save.closedAt === null
                            ? `saved ${formatAgo(save.savedAt)}`
                            : `closed ${formatAgo(save.closedAt)}`}
                    </div>
                </div>
            )}

            <button type="button" onClick={startNew} style={BUTTON}>
                START AT FLOOR 1
            </button>
            {checked && save && (
                <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                    starting over erases the saved run
                </div>
            )}
        </div>
    )
}
