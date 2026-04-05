import { GameLoop, AssetManager } from './engine.js';
import { InputHandler } from './input.js';
import { World } from './world.js';
import { Player, Enemy, Item } from './entities.js';
import { GameState } from './state.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const world = new World();
canvas.width = world.width;
canvas.height = world.height;

const input = new InputHandler();
const player = new Player(64, 64);
const enemies = [];
const items = [];

// Initialize World Entities based on map
for (let r = 0; r < world.map.length; r++) {
    for (let c = 0; c < world.map[r].length; c++) {
        const tile = world.map[r][c];
        const x = c * world.tileSize;
        const y = r * world.tileSize;

        if (tile === 3) {
            items.push(new Item(x + 8, y + 8, 'key'));
            world.map[r][c] = 0; // Change to floor so it's not "collidable" as a key
        } else if (tile === 4) {
            enemies.push(new Enemy(x + 4, y + 4));
            world.map[r][c] = 0;
        }
    }
}

// Add Boss
enemies.push(new Enemy(world.width - 64, world.height - 64, 'boss'));

function update(dt) {
    if (GameState.message) {
        if (input.isPressed(' ')) {
            GameState.setMessage(null);
        }
        return;
    }

    if (!GameState.player.isAlive) {
        if (input.isPressed(' ')) {
            location.reload();
        }
        return;
    }

    player.update(dt, input, world);

    // Update Enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update(dt, player, world);

        // Player attack enemy
        const attackBox = player.getAttackBox();
        if (attackBox) {
            if (attackBox.x < enemy.x + enemy.width &&
                attackBox.x + attackBox.width > enemy.x &&
                attackBox.y < enemy.y + enemy.height &&
                attackBox.y + attackBox.height > enemy.y) {
                
                enemy.health--;
                if (enemy.health <= 0) {
                    if (enemy.type === 'boss') {
                        GameState.world.bossDefeated = true;
                        GameState.setMessage("YOU DEFEATED THE BOSS! YOU WIN!");
                    }
                    enemies.splice(i, 1);
                }
            }
        }
    }

    // Update Items
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (player.collidesWith(item)) {
            if (item.type === 'key') {
                GameState.addKey();
                GameState.setMessage("You found a key!");
            }
            items.splice(i, 1);
        }
    }

    // Check Locked Doors (Tile 2)
    const pTileX = Math.floor((player.x + player.width/2) / world.tileSize);
    const pTileY = Math.floor((player.y + player.height/2) / world.tileSize);
    
    // Check neighbors for locked doors
    const neighbors = [
        {x: pTileX, y: pTileY - 1}, {x: pTileX, y: pTileY + 1},
        {x: pTileX - 1, y: pTileY}, {x: pTileX + 1, y: pTileY}
    ];

    for (const n of neighbors) {
        if (world.getTileAt(n.x, n.y) === 2) {
            if (GameState.player.keys > 0) {
                world.map[n.y][n.x] = 0;
                GameState.player.keys--;
                document.getElementById('key-count').innerText = GameState.player.keys;
                GameState.setMessage("Door unlocked!");
            } else {
                // Player tried to walk into a locked door
                // We can't easily tell if they "tried" without velocity, 
                // but we can trigger a message if they are adjacent and moving
                if (input.isPressed('ArrowUp') && n.y === pTileY - 1 ||
                    input.isPressed('ArrowDown') && n.y === pTileY + 1 ||
                    input.isPressed('ArrowLeft') && n.x === pTileX - 1 ||
                    input.isPressed('ArrowRight') && n.x === pTileX + 1) {
                    GameState.setMessage("The door is locked. You need a key!");
                }
            }
        }
    }

    // Boss Door (Tile 5)
    for (const n of neighbors) {
        if (world.getTileAt(n.x, n.y) === 5) {
            if (GameState.world.doorUnlocked) {
                world.map[n.y][n.x] = 0;
            } else {
                if (GameState.player.keys >= 1) {
                    GameState.world.doorUnlocked = true;
                    world.map[n.y][n.x] = 0;
                    GameState.setMessage("The boss door opens!");
                } else {
                    if (input.isPressed('ArrowUp') && n.y === pTileY - 1 ||
                        input.isPressed('ArrowDown') && n.y === pTileY + 1 ||
                        input.isPressed('ArrowLeft') && n.x === pTileX - 1 ||
                        input.isPressed('ArrowRight') && n.x === pTileX + 1) {
                        GameState.setMessage("The boss door is locked. Find the gold key!");
                    }
                }
            }
        }
    }

    if (!GameState.player.isAlive) {
        GameState.setMessage("GAME OVER. Press SPACE to restart.");
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    world.draw(ctx);

    for (const item of items) {
        item.draw(ctx);
    }

    for (const enemy of enemies) {
        enemy.draw(ctx);
    }

    player.draw(ctx);
}

const game = new GameLoop(update, render);
game.start();
