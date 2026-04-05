export const GameState = {
    player: {
        hearts: 3,
        keys: 0,
        isAlive: true
    },
    world: {
        bossDefeated: false,
        doorUnlocked: false
    },
    message: null,

    updateHearts(delta) {
        this.player.hearts += delta;
        if (this.player.hearts <= 0) {
            this.player.hearts = 0;
            this.player.isAlive = false;
        }
        document.getElementById('heart-count').innerText = this.player.hearts;
    },

    addKey() {
        this.player.keys++;
        document.getElementById('key-count').innerText = this.player.keys;
    },

    setMessage(text) {
        this.message = text;
        const overlay = document.getElementById('message-overlay');
        const textEl = document.getElementById('message-text');
        if (text) {
            textEl.innerText = text;
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }
};
