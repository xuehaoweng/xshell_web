import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const src = path.join(__dirname, '..', 'dist')
const dest = path.join(__dirname, '..', '..', 'webssh', 'static', 'react')

// Remove existing destination
if (fs.existsSync(dest)) {
  fs.rmSync(dest, { recursive: true })
}

// Copy dist to static/react
fs.cpSync(src, dest, { recursive: true })

console.log('Built files copied to webssh/static/react/')
