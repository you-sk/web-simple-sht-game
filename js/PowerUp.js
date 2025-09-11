import GameObject from './GameObject.js';

/**
 * パワーアップアイテムクラス
 */
class PowerUp extends GameObject {
    constructor(x, y, type) {
        super(x, y, 30, 30);
        this.type = type;
        this.speed = 2;
        this.bobAmount = 0;
        this.bobSpeed = 0.1;
        
        // パワーアップタイプごとの設定
        this.powerUpConfig = {
            '3way': { color: '#FF6B6B', icon: '3' },
            'laser': { color: '#4ECDC4', icon: 'L' },
            'homing': { color: '#95E77E', icon: 'H' },
            'spread': { color: '#FFE66D', icon: 'S' },
            'shield': { color: '#A8E6CF', icon: '⛨' },
            'speed': { color: '#FF8B94', icon: '⟫' },
            'rapid': { color: '#B4A7D6', icon: '⚡' },
            'bomb': { color: '#FFD93D', icon: '💣' }
        };
        
        this.config = this.powerUpConfig[type] || this.powerUpConfig['3way'];
    }
    
    /**
     * パワーアップアイテムの更新
     */
    update() {
        // 下にゆっくり移動
        this.y += this.speed;
        
        // 左右に揺れる効果
        this.bobAmount += this.bobSpeed;
        this.x += Math.sin(this.bobAmount) * 0.5;
        
        // 画面外に出たら無効化
        if (this.y > 750) {
            this.active = false;
        }
    }
    
    /**
     * パワーアップアイテムの描画
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        if (!this.active) return;
        
        // 光る効果のための外側の円
        const glowSize = 5 + Math.sin(this.bobAmount * 2) * 3;
        ctx.fillStyle = this.config.color + '40';
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.width / 2 + glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // メインの円
        ctx.fillStyle = this.config.color;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 内側の白い円
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.width / 2 - 5, 0, Math.PI * 2);
        ctx.fill();
        
        // アイコンまたはテキスト
        ctx.fillStyle = this.config.color;
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.config.icon, this.centerX, this.centerY);
    }
}

/**
 * パワーアップマネージャークラス
 */
class PowerUpManager {
    constructor() {
        this.powerUps = [];
        this.dropChance = 0.15; // 15%の確率でドロップ
        this.weaponTypes = ['3way', 'laser', 'homing', 'spread'];
        this.supportTypes = ['shield', 'speed', 'rapid', 'bomb'];
    }
    
    /**
     * パワーアップを生成
     * @param {number} x 
     * @param {number} y 
     * @param {boolean} isFromBoss ボスからのドロップかどうか
     */
    spawn(x, y, isFromBoss = false) {
        // ボスからは必ずドロップ、通常敵は確率でドロップ
        if (!isFromBoss && Math.random() > this.dropChance) {
            return;
        }
        
        // パワーアップタイプをランダムに選択
        const allTypes = [...this.weaponTypes, ...this.supportTypes];
        const type = allTypes[Math.floor(Math.random() * allTypes.length)];
        
        const powerUp = new PowerUp(x, y, type);
        this.powerUps.push(powerUp);
    }
    
    /**
     * 全パワーアップの更新
     */
    update() {
        this.powerUps.forEach(powerUp => powerUp.update());
        // 非アクティブなパワーアップを削除
        this.powerUps = this.powerUps.filter(powerUp => powerUp.active);
    }
    
    /**
     * 全パワーアップの描画
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        this.powerUps.forEach(powerUp => powerUp.draw(ctx));
    }
    
    /**
     * 全パワーアップをクリア
     */
    clear() {
        this.powerUps = [];
    }
}

export { PowerUp, PowerUpManager };