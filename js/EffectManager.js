/**
 * エフェクト管理クラス
 */
class EffectManager {
    constructor() {
        this.explosions = [];
    }

    /**
     * 爆発エフェクトを追加
     * @param {number} x 
     * @param {number} y 
     * @param {string} color 
     * @param {number} count 
     */
    addExplosion(x, y, color = '#ff0000', count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 1;
            
            this.explosions.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 3 + 1,
                color: color,
                life: 30,
                maxLife: 30
            });
        }
    }

    /**
     * エフェクトの更新
     */
    update() {
        this.explosions = this.explosions.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            return particle.life > 0;
        });
    }

    /**
     * エフェクトの描画
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        this.explosions.forEach(particle => {
            ctx.globalAlpha = particle.life / particle.maxLife;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;
    }

    /**
     * すべてのエフェクトをクリア
     */
    clear() {
        this.explosions = [];
    }
}

export default EffectManager;