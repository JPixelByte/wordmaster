class WaterBalloon {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.radius = 30;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = 15;
        this.gravity = 0.5;
        this.velocityX = (targetX - x) / 30;
        this.velocityY = -15;
        this.popped = false;
        this.droplets = [];
    }

    update() {
        if (!this.popped) {
            this.velocityY += this.gravity;
            this.x += this.velocityX;
            this.y += this.velocityY;

            if (this.y > this.targetY) {
                this.pop();
            }
        } else {
            this.updateDroplets();
        }
    }

    pop() {
        this.popped = true;
        const soundNumber = Math.random() < 0.5 ? '1' : '2';
        const sound = document.getElementById('splash' + soundNumber);
        sound.currentTime = 0;
        sound.volume = 0.2;
        sound.playbackRate = 0.8;
        sound.play().catch(e => console.log('Sound play failed:', e));

        for (let i = 0; i < 30; i++) {
            this.droplets.push({
                x: this.x,
                y: this.y,
                velocityX: (Math.random() - 0.5) * 10,
                velocityY: (Math.random() - 2) * 10,
                size: Math.random() * 5 + 3
            });
        }
    }

    updateDroplets() {
        for (let droplet of this.droplets) {
            droplet.velocityY += 0.2;
            droplet.x += droplet.velocityX;
            droplet.y += droplet.velocityY;
            droplet.velocityX *= 0.99;
        }
    }

    draw(ctx) {
        if (!this.popped) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 191, 255, 0.8)';
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.fill();
            ctx.stroke();
        } else {
            for (let droplet of this.droplets) {
                ctx.beginPath();
                ctx.arc(droplet.x, droplet.y, droplet.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 191, 255, 0.6)';
                ctx.fill();
            }
        }
    }
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = 800;
    canvas.height = 600;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const balloons = [];
let lastBalloonTime = 0;
const balloonInterval = 2000;

function animate(currentTime) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentTime - lastBalloonTime > balloonInterval) {
        const startX = canvas.width / 2;
        const balloon = new WaterBalloon(
            startX,
            canvas.height - 50,
            startX + (Math.random() - 0.5) * 200,
            canvas.height * 0.6
        );
        balloons.push(balloon);
        lastBalloonTime = currentTime;
    }

    for (let balloon of balloons) {
        balloon.update();
        balloon.draw(ctx);
    }

    balloons.forEach((balloon, index) => {
        if (balloon.popped && balloon.droplets.every(d => d.y > canvas.height)) {
            balloons.splice(index, 1);
        }
    });

    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    ctx.strokeText('Game Over', canvas.width / 2, canvas.height / 2);
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);

    requestAnimationFrame(animate);
}

animate(0);
