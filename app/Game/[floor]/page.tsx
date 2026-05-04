import Link from 'next/link'
import FloorView from '../../components/game/Floor'
import { getFloor } from '../../../data/floors'

export default async function FloorPage({ params }: { params: Promise<{ floor: string }> }) {
    const { floor: floorParam } = await params
    const n = Number(floorParam)
    const floor = Number.isFinite(n) ? getFloor(n) : undefined

    if (!floor) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '1rem',
                color: 'white', backgroundColor: '#0b1d2a',
                fontFamily: "'EnglishPixelFont', monospace",
            }}>
                <div style={{ fontSize: '2rem' }}>Floor {floorParam} not populated</div>
                <Link href="/" style={{ color: '#03AED2' }}>← back to landing</Link>
            </div>
        )
    }

    return <FloorView floor={floor} />
}
