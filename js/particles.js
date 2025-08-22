class ParticlesAnimation {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
        this.init();
    }

    init() {
        this.createCanvas();
        this.createParticles();
        this.startAnimation();
        this.setupResizeListener();
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'particles-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
        `;
        
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];
        const particleCount = Math.min(90, Math.floor(window.innerWidth / 15));

        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 4 + 1,
                speedX: (Math.random() - 0.5) * 1.2,
                speedY: (Math.random() - 0.5) * 1.2,
                color: this.getRandomRedColor(),
                opacity: Math.random() * 0.7 + 0.3,
                angle: Math.random() * Math.PI * 2,
                waveAmplitude: Math.random() * 2 + 1
            });
        }
    }

    getRandomRedColor() {
        const reds = [
            '#dc2626', '#ef4444', '#f87171', '#fca5a5', 
            '#b91c1c', '#991b1b', '#7f1d1d',
            '#ff6b6b', '#ff5252', '#ff3838' 
        ];
        return reds[Math.floor(Math.random() * reds.length)];
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2,
            this.canvas.height / 2,
            0,
            this.canvas.width / 2,
            this.canvas.height / 2,
            Math.max(this.canvas.width, this.canvas.height)
        );
        gradient.addColorStop(0, 'rgba(15, 23, 42, 0.3)');
        gradient.addColorStop(1, 'rgba(15, 23, 42, 0.8)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 4
            );
            gradient.addColorStop(0, `${particle.color}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(0.5, `${particle.color}40`);
            gradient.addColorStop(1, `${particle.color}00`);
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
                        this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fill();
            
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = particle.color;
        });

        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;
    }

    updateParticles() {
        this.particles.forEach(particle => {
            particle.angle += 0.02;
            particle.x += particle.speedX + Math.cos(particle.angle) * particle.waveAmplitude;
            particle.y += particle.speedY + Math.sin(particle.angle) * particle.waveAmplitude;

            if (particle.x < -50 || particle.x > this.canvas.width + 50) {
                particle.speedX *= -0.8;
                particle.x = Math.max(-50, Math.min(this.canvas.width + 50, particle.x));
            }
            if (particle.y < -50 || particle.y > this.canvas.height + 50) {
                particle.speedY *= -0.8;
                particle.y = Math.max(-50, Math.min(this.canvas.height + 50, particle.y));
            }

            particle.opacity += (Math.random() - 0.5) * 0.05;
            particle.opacity = Math.max(0.3, Math.min(0.9, particle.opacity));
            
            if (Math.random() < 0.01) {
                particle.opacity = 0.9;
            }
        });
    }

    animate() {
        this.drawParticles();
        this.updateParticles();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    startAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.animate();
    }

    setupResizeListener() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.resizeCanvas();
                this.createParticles();
            }, 200);
        });
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.particlesAnimation = new ParticlesAnimation();
});