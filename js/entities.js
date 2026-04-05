import { GameState } from './state.js';

export class Entity {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.vx = 0;
        this.vy = 0;
    }

    getCenterX() { return this.x + this.width / 2; }
    getCenterY() { return this.y + this.height / 2; }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
}

export class Player extends Entity {
    constructor(x, y) {
        super(x, y, 24, 24, '#00ff00');
        this.speed = 150;
        this.direction = 'down';
        this.isAttacking = false;
        this.attackTimer = 0;
        this.attackDuration = 0.2;
        this.invulnerabilityTimer = 0;
    }

    update(dt, input, world) {
        if (GameState.message || !GameState.player.isAlive) return;

        // Handle Attack
        if (input.isPressed(' ') && !this.isAttacking) {
            this.isAttacking = true;
            this.attackTimer = this.attackDuration;
        }

        if (this.isAttacking) {
            this.attackTimer -= dt;
            if (this.attackTimer <= 0) this.isAttacking = false;
        }

        if (this.invulnerabilityTimer > 0) {
            this.invulnerabilityTimer -= dt;
        }

        // Movement
        let moveX = 0;
        let moveY = 0;

        if (input.isPressed('ArrowUp')) { moveY -= 1; this.direction = 'up'; }
        if (input.isPressed('ArrowDown')) { moveY += 1; this.direction = 'down'; }
        if (input.isPressed('ArrowLeft')) { moveX -= 1; this.direction = 'left'; }
        if (input.isPressed('ArrowRight')) { moveX += 1; this.direction = 'right'; }

        // Normalize diagonal movement
        if (moveX !== 0 && moveY !== 0) {
            const length = Math.sqrt(moveX * moveX + moveY * moveY);
            moveX /= length;
            moveY /= length;
        }

        const nextX = this.x + moveX * this.speed * dt;
        const nextY = this.y + moveY * this.speed * dt;

        // Split-Axis Collision Resolution
        if (!world.checkCollision(nextX, this.y, this.width, this.height)) {
            this.x = nextX;
        }
        if (!world.checkCollision(this.x, nextY, this.width, this.height)) {
            this.y = nextY;
        }
    }

    getAttackBox() {
        if (!this.isAttacking) return null;
        const size = 20;
        let bx = this.x;
        let by = this.y;
        
        if (this.direction === 'up') by -= size;
        if (this.direction === 'down') by += this.height;
        if (this.direction === 'left') bx -= size;
        if (this.direction === 'right') bx += this.width;
        
        return { x: bx, y: by, width: size, height: size };
    }

    draw(ctx) {
        if (this.invulnerabilityTimer > 0 && Math.floor(Date.now() / 100) % 2 === 0) return;
        super.draw(ctx);
        
        // Draw attack
        const box = this.getAttackBox();
        if (box) {
            ctx.fillStyle = 'yellow';
            ctx.fillRect(box.x, box.y, box.width, box.height);
        }
    }
}

export class Enemy extends Entity {
    constructor(x, y, type = 'basic') {
        super(x, y, 24, 24, type === 'boss' ? '#ff00ff' : '#ff0000');
        this.type = type;
        this.speed = type === 'boss' ? 50 : 80;
        this.health = type === 'boss' ? 5 : 1;
        this.attackCooldown = 1.0;
        this.timer = 0;
    }

    update(dt, player, world) {
        this.timer += dt;
        
        const dx = player.getCenterX() - this.getCenterX();
        const dy = player.getCenterY() - this.getCenterY();
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 300) {
            const vx = (dx / dist) * this.speed * dt;
            const vy = (dy / dist) * this.speed * dt;

            if (!world.checkCollision(this.x + vx, this.y, this.width, this.height)) {
                this.x += vx;
            }
            if (!world.checkCollision(this.x, this.y + vy, this.width, this.height)) {
                this.y += vy;
            }

            if (dist < 30 && this.timer > this.attackCooldown) {
                if (player.invulnerabilityTimer <= 0) {
                    GameState.updateHearts(-1);
                    player.invulnerabilityTimer = 1.5;
                }
                this.timer = 0;
            }
        }
    }
}

export class Item extends Entity {
    constructor(x, y, type) {
        super(x, y, 16, 16, '#ffd700');
        this.type = type;
    }
}
