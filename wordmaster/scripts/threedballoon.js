class WaterBalloon {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.z = 3000 // Start even further away
    this.baseRadius = 40 // Larger base size
    this.radius = this.baseRadius
    this.speed = 25 // Faster movement
    this.zSpeed = -60 // Much faster approach speed
    this.popped = false
    this.droplets = []
    this.opacity = 0.6 // Start more visible
    this.splashSize = 200 // Larger splash
  }

  update() {
    if (!this.popped) {
      // Move towards viewer
      this.z += this.zSpeed

      // Calculate scale based on z position
      const scale = Math.max(0.1, (3000 - this.z) / 1000)
      this.radius = this.baseRadius * scale

      // Pop when close enough
      if (this.z <= 500) {
        // Pop closer to viewer
        this.pop()
      }
    } else {
      this.updateDroplets()
    }
  }

  pop() {
    if (this.popped) return
    this.popped = true

    // Create more droplets for a bigger splash
    const numDroplets = 50 // More droplets
    for (let i = 0; i < numDroplets; i++) {
      const angle = (Math.PI * 2 * i) / numDroplets
      const speed = 5 + Math.random() * 10 // Faster droplets
      const size = 5 + Math.random() * 15 // Larger droplets

      this.droplets.push({
        x: this.x,
        y: this.y,
        size: size,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        opacity: 1,
        gravity: 0.2,
      })
    }
  }

  updateDroplets() {
    for (let droplet of this.droplets) {
      droplet.x += droplet.speedX
      droplet.y += droplet.speedY
      droplet.speedY += droplet.gravity
      droplet.opacity *= 0.92 // Faster fade out
    }
  }

  draw(ctx) {
    if (!this.popped) {
      // Draw balloon
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(30, 144, 255, ${this.opacity})`
      ctx.fill()
      ctx.strokeStyle = `rgba(25, 25, 112, ${this.opacity})`
      ctx.stroke()
    }

    // Draw droplets
    for (let droplet of this.droplets) {
      ctx.beginPath()
      ctx.arc(droplet.x, droplet.y, droplet.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(30, 144, 255, ${droplet.opacity})`
      ctx.fill()
    }
  }
}

let canvas, ctx, balloons, lastBalloonTime, isAnimating, gameOverOpacity
const balloonInterval = 400
const targetGameOverOpacity = 1

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  canvas = document.getElementById('gameCanvas')
  ctx = canvas.getContext('2d')

  // Initialize variables
  balloons = []
  lastBalloonTime = 0
  isAnimating = false
  gameOverOpacity = 0

  // Set up resize handler
  window.addEventListener('resize', resizeCanvas)
  resizeCanvas()
})

function resizeCanvas() {
  if (canvas) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
}

function animate(currentTime) {
  if (!isAnimating) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Quickly fade in Game Over text
  if (gameOverOpacity < targetGameOverOpacity) {
    gameOverOpacity += 0.1 // Faster fade in
  }

  // Draw "Game Over" text with depth effect
  ctx.font = 'bold 72px Helvetica'
  ctx.fillStyle = `rgba(224, 120, 0, ${gameOverOpacity})` // A nice orange that matches your theme
  ctx.strokeStyle = `rgba(0, 0, 0, ${gameOverOpacity})`
  ctx.lineWidth = 4 // Slightly thicker black stroke
  ctx.textAlign = 'center'
  ctx.strokeText('Game Over', canvas.width / 2 + 3, canvas.height / 2 + 3)
  ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
  //   ctx.font = 'bold 72px Helvetica'
  //   ctx.fillStyle = `rgba(255, 0, 0, ${gameOverOpacity * 0.3})`
  //   ctx.strokeStyle = `rgba(0, 0, 0, ${gameOverOpacity * 0.2})`
  //   ctx.lineWidth = 3
  //   ctx.textAlign = 'center'
  //   ctx.strokeText('Game Over', canvas.width / 2 + 3, canvas.height / 2 + 3)
  //   ctx.fillStyle = `rgb(204, 102 ), ${gameOverOpacity})`
  //   ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)

  // Launch new balloons
  if (currentTime - lastBalloonTime > balloonInterval) {
    // Launch multiple balloons in a wave
    for (let i = 0; i < 5; i++) {
      const balloon = new WaterBalloon(
        canvas.width * (0.2 + i * 0.15),
        canvas.height * (0.3 + Math.random() * 0.4)
      )
      balloons.push(balloon)
    }
    lastBalloonTime = currentTime
  }

  // Update and draw balloons
  for (let balloon of balloons) {
    balloon.update()
    balloon.draw(ctx)
  }

  // Remove old balloons more aggressively
  balloons.forEach((balloon, index) => {
    if (balloon.popped && balloon.droplets.every((d) => d.opacity <= 0.05)) {
      // Lower opacity threshold
      balloons.splice(index, 1)
    }
  })

  requestAnimationFrame(animate)
}

// Function to start animation
function startAnimation() {
  if (!canvas || !ctx) {
    canvas = document.getElementById('gameCanvas')
    ctx = canvas.getContext('2d')
    resizeCanvas()
  }
  isAnimating = true
  balloons = []
  gameOverOpacity = 0
  animate(0)
}

// Function to stop animation
function stopAnimation() {
  isAnimating = false
}
