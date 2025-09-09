/**
 * 衝突判定管理クラス
 */
class CollisionManager {
    constructor() {
        // 衝突判定の設定
        this.collisionPadding = 2; // 当たり判定を少し小さくする
    }

    /**
     * すべての衝突判定を実行
     */
    checkAllCollisions(player, enemies, boss, bulletManager, effectManager, onScore, onBossDefeated) {
        // プレイヤー弾と敵の衝突
        this.checkBulletEnemyCollisions(bulletManager, enemies, effectManager, onScore);

        // プレイヤー弾とボスの衝突
        if (boss && boss.active) {
            this.checkBulletBossCollisions(bulletManager, boss, effectManager, onScore, onBossDefeated);
        }

        // プレイヤーと敵の衝突
        if (this.checkPlayerEnemyCollisions(player, enemies, effectManager)) {
            return true; // ゲームオーバー
        }

        // プレイヤーと敵弾の衝突
        if (this.checkPlayerBulletCollisions(player, bulletManager.getAllEnemyBullets(), effectManager)) {
            return true; // ゲームオーバー
        }

        return false;
    }

    /**
     * プレイヤー弾と敵の衝突判定
     */
    checkBulletEnemyCollisions(bulletManager, enemies, effectManager, onScore) {
        for (let i = bulletManager.playerBullets.length - 1; i >= 0; i--) {
            const bullet = bulletManager.playerBullets[i];
            
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                
                if (this.checkCollision(bullet, enemy)) {
                    // エフェクト追加
                    effectManager.addExplosion(enemy.centerX, enemy.centerY, enemy.color);
                    
                    // スコア加算
                    onScore(enemy.score);
                    
                    // 削除
                    enemies.splice(j, 1);
                    bulletManager.playerBullets.splice(i, 1);
                    break;
                }
            }
        }
    }

    /**
     * プレイヤー弾とボスの衝突判定
     */
    checkBulletBossCollisions(bulletManager, boss, effectManager, onScore, onBossDefeated) {
        for (let i = bulletManager.playerBullets.length - 1; i >= 0; i--) {
            const bullet = bulletManager.playerBullets[i];
            
            if (this.checkCollision(bullet, boss)) {
                if (boss.vulnerable) {
                    // ダメージエフェクト
                    effectManager.addExplosion(bullet.centerX, bullet.centerY, '#ffffff', 5);
                    
                    // ダメージ処理
                    if (boss.takeDamage(bullet.damage)) {
                        // ボス撃破
                        effectManager.addExplosion(boss.centerX, boss.centerY, boss.color, 100);
                        onScore(10000 * boss.stage);
                        onBossDefeated();
                    } else {
                        onScore(500);
                    }
                } else {
                    // 無敵時のエフェクト
                    effectManager.addExplosion(bullet.centerX, bullet.centerY, '#95a5a6', 4);
                }
                
                // 弾削除
                bulletManager.playerBullets.splice(i, 1);
            }
        }
    }

    /**
     * プレイヤーと敵の衝突判定
     */
    checkPlayerEnemyCollisions(player, enemies, effectManager) {
        if (!player.active || player.isInvulnerable()) return false;

        for (let enemy of enemies) {
            if (this.checkCollision(player, enemy)) {
                // プレイヤー爆発エフェクト
                effectManager.addExplosion(player.centerX, player.centerY, player.color, 50);
                
                // ダメージ処理
                return player.takeDamage();
            }
        }
        return false;
    }

    /**
     * プレイヤーと敵弾の衝突判定
     */
    checkPlayerBulletCollisions(player, enemyBullets, effectManager) {
        if (!player.active || player.isInvulnerable()) return false;

        for (let bullet of enemyBullets) {
            if (this.checkCircleRectCollision(bullet, player)) {
                // プレイヤー爆発エフェクト
                effectManager.addExplosion(player.centerX, player.centerY, player.color, 50);
                
                // ダメージ処理
                return player.takeDamage();
            }
        }
        return false;
    }

    /**
     * 矩形同士の衝突判定
     */
    checkCollision(obj1, obj2) {
        const padding = this.collisionPadding;
        return obj1.x + padding < obj2.x + obj2.width - padding &&
               obj1.x + obj1.width - padding > obj2.x + padding &&
               obj1.y + padding < obj2.y + obj2.height - padding &&
               obj1.y + obj1.height - padding > obj2.y + padding;
    }

    /**
     * 円と矩形の衝突判定
     */
    checkCircleRectCollision(circle, rect) {
        // 円の中心座標
        const circleX = circle.centerX;
        const circleY = circle.centerY;
        const radius = circle.radius || 5;

        // 矩形の範囲
        const rectLeft = rect.x + this.collisionPadding;
        const rectRight = rect.x + rect.width - this.collisionPadding;
        const rectTop = rect.y + this.collisionPadding;
        const rectBottom = rect.y + rect.height - this.collisionPadding;

        // 最も近い点を見つける
        const closestX = Math.max(rectLeft, Math.min(circleX, rectRight));
        const closestY = Math.max(rectTop, Math.min(circleY, rectBottom));

        // 距離を計算
        const distanceX = circleX - closestX;
        const distanceY = circleY - closestY;
        const distanceSquared = distanceX * distanceX + distanceY * distanceY;

        return distanceSquared < radius * radius;
    }
}

export default CollisionManager;