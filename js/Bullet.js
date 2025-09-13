import GameObject from './GameObject.js';
import { BulletPool } from './ObjectPool.js';

/**
 * 弾丸クラス
 */
class Bullet extends GameObject {
    constructor(x, y, velocityX, velocityY, isPlayerBullet = true, bulletType = 'normal') {
        const width = isPlayerBullet ? 5 : 10;
        const height = isPlayerBullet ? 15 : 10;
        super(x - width/2, y - height/2, width, height);
        
        this.velocity.x = velocityX;
        this.velocity.y = velocityY;
        this.isPlayerBullet = isPlayerBullet;
        this.bulletType = bulletType;
        this.damage = 1;
        this.target = null; // ホーミング用ターゲット
        this.homingSpeed = 0.3;
        
        // 弾タイプごとの設定
        if (isPlayerBullet) {
            switch(bulletType) {
                case 'laser':
                    this.width = 10;
                    this.height = 30;
                    this.damage = 2;
                    this.color = '#4ECDC4';
                    break;
                case 'homing':
                    this.color = '#95E77E';
                    this.damage = 1.5;
                    break;
                case 'spread':
                    this.color = '#FFE66D';
                    break;
                default:
                    this.color = '#f1c40f';
            }
        } else {
            this.color = '#f39c12';
            // 敵弾は円形
            this.radius = 5;
        }
    }

    /**
     * 弾丸の更新
     */
    update() {
        // ホーミング弾の追尾処理
        if (this.bulletType === 'homing' && this.target && this.target.active) {
            const dx = this.target.centerX - this.centerX;
            const dy = this.target.centerY - this.centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
                this.velocity.x += (dx / dist) * this.homingSpeed;
                this.velocity.y += (dy / dist) * this.homingSpeed;
                
                // 速度制限
                const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
                const maxSpeed = 12;
                if (speed > maxSpeed) {
                    this.velocity.x = (this.velocity.x / speed) * maxSpeed;
                    this.velocity.y = (this.velocity.y / speed) * maxSpeed;
                }
            }
        }
        
        super.update();
    }
    
    /**
     * 弾丸の描画
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        ctx.fillStyle = this.color;
        
        if (this.isPlayerBullet) {
            if (this.bulletType === 'laser') {
                // レーザーは太い線
                ctx.fillRect(this.x, this.y, this.width, this.height);
                // グロー効果
                ctx.globalAlpha = 0.5;
                ctx.fillRect(this.x - 2, this.y, this.width + 4, this.height);
                ctx.globalAlpha = 1.0;
            } else {
                // 通常のプレイヤー弾は矩形
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
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
        
        // オブジェクトプールを使用
        this.useObjectPool = true;
        this.playerBulletPool = new BulletPool(300);
        this.enemyBulletPool = new BulletPool(200);
        this.bossBulletPool = new BulletPool(200);
    }

    /**
     * プレイヤー弾を追加（武器タイプ対応）
     * @param {Player} player 
     * @param {Array} enemies 敵リスト（ホーミング用）
     */
    addPlayerBullets(player, enemies = []) {
        switch(player.weaponType) {
            case 'normal':
                this.playerBullets.push(new Bullet(player.centerX, player.y, 0, -10, true, 'normal'));
                break;
                
            case '3way':
                // 3方向に発射
                this.playerBullets.push(new Bullet(player.centerX, player.y, 0, -10, true, 'normal'));
                this.playerBullets.push(new Bullet(player.centerX, player.y, -2, -9, true, 'normal'));
                this.playerBullets.push(new Bullet(player.centerX, player.y, 2, -9, true, 'normal'));
                break;
                
            case 'laser':
                // 強力なレーザー
                this.playerBullets.push(new Bullet(player.centerX, player.y, 0, -15, true, 'laser'));
                break;
                
            case 'homing':
                // ホーミング弾（最も近い敵をターゲットに）
                const homingBullet = new Bullet(player.centerX, player.y, 0, -8, true, 'homing');
                if (enemies.length > 0) {
                    let nearestEnemy = null;
                    let minDist = Infinity;
                    enemies.forEach(enemy => {
                        if (enemy.active) {
                            const dist = Math.sqrt(
                                (enemy.centerX - player.centerX) ** 2 + 
                                (enemy.centerY - player.centerY) ** 2
                            );
                            if (dist < minDist) {
                                minDist = dist;
                                nearestEnemy = enemy;
                            }
                        }
                    });
                    homingBullet.target = nearestEnemy;
                }
                this.playerBullets.push(homingBullet);
                break;
                
            case 'spread':
                // 扇状に5発
                for (let i = -2; i <= 2; i++) {
                    this.playerBullets.push(new Bullet(
                        player.centerX, 
                        player.y, 
                        i * 2, 
                        -10 + Math.abs(i), 
                        true, 
                        'spread'
                    ));
                }
                break;
        }
    }

    /**
     * プレイヤー弾を追加（旧メソッド互換用）
     * @param {number} x 
     * @param {number} y 
     */
    addPlayerBullet(x, y, velocityY = -10) {
        this.playerBullets.push(new Bullet(x, y, 0, velocityY, true, 'normal'));
    }

    /**
     * プレイヤーの2way弾を追加（旧メソッド互換用）
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