import GameObject from './GameObject.js';

/**
 * ボスクラス
 */
class Boss extends GameObject {
    constructor(x, y, stage) {
        super(x - 90, y - 60, 180, 120);
        this.stage = stage;
        this.speed = 2;
        this.hp = 40 * stage;
        this.maxHp = 40 * stage;
        this.color = '#c0392b';
        this.vulnerable = false;
        this.attackCooldown = 120;
        this.attackPattern = 0;
        
        // 初期速度設定
        this.velocity.y = this.speed;
    }

    /**
     * ボスの更新
     * @param {Player} player 
     */
    update(player) {
        // 登場演出
        if (!this.vulnerable) {
            if (this.centerY < 120) {
                this.y += this.speed;
            } else {
                this.vulnerable = true;
                this.velocity.y = 0;
            }
            return;
        }

        // 攻撃クールダウン
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }

        super.update();
    }

    /**
     * ボスの描画
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        if (!this.active) return;

        // メインボディ
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // コア部分
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(this.centerX - 30, this.centerY - 30, 60, 60);

        // 砲台
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(this.x - 20, this.centerY - 20, 20, 40);
        ctx.fillRect(this.x + this.width, this.centerY - 20, 20, 40);
    }

    /**
     * HPバーの描画
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} canvasWidth 
     */
    drawHealthBar(ctx, canvasWidth) {
        if (!this.vulnerable) return;

        const hpBarWidth = canvasWidth * 0.8;
        const hpPercentage = this.hp / this.maxHp;
        
        // 背景
        ctx.fillStyle = '#555';
        ctx.fillRect(canvasWidth/2 - hpBarWidth/2, 10, hpBarWidth, 15);
        
        // HP
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(canvasWidth/2 - hpBarWidth/2, 10, hpBarWidth * hpPercentage, 15);
    }

    /**
     * 射撃
     * @param {Player} player - プレイヤーオブジェクト（狙い撃ち用）
     */
    shoot(player) {
        if (!this.vulnerable || this.attackCooldown > 0) {
            return null;
        }

        const bullets = [];

        switch(this.stage) {
            case 1:
                // ステージ1: 5way弾
                for (let i = 0; i < 5; i++) {
                    const angle = (i - 2) * 0.3 + Math.PI/2;
                    bullets.push({
                        x: this.centerX,
                        y: this.centerY,
                        vx: Math.cos(angle) * 4,
                        vy: Math.sin(angle) * 4,
                        radius: 6,
                        color: '#ff7979'
                    });
                }
                this.attackCooldown = 100;
                break;

            case 2:
                // ステージ2: 交互パターン
                if (this.attackPattern % 2 === 0) {
                    // 7way弾
                    for (let i = 0; i < 7; i++) {
                        const angle = (i - 3) * 0.25 + Math.PI/2;
                        bullets.push({
                            x: this.centerX,
                            y: this.centerY,
                            vx: Math.cos(angle) * 4.5,
                            vy: Math.sin(angle) * 4.5,
                            radius: 6,
                            color: '#ff7979'
                        });
                    }
                } else {
                    // 狙い撃ち
                    const angle = Math.atan2(
                        player.centerY - this.centerY,
                        player.centerX - this.centerX
                    );
                    bullets.push({
                        x: this.centerX,
                        y: this.centerY,
                        vx: Math.cos(angle) * 5,
                        vy: Math.sin(angle) * 5,
                        radius: 8,
                        color: '#ffbe76'
                    });
                }
                this.attackPattern++;
                this.attackCooldown = 80;
                break;

            case 3:
                // ステージ3: 複合パターン
                if (this.attackPattern % 2 === 0) {
                    // 9way弾
                    for (let i = 0; i < 9; i++) {
                        const angle = (i - 4) * 0.2 + Math.PI/2;
                        bullets.push({
                            x: this.centerX,
                            y: this.centerY,
                            vx: Math.cos(angle) * 5,
                            vy: Math.sin(angle) * 5,
                            radius: 7,
                            color: '#ff7979'
                        });
                    }
                } else {
                    // 3way狙い撃ち
                    const baseAngle = Math.atan2(
                        player.centerY - this.centerY,
                        player.centerX - this.centerX
                    );
                    for (let i = -1; i <= 1; i++) {
                        const angle = baseAngle + i * 0.2;
                        bullets.push({
                            x: this.centerX,
                            y: this.centerY,
                            vx: Math.cos(angle) * 5.5,
                            vy: Math.sin(angle) * 5.5,
                            radius: 8,
                            color: '#ffbe76'
                        });
                    }
                }
                this.attackPattern++;
                this.attackCooldown = 60;
                break;
        }

        return bullets.length > 0 ? bullets : null;
    }

    /**
     * ダメージを受ける
     * @param {number} damage 
     */
    takeDamage(damage = 1) {
        if (this.vulnerable) {
            this.hp -= damage;
            if (this.hp <= 0) {
                this.active = false;
                return true; // 撃破
            }
        }
        return false;
    }
}

export default Boss;