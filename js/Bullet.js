import GameObject from './GameObject.js';

/**
 * 弾丸クラス
 */
class Bullet extends GameObject {
    constructor(x, y, velocityX, velocityY, isPlayerBullet = true) {
        const width = isPlayerBullet ? 5 : 10;
        const height = isPlayerBullet ? 15 : 10;
        super(x - width/2, y - height/2, width, height);
        
        this.velocity.x = velocityX;
        this.velocity.y = velocityY;
        this.isPlayerBullet = isPlayerBullet;
        this.color = isPlayerBullet ? '#f1c40f' : '#f39c12';
        this.damage = 1;
        
        // 敵弾は円形
        if (!isPlayerBullet) {
            this.radius = 5;
        }
    }

    /**
     * 弾丸の描画
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        ctx.fillStyle = this.color;
        
        if (this.isPlayerBullet) {
            // プレイヤー弾は矩形
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else {
            // 敵弾は円形
            ctx.beginPath();
            ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * 円形弾の衝突判定用
     * @param {GameObject} other 
     */
    collidesWithCircle(other) {
        if (!this.isPlayerBullet) {
            const dx = this.centerX - other.centerX;
            const dy = this.centerY - other.centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < this.radius + Math.min(other.width, other.height) / 2;
        }
        return super.collidesWith(other);
    }
}

/**
 * ボス弾クラス
 */
class BossBullet extends Bullet {
    constructor(x, y, velocityX, velocityY, radius = 6, color = '#ff7979') {
        super(x, y, velocityX, velocityY, false);
        this.radius = radius;
        this.color = color;
    }
}

/**
 * 弾丸管理クラス
 */
class BulletManager {
    constructor() {
        this.playerBullets = [];
        this.enemyBullets = [];
        this.bossBullets = [];
    }

    /**
     * プレイヤー弾を追加
     * @param {number} x 
     * @param {number} y 
     */
    addPlayerBullet(x, y, velocityY = -10) {
        this.playerBullets.push(new Bullet(x, y, 0, velocityY, true));
    }

    /**
     * プレイヤーの2way弾を追加
     * @param {Player} player 
     */
    addPlayerDoubleBullets(player) {
        const bulletOffset = player.width / 4;
        this.addPlayerBullet(player.centerX - bulletOffset, player.y);
        this.addPlayerBullet(player.centerX + bulletOffset, player.y);
    }

    /**
     * 敵弾を追加
     * @param {number} x 
     * @param {number} y 
     * @param {number} speed 
     */
    addEnemyBullet(x, y, speed = 4) {
        this.enemyBullets.push(new Bullet(x, y, 0, speed, false));
    }

    /**
     * ボス弾を追加
     * @param {number} x 
     * @param {number} y 
     * @param {number} vx 
     * @param {number} vy 
     * @param {number} radius 
     * @param {string} color 
     */
    addBossBullet(x, y, vx, vy, radius = 6, color = '#ff7979') {
        this.bossBullets.push(new BossBullet(x, y, vx, vy, radius, color));
    }

    /**
     * すべての弾丸を更新
     * @param {number} canvasWidth 
     * @param {number} canvasHeight 
     */
    update(canvasWidth, canvasHeight) {
        // プレイヤー弾の更新
        this.playerBullets = this.playerBullets.filter(bullet => {
            bullet.update();
            return bullet.active && !bullet.isOutOfBounds(canvasWidth, canvasHeight);
        });

        // 敵弾の更新
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.update();
            return bullet.active && !bullet.isOutOfBounds(canvasWidth, canvasHeight);
        });

        // ボス弾の更新
        this.bossBullets = this.bossBullets.filter(bullet => {
            bullet.update();
            return bullet.active && !bullet.isOutOfBounds(canvasWidth, canvasHeight);
        });
    }

    /**
     * すべての弾丸を描画
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        this.playerBullets.forEach(bullet => bullet.draw(ctx));
        this.enemyBullets.forEach(bullet => bullet.draw(ctx));
        this.bossBullets.forEach(bullet => bullet.draw(ctx));
    }

    /**
     * すべての弾丸をクリア
     */
    clear() {
        this.playerBullets = [];
        this.enemyBullets = [];
        this.bossBullets = [];
    }

    /**
     * 敵弾とボス弾を統合して取得
     */
    getAllEnemyBullets() {
        return [...this.enemyBullets, ...this.bossBullets];
    }
}

export { Bullet, BossBullet, BulletManager };