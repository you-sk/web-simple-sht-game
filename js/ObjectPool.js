/**
 * オブジェクトプール基底クラス
 */
export class ObjectPool {
    constructor(createFn, resetFn, maxSize = 100) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.maxSize = maxSize;
        this.pool = [];
        this.activeCount = 0;
        
        // 初期プールを作成
        this.expandPool(20);
    }
    
    /**
     * プールを拡張
     */
    expandPool(count) {
        for (let i = 0; i < count && this.pool.length < this.maxSize; i++) {
            const obj = this.createFn();
            obj.active = false;
            obj.poolIndex = this.pool.length;
            this.pool.push(obj);
        }
    }
    
    /**
     * オブジェクトを取得
     */
    get(...args) {
        // 利用可能なオブジェクトを探す
        for (let i = 0; i < this.pool.length; i++) {
            if (!this.pool[i].active) {
                const obj = this.pool[i];
                obj.active = true;
                this.resetFn(obj, ...args);
                this.activeCount++;
                return obj;
            }
        }
        
        // プールが空の場合、拡張する
        if (this.pool.length < this.maxSize) {
            this.expandPool(10);
            return this.get(...args);
        }
        
        // 最大サイズに達している場合はnullを返す
        return null;
    }
    
    /**
     * オブジェクトを返却
     */
    release(obj) {
        if (obj && obj.active) {
            obj.active = false;
            this.activeCount--;
        }
    }
    
    /**
     * すべてのアクティブなオブジェクトを返却
     */
    releaseAll() {
        for (let i = 0; i < this.pool.length; i++) {
            if (this.pool[i].active) {
                this.pool[i].active = false;
            }
        }
        this.activeCount = 0;
    }
    
    /**
     * アクティブなオブジェクトを取得
     */
    getActive() {
        return this.pool.filter(obj => obj.active);
    }
    
    /**
     * プールの状態を取得
     */
    getStats() {
        return {
            total: this.pool.length,
            active: this.activeCount,
            available: this.pool.length - this.activeCount,
            maxSize: this.maxSize
        };
    }
}

/**
 * 弾丸用オブジェクトプール
 */
export class BulletPool extends ObjectPool {
    constructor(maxSize = 200) {
        super(
            // 弾丸オブジェクトの生成
            () => ({
                x: 0,
                y: 0,
                velocity: { x: 0, y: 0 },
                radius: 5,
                color: '#fff',
                active: false,
                damage: 1,
                type: 'normal',
                target: null,
                homing: false,
                piercing: false,
                lifeTime: 0,
                maxLifeTime: 300
            }),
            // 弾丸のリセット
            (bullet, x, y, vx, vy, options = {}) => {
                bullet.x = x;
                bullet.y = y;
                bullet.velocity.x = vx;
                bullet.velocity.y = vy;
                bullet.radius = options.radius || 5;
                bullet.color = options.color || '#fff';
                bullet.damage = options.damage || 1;
                bullet.type = options.type || 'normal';
                bullet.target = options.target || null;
                bullet.homing = options.homing || false;
                bullet.piercing = options.piercing || false;
                bullet.lifeTime = 0;
                bullet.maxLifeTime = options.maxLifeTime || 300;
            },
            maxSize
        );
    }
    
    /**
     * 弾丸を更新
     */
    updateBullets(canvasWidth, canvasHeight) {
        const bullets = this.getActive();
        
        for (let i = 0; i < bullets.length; i++) {
            const bullet = bullets[i];
            
            // ホーミング処理
            if (bullet.homing && bullet.target && bullet.target.active) {
                const angle = Math.atan2(
                    bullet.target.centerY - bullet.y,
                    bullet.target.centerX - bullet.x
                );
                const speed = Math.sqrt(bullet.velocity.x ** 2 + bullet.velocity.y ** 2);
                const turnRate = 0.1;
                bullet.velocity.x = bullet.velocity.x * (1 - turnRate) + Math.cos(angle) * speed * turnRate;
                bullet.velocity.y = bullet.velocity.y * (1 - turnRate) + Math.sin(angle) * speed * turnRate;
            }
            
            // 位置更新
            bullet.x += bullet.velocity.x;
            bullet.y += bullet.velocity.y;
            
            // ライフタイム更新
            bullet.lifeTime++;
            
            // 画面外判定またはライフタイム切れ
            if (bullet.x < -50 || bullet.x > canvasWidth + 50 ||
                bullet.y < -50 || bullet.y > canvasHeight + 50 ||
                bullet.lifeTime > bullet.maxLifeTime) {
                this.release(bullet);
            }
        }
    }
    
    /**
     * 弾丸を描画
     */
    drawBullets(ctx) {
        const bullets = this.getActive();
        
        for (let i = 0; i < bullets.length; i++) {
            const bullet = bullets[i];
            
            ctx.save();
            ctx.fillStyle = bullet.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = bullet.color;
            
            if (bullet.type === 'laser') {
                // レーザーの描画
                ctx.strokeStyle = bullet.color;
                ctx.lineWidth = bullet.radius * 2;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(bullet.x - bullet.velocity.x * 2, bullet.y - bullet.velocity.y * 2);
                ctx.lineTo(bullet.x + bullet.velocity.x * 2, bullet.y + bullet.velocity.y * 2);
                ctx.stroke();
            } else {
                // 通常の弾丸
                ctx.beginPath();
                ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
    }
}