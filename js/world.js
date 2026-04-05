export class World {
    constructor(tileSize = 32) {
        this.tileSize = tileSize;
        // 0: Floor, 1: Wall, 2: Locked Door, 3: Key, 4: Enemy Spawn, 5: Boss Door
        this.map = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
            [1,0,1,0,1,0,1,1,1,1,1,1,0,1,0,1,1,1,0,1],
            [1,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1],
            [1,0,1,1,1,1,1,1,1,0,0,1,1,1,0,1,0,1,1,1],
            [1,0,0,0,0,0,0,0,1,0,0,0,0,1,0,1,0,0,0,1],
            [1,1,1,1,1,0,1,0,1,1,1,1,0,1,0,1,1,1,0,1],
            [1,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
            [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
            [1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,0,1,0,1],
            [1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0,1],
            [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
            [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
            [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
            [1,0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ];
        this.width = this.map[0].length * this.tileSize;
        this.height = this.map.length * this.tileSize;
    }

    getTile(x, y) {
        const col = Math.floor(x / this.tileSize);
        const row = Math.floor(y / this.tileSize);
        if (row < 0 || row >= this.map.length || col < 0 || col >= this.map[0].length) {
            return 1; // Treat out of bounds as wall
        }
        return this.map[row][col];
    }

    checkCollision(x, y, width, height) {
        const left = Math.floor(x / this.tileSize);
        const right = Math.floor((x + width) / this.tileSize);
        const top = Math.floor(y / this.tileSize);
        const bottom = Math.floor((y + height) / this.tileSize);

        for (let r = top; r <= bottom; r++) {
            for (let c = left; c <= right; c++) {
                const tile = this.getTileAt(c, r);
                if (tile === 1 || tile === 2 || tile === 5) {
                    return true;
                }
            }
        }
        return false;
    }

    getTileAt(col, row) {
        if (row < 0 || row >= this.map.length || col < 0 || col >= this.map[0].length) return 1;
        return this.map[row][col];
    }

    draw(ctx) {
        for (let r = 0; r < this.map.length; r++) {
            for (let c = 0; c < this.map[r].length; c++) {
                const tile = this.map[r][c];
                ctx.fillStyle = this.getTileColor(tile);
                ctx.fillRect(c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize);
                
                // Add a slight border to tiles for a grid look
                ctx.strokeStyle = "rgba(0,0,0,0.1)";
                ctx.strokeRect(c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize);
            }
        }
    }

    getTileColor(tile) {
        switch(tile) {
            case 0: return "#4a7c44"; // Grass
            case 1: return "#777";    // Wall
            case 2: return "#a52a2a"; // Locked Door
            case 3: return "#ffd700"; // Key (Gold)
            case 4: return "#4a7c44"; // Spawn (Grass)
            case 5: return "#4b0082"; // Boss Door
            default: return "#000";
        }
    }
}
