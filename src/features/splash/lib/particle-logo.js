// Full-screen canvas particle engine for the splash. Thousands of coloured pixels are born at random spots
// across the whole viewport and drift for a moment, then each one is pulled (eased, on a slight arc) to a
// randomly chosen pixel of the NexusERP mark + wordmark. Once the logo is formed the particles become
// springs: they shimmer gently, part around the pointer (push + swirl), ride the ripples it leaves while
// moving, and ease back to their logo pixel once it has passed.
// State lives in typed arrays and is drawn with fillRect grouped by colour, so 60 FPS holds on laptops.

// The first three are the logo colours (targets); the rest only tint particles while they are dispersed.
const COLORS = ['#334155', '#f8fafc', '#34d399', '#38bdf8', '#2dd4bf', '#a78bfa', '#64748b']
const TILE = 0
const INK = 1
const ACCENT = 2
const DRIFT_COLORS = [1, 2, 3, 4, 5, 6]

const DRIFT_MS = 700
const ASSEMBLE_MS = 1600
const MAX_DELAY_MS = 450
export const FORMED_MS = DRIFT_MS + MAX_DELAY_MS + ASSEMBLE_MS

const MIN_PARTICLES = 3000
const MAX_PARTICLES = 5000
// A soft spring with light damping: displaced pixels glide back to the logo instead of snapping.
const SPRING = 0.045
const DAMPING = 0.86
const SHIMMER = 0.4
const POINTER_RADIUS = 120
const POINTER_FORCE = 3
// Sideways share of the pointer force, so pixels flow around the cursor rather than only away from it.
const POINTER_SWIRL = 0.35
// Ripples: rings that leave the pointer while it moves and nudge the pixels they pass over.
const RIPPLE_EVERY_PX = 45
const RIPPLE_MIN_GAP_MS = 90
const RIPPLE_MAX = 8
const RIPPLE_LIFE_MS = 650
const RIPPLE_SPEED = 0.45
const RIPPLE_BAND = 22
const RIPPLE_FORCE = 0.9
const OFFSCREEN = -9999
// While `isCalm()` is true (the about dialog is open) the clock eases down to this share of real time
// and the pointer stops pushing pixels, so the logo idles quietly behind the glass.
const CALM_TIME_SCALE = 0.25
const TIME_SCALE_EASE = 0.06
// Longest frame step the clock accepts, so a backgrounded tab does not jump the animation ahead.
const MAX_FRAME_MS = 50

// Same strokes as NexusMark, on its 32×32 grid.
const MARK_PATH = 'M10 9.5v13M10 22.5 22 9.5M22 9.5v13'

// Draws the logo (mark above, wordmark below) into an offscreen canvas and returns every opaque pixel
// as parallel arrays of coordinates and colour indexes.
function rasterizeLogo(width, height) {
  const size = Math.min(width * 0.7, height * 0.42, 440)
  const markSize = size * 0.55
  const fontSize = size * 0.2
  const top = (height - (markSize + fontSize * 1.5)) / 2
  const markX = (width - markSize) / 2

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  ctx.save()
  ctx.translate(markX, top)
  ctx.scale(markSize / 32, markSize / 32)
  ctx.fillStyle = COLORS[TILE]
  ctx.beginPath()
  ctx.roundRect(0, 0, 32, 32, 9)
  ctx.fill()
  ctx.strokeStyle = COLORS[INK]
  ctx.lineWidth = 2.6
  ctx.lineCap = 'round'
  ctx.stroke(new Path2D(MARK_PATH))
  const dots = [
    [10, 9.5, 2.6, ACCENT],
    [22, 22.5, 2.6, ACCENT],
    [10, 22.5, 2.3, INK],
    [22, 9.5, 2.3, INK],
  ]
  for (const [cx, cy, r, c] of dots) {
    ctx.fillStyle = COLORS[c]
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()

  ctx.font = `700 ${fontSize}px ui-sans-serif, system-ui, sans-serif`
  const nexusWidth = ctx.measureText('Nexus').width
  const erpWidth = ctx.measureText('ERP').width
  const textX = (width - nexusWidth - erpWidth) / 2
  const textY = top + markSize + fontSize * 1.3
  ctx.fillStyle = COLORS[INK]
  ctx.fillText('Nexus', textX, textY)
  ctx.fillStyle = COLORS[ACCENT]
  ctx.fillText('ERP', textX + nexusWidth, textY)

  const { data } = ctx.getImageData(0, 0, width, height)
  const xs = []
  const ys = []
  const cs = []

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const i = (py * width + px) * 4
      if (data[i + 3] < 160) {
        continue
      }
      const r = data[i]
      const g = data[i + 1]
      // Anti-aliased edges blend colours; snap each pixel back to the nearest of the three logo colours.
      xs.push(px)
      ys.push(py)
      cs.push(g - r > 60 ? ACCENT : r > 150 ? INK : TILE)
    }
  }

  // Screen rectangles of the two parts, so the page can place real (accessible) click targets over them.
  const layout = {
    mark: { x: markX, y: top, width: markSize, height: markSize },
    wordmark: { x: textX, y: textY - fontSize * 0.8, width: nexusWidth + erpWidth, height: fontSize },
  }

  return { xs, ys, cs, layout }
}

// Jittered-grid sampling: split the logo into square cells and pick one random opaque pixel per cell.
// Coverage stays even (no holes, unlike pure random picks) while positions stay organic (unlike a grid).
function sampleTargets(logo, width, height) {
  const area = logo.xs.length
  const wanted = Math.max(MIN_PARTICLES, Math.min(MAX_PARTICLES, Math.round(area / 6)))
  const cell = Math.max(2, Math.sqrt(area / wanted))
  const columns = Math.ceil(width / cell)
  const cellCount = columns * Math.ceil(height / cell)
  const seen = new Uint32Array(cellCount)
  const picked = new Int32Array(cellCount).fill(-1)

  for (let p = 0; p < area; p++) {
    const c = Math.floor(logo.ys[p] / cell) * columns + Math.floor(logo.xs[p] / cell)
    seen[c]++
    // Reservoir sampling: every pixel of the cell ends up chosen with equal probability.
    if (Math.random() * seen[c] < 1) {
      picked[c] = p
    }
  }

  const targets = []
  for (let c = 0; c < cellCount; c++) {
    if (picked[c] >= 0) {
      targets.push(picked[c])
    }
  }

  return { targets, cell }
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

// Starts the animation on `canvas` (sized by CSS) and returns a cleanup function.
// `onFormed` is called once, when every particle has reached the logo. `onLayout` receives the screen
// rectangles of the mark and the wordmark on start and after every resize. `isCalm` is polled every frame.
export function createParticleLogo(canvas, { onFormed, onLayout, isCalm } = {}) {
  const ctx = canvas.getContext('2d')
  const pointer = { x: OFFSCREEN, y: OFFSCREEN }
  const lastRipple = { x: OFFSCREEN, y: OFFSCREEN, at: 0 }
  let ripples = []
  let width = 0
  let height = 0
  let count = 0
  let dot = 2
  let x = new Float32Array(0)
  let y = new Float32Array(0)
  let vx, vy, sx, sy, tx, ty, delay, curl, phase, finalColor, driftColor, drawColor
  // Animation time: real time, slowed while calm. All motion runs on this clock.
  let clock = 0
  let lastFrame = performance.now()
  let timeScale = 1
  let startTime = 0
  let formed = false
  let frame = 0

  function build(keepPositions) {
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    width = canvas.clientWidth
    height = canvas.clientHeight
    if (!width || !height) {
      count = 0
      return
    }
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)

    const logo = rasterizeLogo(width, height)
    onLayout?.(logo.layout)
    const { targets, cell } = sampleTargets(logo, width, height)
    const previousCount = keepPositions ? count : 0
    const previousX = x
    const previousY = y

    count = targets.length
    // Slightly smaller than a cell, so neighbouring dots stay distinct pixels.
    dot = Math.max(1.5, cell * 0.85)
    x = new Float32Array(count)
    y = new Float32Array(count)
    vx = new Float32Array(count)
    vy = new Float32Array(count)
    sx = new Float32Array(count)
    sy = new Float32Array(count)
    tx = new Float32Array(count)
    ty = new Float32Array(count)
    delay = new Float32Array(count)
    curl = new Float32Array(count)
    phase = new Float32Array(count)
    finalColor = new Uint8Array(count)
    driftColor = new Uint8Array(count)
    drawColor = new Uint8Array(count)

    for (let i = 0; i < count; i++) {
      const pick = targets[i]
      tx[i] = logo.xs[pick] - dot / 2
      ty[i] = logo.ys[pick] - dot / 2
      finalColor[i] = logo.cs[pick]
      driftColor[i] = DRIFT_COLORS[Math.floor(Math.random() * DRIFT_COLORS.length)]

      if (i < previousCount) {
        x[i] = previousX[i]
        y[i] = previousY[i]
      } else {
        // Born anywhere on the visible screen.
        x[i] = Math.random() * width
        y[i] = Math.random() * height
      }
      sx[i] = x[i]
      sy[i] = y[i]

      const angle = Math.random() * Math.PI * 2
      const speed = 0.15 + Math.random() * 0.55
      vx[i] = Math.cos(angle) * speed
      vy[i] = Math.sin(angle) * speed
      delay[i] = Math.random() * MAX_DELAY_MS
      curl[i] = (Math.random() - 0.5) * 0.8
      phase[i] = Math.random() * Math.PI * 2
      drawColor[i] = keepPositions ? finalColor[i] : driftColor[i]
    }
  }

  function step(now) {
    const elapsed = clock - startTime
    const calm = isCalm?.() ?? false
    const pushRadiusSq = POINTER_RADIUS * POINTER_RADIUS
    const time = clock * 0.002
    ripples = ripples.filter((ripple) => now - ripple.born < RIPPLE_LIFE_MS)
    const rings = ripples.map((ripple) => {
      const age = now - ripple.born
      return { x: ripple.x, y: ripple.y, radius: age * RIPPLE_SPEED, strength: RIPPLE_FORCE * (1 - age / RIPPLE_LIFE_MS) ** 2 }
    })

    for (let i = 0; i < count; i++) {
      const assembleStart = DRIFT_MS + delay[i]

      if (elapsed < assembleStart) {
        // Dispersed: wander with a slow organic sway and remember where the pull will start from.
        x[i] += vx[i] + Math.sin(time + phase[i]) * 0.25
        y[i] += vy[i] + Math.cos(time * 0.8 + phase[i]) * 0.25
        sx[i] = x[i]
        sy[i] = y[i]
        drawColor[i] = driftColor[i]
        continue
      }

      const t = (elapsed - assembleStart) / ASSEMBLE_MS

      if (t < 1) {
        // Pulled in: eased interpolation toward the target, bent sideways mid-flight.
        const e = easeInOutCubic(t)
        const dx = tx[i] - sx[i]
        const dy = ty[i] - sy[i]
        const bend = Math.sin(Math.PI * e) * curl[i]
        x[i] = sx[i] + dx * e - dy * bend
        y[i] = sy[i] + dy * e + dx * bend
        drawColor[i] = t < 0.55 ? driftColor[i] : finalColor[i]
        vx[i] = 0
        vy[i] = 0
        continue
      }

      // Formed: spring toward a slightly shimmering target; the pointer and its ripples displace it.
      drawColor[i] = finalColor[i]
      const goalX = tx[i] + Math.sin(time + phase[i]) * SHIMMER
      const goalY = ty[i] + Math.cos(time + phase[i]) * SHIMMER
      vx[i] += (goalX - x[i]) * SPRING
      vy[i] += (goalY - y[i]) * SPRING

      const px = x[i] - pointer.x
      const py = y[i] - pointer.y
      const distSq = px * px + py * py
      if (!calm && distSq < pushRadiusSq && distSq > 0.01) {
        const dist = Math.sqrt(distSq)
        const force = (1 - dist / POINTER_RADIUS) * POINTER_FORCE
        const nx = px / dist
        const ny = py / dist
        vx[i] += (nx - ny * POINTER_SWIRL) * force
        vy[i] += (ny + nx * POINTER_SWIRL) * force
      }

      for (let r = 0; r < rings.length; r++) {
        const ring = rings[r]
        const rx = x[i] - ring.x
        const ry = y[i] - ring.y
        const dist = Math.sqrt(rx * rx + ry * ry)
        const offset = Math.abs(dist - ring.radius)
        if (offset < RIPPLE_BAND && dist > 0.1) {
          const kick = (1 - offset / RIPPLE_BAND) * ring.strength
          vx[i] += (rx / dist) * kick
          vy[i] += (ry / dist) * kick
        }
      }

      vx[i] *= DAMPING
      vy[i] *= DAMPING
      x[i] += vx[i] * timeScale
      y[i] += vy[i] * timeScale
    }

    if (!formed && elapsed >= FORMED_MS) {
      formed = true
      onFormed?.()
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height)
    for (let c = 0; c < COLORS.length; c++) {
      ctx.fillStyle = COLORS[c]
      for (let i = 0; i < count; i++) {
        if (drawColor[i] === c) {
          ctx.fillRect(x[i], y[i], dot, dot)
        }
      }
    }
  }

  function loop(now) {
    const goal = isCalm?.() ? CALM_TIME_SCALE : 1
    timeScale += (goal - timeScale) * TIME_SCALE_EASE
    clock += Math.min(now - lastFrame, MAX_FRAME_MS) * timeScale
    lastFrame = now
    step(now)
    draw()
    frame = requestAnimationFrame(loop)
  }

  function onPointerMove(event) {
    const rect = canvas.getBoundingClientRect()
    pointer.x = event.clientX - rect.left
    pointer.y = event.clientY - rect.top

    const now = performance.now()
    const moved = Math.hypot(pointer.x - lastRipple.x, pointer.y - lastRipple.y)
    if (formed && !isCalm?.() && moved >= RIPPLE_EVERY_PX && now - lastRipple.at >= RIPPLE_MIN_GAP_MS) {
      ripples.push({ x: pointer.x, y: pointer.y, born: now })
      if (ripples.length > RIPPLE_MAX) {
        ripples.shift()
      }
      lastRipple.x = pointer.x
      lastRipple.y = pointer.y
      lastRipple.at = now
    }
  }

  function onPointerLeave() {
    pointer.x = OFFSCREEN
    pointer.y = OFFSCREEN
  }

  const resizeObserver = new ResizeObserver(() => {
    if (canvas.clientWidth === width && canvas.clientHeight === height) {
      return
    }
    // Mid-animation resizes just retarget; after the logo is formed, particles spring to the new layout.
    build(count > 0)
    if (formed) {
      startTime = clock - FORMED_MS
    }
  })

  build(false)
  resizeObserver.observe(canvas)
  window.addEventListener('pointermove', onPointerMove)
  document.documentElement.addEventListener('pointerleave', onPointerLeave)
  frame = requestAnimationFrame(loop)

  return () => {
    cancelAnimationFrame(frame)
    resizeObserver.disconnect()
    window.removeEventListener('pointermove', onPointerMove)
    document.documentElement.removeEventListener('pointerleave', onPointerLeave)
  }
}
