import { ReactNode } from 'react'
import './globals.css'

export const metadata = {
    title: 'TOWER_OF_BABEL',
    description: '',
}

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
