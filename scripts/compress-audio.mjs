/**
 * Compress a recording for the web before uploading it from /admin.
 *   npm run audio:compress -- path/to/Aditya.wav              → path/to/Aditya.m4a  (tone: 64 kbps mono)
 *   npm run audio:compress -- path/to/gong.wav --gong         → 96 kbps mono (fuller)
 *   npm run audio:compress -- in.wav --out audio/aditya.m4a
 * Output is AAC in .m4a — plays in Chrome, Safari, Firefox and Android and
 * decodes in Web Audio, so one file serves every browser (no Cloudinary here).
 * Needs ffmpeg on the PATH (macOS: `brew install ffmpeg`). Audio never goes
 * into git; upload the .m4a to Storage under products/audio/.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, statSync } from 'node:fs'
import { basename, dirname, extname, join } from 'node:path'

const args = process.argv.slice(2)
const input = args.find((a) => !a.startsWith('--'))
const gong = args.includes('--gong')
const outIdx = args.indexOf('--out')
const BUDGET = 300 * 1024

if (!input || !existsSync(input)) {
  console.error('usage: npm run audio:compress -- <input.wav> [--gong] [--out file.m4a]')
  process.exit(1)
}
if (spawnSync('ffmpeg', ['-version']).status !== 0) {
  console.error('ffmpeg not found. Install it first (macOS: brew install ffmpeg; Windows: winget install ffmpeg), then re-run.')
  process.exit(1)
}

const out = outIdx > -1 ? args[outIdx + 1] : join(dirname(input), basename(input, extname(input)).toLowerCase().replace(/[^a-z0-9-]+/g, '-') + '.m4a')
const bitrate = gong ? '96k' : '64k'

// mono, AAC, faststart so playback can begin before the whole file arrives;
// -af apad=0 keeps the exact source length (no encoder padding at the tail),
// which matters for seamless looping.
const ff = spawnSync('ffmpeg', [
  '-y', '-i', input,
  '-ac', '1', '-ar', '44100',
  '-c:a', 'aac', '-b:a', bitrate,
  '-movflags', '+faststart',
  out,
], { stdio: ['ignore', 'ignore', 'inherit'] })
if (ff.status !== 0) process.exit(ff.status)

const bytes = statSync(out).size
const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out], { encoding: 'utf8' })
const seconds = probe.status === 0 ? Number(probe.stdout).toFixed(2) : '?'
console.log(`${out}\n  ${(bytes / 1024).toFixed(0)} KB · ${seconds} s · ${bitrate} mono AAC${bytes > BUDGET && !gong ? '\n  ⚠ over the 300 KB tone budget — trim the recording or re-run with a shorter take' : ''}`)
console.log(`  audio_loop_seconds = ${seconds}`)
