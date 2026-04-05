export class AssetManager {
    constructor() {
        this.assets = new Map();
    }

    async loadImage(name, url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.assets.set(name, img);
                resolve(img);
            };
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
            img.src = url;
        });
    }

    get(name) {
        return this.assets.get(name);
    }
}

export class GameLoop {
    constructor(updateFn, renderFn) {
        this.update = updateFn;
        this.render = renderFn;
        this.lastTime = 0;
        this.isRunning = false;
    }

    start() {
        this.isRunning = true;
        requestAnimationFrame(this.loop.bind(this));
    }

    loop(timestamp) {
        if (!this.isRunning) return;

        // Calculate Delta Time (dt) in seconds
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // Cap deltaTime to avoid huge jumps after tab switch
        const cappedDt = Math.min(deltaTime, 0.1);

        this.update(cappedDt);
        this.render();

        requestAnimationFrame(this.loop.bind(this));
    }

    stop() {
        this.isRunning = false;
    }
}
