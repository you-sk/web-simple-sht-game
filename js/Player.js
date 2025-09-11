import GameObject from './GameObject.js';

/**
 * プレイヤークラス
 */
class Player extends GameObject {
    constructor(x, y) {
        super(x, y, 40, 40);
        this.speed = 5;
        this.baseSpeed = 5;
        this.color = '#3498db';
        this.shotCooldown = 0;
        this.shotInterval = 15;
        this.baseShotInterval = 15;
        this.lives = 3;
        this.invulnerableTime = 0;
        this.invulnerableDuration = 120; // 2秒間の無敵時間
        
        // パワーアップ関連
        this.weaponType = 'normal'; // normal, 3way, laser, homing, spread
        this.shield = 0; // シールドのヒット数
        this.bombs = 1; // ボムの数
        this.speedBoost = false;
        this.rapidFire = false;
        this.powerUpDuration = {
            speed: 0,
            rapid: 0
        };
    }

    /**
     * プレイヤーの更新
     */
    update() {
        super.update();
        
        // クールダウンの更新
        if (this.shotCooldown > 0) {
            this.shotCooldown--;
        }
        
        // 無敵時間の更新
        if (this.invulnerableTime > 0) {
            this.invulnerableTime--;
        }
        
        // パワーアップ効果時間の更新
        if (this.powerUpDuration.speed > 0) {
            this.powerUpDuration.speed--;
            if (this.powerUpDuration.speed === 0) {
                this.speedBoost = false;
                this.speed = this.baseSpeed;
            }
        }
        
        if (this.powerUpDuration.rapid > 0) {
            this.powerUpDuration.rapid--;
            if (this.powerUpDuration.rapid === 0) {
                this.rapidFire = false;
                this.shotInterval = this.baseShotInterval;
            }
        }
    }

    /**
     * プレイヤーの描画
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        if (!this.active) return;
        
        // 無敵時間中は点滅
        if (this.invulnerableTime > 0 && Math.floor(this.invulnerableTime / 5) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // 機体本体（三角形）
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.centerX, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        
        // 翼部分
        ctx.fillStyle = '#5dade2';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height * 0.8);
        ctx.lineTo(this.x - this.width * 0.25, this.y + this.height);
        ctx.lineTo(this.x + this.width + this.width * 0.25, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height * 0.8);
        ctx.closePath();
        ctx.fill();
        
        ctx.globalAlpha = 1.0;
        
        // シールドの描画
        if (this.shield > 0) {
            ctx.strokeStyle = '#A8E6CF';
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.2;
            ctx.beginPath();
            ctx.arc(this.centerX, this.centerY, this.width * 0.8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        }
    }

    /**
     * 移動処理
     * @param {number} dx 
     * @param {number} dy 
     */
    move(dx, dy) {
        this.x += dx * this.speed;
        this.y += dy * this.speed;
    }

    /**
     * 画面内に収める
     * @param {number} canvasWidth 
     * @param {number} canvasHeight 
     */
    clampToCanvas(canvasWidth, canvasHeight) {
        this.x = Math.max(0, Math.min(canvasWidth - this.width, this.x));
        this.y = Math.max(0, Math.min(canvasHeight - this.height, this.y));
    }

    /**
     * 射撃可能かどうか
     */
    canShoot() {
        return this.shotCooldown <= 0 && this.active;
    }

    /**
     * 射撃後のクールダウン設定
     */
    shoot() {
        if (this.canShoot()) {
            this.shotCooldown = this.shotInterval;
            return true;
        }
        return false;
    }

    /**
     * ダメージを受ける
     */
    takeDamage() {
        if (this.invulnerableTime <= 0 && this.active) {
            // シールドがある場合はシールドを消費
            if (this.shield > 0) {
                this.shield--;
                return false;
            }
            
            this.lives--;
            this.invulnerableTime = this.invulnerableDuration;
            
            if (this.lives <= 0) {
                this.active = false;
                return true; // ゲームオーバー
            }
        }
        return false;
    }

    /**
     * 無敵状態かどうか
     */
    isInvulnerable() {
        return this.invulnerableTime > 0;
    }

    /**
     * パワーアップを適用
     * @param {string} type パワーアップタイプ
     */
    applyPowerUp(type) {
        switch(type) {
            case '3way':
            case 'laser':
            case 'homing':
            case 'spread':
                this.weaponType = type;
                break;
            case 'shield':
                this.shield = Math.min(this.shield + 3, 9); // 最大9ヒットまで
                break;
            case 'speed':
                this.speedBoost = true;
                this.speed = this.baseSpeed * 1.5;
                this.powerUpDuration.speed = 600; // 10秒間
                break;
            case 'rapid':
                this.rapidFire = true;
                this.shotInterval = Math.max(3, this.baseShotInterval / 2);
                this.powerUpDuration.rapid = 600; // 10秒間
                break;
            case 'bomb':
                this.bombs = Math.min(this.bombs + 1, 5); // 最大5個まで
                break;
        }
    }
    
    /**
     * ボムを使用
     */
    useBomb() {
        if (this.bombs > 0) {
            this.bombs--;
            return true;
        }
        return false;
    }
    
    /**
     * リセット
     */
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.active = true;
        this.lives = 3;
        this.invulnerableTime = 0;
        this.shotCooldown = 0;
        this.weaponType = 'normal';
        this.shield = 0;
        this.bombs = 1;
        this.speedBoost = false;
        this.rapidFire = false;
        this.speed = this.baseSpeed;
        this.shotInterval = this.baseShotInterval;
        this.powerUpDuration = { speed: 0, rapid: 0 };
    }
}

export default Player;