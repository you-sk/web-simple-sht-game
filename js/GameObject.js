/**
 * ゲームオブジェクトの基底クラス
 */
class GameObject {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.active = true;
        this.velocity = { x: 0, y: 0 };
    }

    /**
     * オブジェクトの更新
     */
    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }

    /**
     * オブジェクトの描画
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        // 派生クラスでオーバーライド
    }

    /**
     * 画面外判定
     * @param {number} canvasWidth 
     * @param {number} canvasHeight 
     */
    isOutOfBounds(canvasWidth, canvasHeight) {
        return this.x < -this.width || 
               this.x > canvasWidth + this.width ||
               this.y < -this.height || 
               this.y > canvasHeight + this.height;
    }

    /**
     * 矩形同士の衝突判定
     * @param {GameObject} other 
     */
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }

    /**
     * 中心座標を取得
     */
    get centerX() {
        return this.x + this.width / 2;
    }

    get centerY() {
        return this.y + this.height / 2;
    }

    /**
     * 中心座標を設定
     */
    set centerX(value) {
        this.x = value - this.width / 2;
    }

    set centerY(value) {
        this.y = value - this.height / 2;
    }
}

export default GameObject;