import Link from 'next/link'
import { FLOORS } from '../data/floors'
import RunControls from './components/RunControls'

const TIER_ACCENT = {
    vocabulary: '#03AED2',
    particles: '#FEFD99',
    construction: '#FF6BD6',
}

export default function Landing() {
    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#0b1d2a',
            color: 'white',
            fontFamily: "'EnglishPixelFont', monospace",
            padding: '4rem 2rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem',
        }}>
            <h1 style={{ fontSize: '3rem', letterSpacing: '0.1em', margin: 0 }}>TOWER OF BABEL</h1>
            <p style={{ opacity: 0.7, fontSize: '1rem', textAlign: 'center', maxWidth: '50rem' }}>Player 1 (cyan) uses WASD, <br/> Player 2 (pink) uses arrow keys.<br/>
                W / ↑ pick up &amp; throw. S / ↓ drop.
            </p>
            <RunControls />

            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', maxWidth: '24rem' }}>
                <div style={{ fontSize: '0.875rem', opacity: 0.6 }}>POPULATED FLOORS</div>
                {FLOORS.map((f) => (
                    <Link
                        key={f.floor}
                        href={`/Game/${f.floor}`}
                        style={{
                            display: 'flex', justifyContent: 'space-between',
                            padding: '0.5rem 1rem', textDecoration: 'none',
                            border: `2px solid ${TIER_ACCENT[f.tier]}`,
                            color: 'white',
                        }}
                    >
                        <span>Floor {f.floor}</span>
                        <span style={{ color: TIER_ACCENT[f.tier] }}>{f.tier}</span>
                    </Link>
                ))}
            </div>
        </div>
    )
}
