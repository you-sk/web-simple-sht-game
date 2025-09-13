import GameObject from './GameObject.js';

/**
 * 敵の基底クラス
 */
class Enemy extends GameObject {
    constructor(x, y, type) {
        super(x, y, 35, 35);
        this.type = type;
        this.hp = 1;
        this.score = 100;
        this.shotCooldown = 60;
        this.color = '#e74c3c';
        this.difficultyMultiplier = 1;
        this.bulletSpeedMultiplier = 1;
        
        // タイプ別の初期設定
        this.initByType();
    }

    /**
     * タイプ別の初期設定
     */
    initByType() {
        switch(this.type) {
            case 'crosser':
                this.color = '#e74c3c';
                this.score = 100;
                break;
            case 'chaser':
                this.color = '#e67e22';
                this.score = 150;
                break;
            case 'shooter':
                this.color = '#9b59b6';
                this.score = 200;
                break;
        }
    }

    /**
     * 敵の更新
     * @param {Player} player - プレイヤーオブジェクト（追尾用）
     */
    update(player) {
        if (this.shotCooldown > 0) {
            this.shotCooldown--;
        }
        
        // タイプ別の動作
        switch(this.type) {
            case 'crosser':
                this.updateCrosser();
                break;
            case 'chaser':
                this.updateChaser(player);
                break;
            case 'shooter':
                this.updateShooter();
                break;
        }
        
        super.update();
    }

    /**
     * Crosserタイプの更新
     */
    updateCrosser() {
        // velocityは生成時に設定済み
    }

    /**
     * Chaserタイプの更新
     * @param {Player} player 
     */
    updateChaser(player) {
        if (player && player.active) {
            const angle = Math.atan2(
                player.centerY - this.centerY,
                player.centerX - this.centerX
            );
            const baseSpeed = 2;
            const speed = this.difficultyMultiplier ? this.difficultyMultiplier * baseSpeed : baseSpeed;
            this.velocity.x = Math.cos(angle) * speed;
            this.velocity.y = Math.sin(angle) * speed;
        }
    }

    /**
     * Shooterタイプの更新
     */
    updateShooter() {
        // 画面端で反転
        if (this.x <= 0 || this.x + this.width >= 480) { // TODO: canvas幅を引数で受け取る
            this.velocity.x *= -1;
        }
    }

    /**
     * 敵の描画
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        
        const cx = this.centerX;
        const cy = this.centerY;
        const w2 = this.width / 2;
        const h2 = this.height / 2;
        
        switch(this.type) {
            case 'crosser':
                // 左向き三角形
                ctx.moveTo(cx + w2, cy);
                ctx.lineTo(cx - w2, cy - h2);
                ctx.lineTo(cx - w2, cy + h2);
                break;
            case 'chaser':
                // ダイヤモンド形
                ctx.moveTo(cx, cy - h2);
                ctx.lineTo(cx + w2, cy);
                ctx.lineTo(cx, cy + h2);
                ctx.lineTo(cx - w2, cy);
                break;
            case 'shooter':
                // 台形
                ctx.moveTo(cx - w2, cy + h2);
                ctx.lineTo(cx + w2, cy + h2);
                ctx.lineTo(cx + w2 * 0.7, cy - h2);
                ctx.lineTo(cx - w2 * 0.7, cy - h2);
                break;
        }
        
        ctx.closePath();
        ctx.fill();
    }

    /**
     * 射撃可能かどうか
     */
    canShoot() {
        return this.type === 'shooter' && this.shotCooldown <= 0;
    }

    /**
     * 射撃
     */
    shoot() {
        if (this.canShoot()) {
            this.shotCooldown = 90;
            return {
                x: this.centerX,
                y: this.centerY + this.height / 2,
                radius: 5,
                speed: this.bulletSpeedMultiplier ? this.bulletSpeedMultiplier * 4 : 4,
                color: '#f39c12'
            };
        }
        return null;
    }

    /**
     * ダメージを受ける
     */
    takeDamage(damage = 1) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.active = false;
            return true; // 撃破
        }
        return false;
    }
}

/**
 * 敵生成ファクトリー
 */
class EnemyFactory {
    /**
     * 敵を生成
     * @param {Object} data - 敵データ
     * @param {DifficultyManager} difficultyManager - 難易度マネージャー
     */
    static create(data, difficultyManager) {
        const enemy = new Enemy(data.x, data.y || -30, data.type);
        
        // 難易度調整
        if (difficultyManager) {
            enemy.hp = difficultyManager.getEnemyHealth(enemy.hp);
            enemy.score = difficultyManager.getScore(enemy.score);
            enemy.difficultyMultiplier = difficultyManager.getDifficulty().enemySpeedMultiplier;
            enemy.bulletSpeedMultiplier = difficultyManager.getDifficulty().bulletSpeedMultiplier;
        }
        
        // 速度設定（難易度調整込み）
        const baseVx = data.vx || 0;
        const baseVy = data.vy || 2;
        enemy.velocity.x = difficultyManager ? difficultyManager.getEnemySpeed(baseVx) : baseVx;
        enemy.velocity.y = difficultyManager ? difficultyManager.getEnemySpeed(baseVy) : baseVy;
        
        return enemy;
    }
}

export { Enemy, EnemyFactory };