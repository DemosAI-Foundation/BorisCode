export class InputHandler {
    constructor() {
        this.keys = new Map();
        
        window.addEventListener('keydown', (e) => {
            // Prevent scrolling with arrow keys
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
                e.preventDefault();
            }
            this.keys.set(e.key, true);
        });

        window.addEventListener('keyup', (e) => {
            this.keys.set(e.key, false);
        });
    }

    isPressed(key) {
        return this.keys.get(key) || false;
    }
}
