import Player from './Player.js';
import { EnemyFactory } from './Enemy.js';
import { BulletManager } from './Bullet.js';
import Boss from './Boss.js';
import EffectManager from './EffectManager.js';
import InputManager from './InputManager.js';
import CollisionManager from './CollisionManager.js';
import { stageData, enemyData, tileColors } from './StageData.js';

/**
 * ゲーム全体を管理するクラス
 */
class GameManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvasWidth = 480;
        this.canvasHeight = 720;
        
        // キャンバスサイズ設定
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        
        // ゲーム設定
        this.STAGE_DURATION_SECONDS = 30;
        this.FRAMES_PER_SECOND = 60;
        this.TOTAL_GAME_FRAMES = this.STAGE_DURATION_SECONDS * this.FRAMES_PER_SECOND;
        
        // ゲーム状態
        this.gameState = 'title'; // title, stage_start, playing, boss, gameover, game_clear, stage_clear, endscreen
        this.gameFrame = 0;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('stellarStrikerHighScore')) || 0;
        this.currentStage = 1;
        this.stageStartTimer = 0;
        this.isInvincible = false;
        
        // ゲームオブジェクト
        this.player = null;
        this.enemies = [];
        this.boss = null;
        this.bulletManager = new BulletManager();
        this.effectManager = new EffectManager();
        this.inputManager = new InputManager();
        this.collisionManager = new CollisionManager();
        
        // ステージデータ
        this.stageData = null;
        this.enemyData = null;
        this.tileColors = null;
        this.stageDataIndex = 0;
        this.enemyDataIndex = 0;
        
        // 背景
        this.background = { speed: 2, elements: [] };
        this.titleStars = [];
        
        // UI要素
        this.gameOverlay = document.getElementById('game-overlay');
        this.messageEl = document.getElementById('message');
        this.actionButton = document.getElementById('action-button');
        this.invincibleCheckbox = document.getElementById('invincible-checkbox');
        
        // イベントリスナー設定
        this.setupEventListeners();
        
        // 初期化
        this.setupTitleScreen();
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // アクションボタン
        this.actionButton.addEventListener('click', () => {
            if (this.gameState === 'title') {
                this.init(1);
            } else if (this.gameState === 'endscreen') {
                this.setupTitleScreen();
            }
        });
        
        // 無敵モードチェックボックス
        this.invincibleCheckbox.addEventListener('change', (e) => {
            this.isInvincible = e.target.checked;
        });
    }

    /**
     * タイトル画面の設定
     */
    setupTitleScreen() {
        this.gameState = 'title';
        this.messageEl.innerHTML = `STELLAR STRIKER<br><span style='font-size: 20px;'>HI-SCORE: ${this.highScore}</span><br><span style='font-size: 18px;'>Press Enter or Gamepad Button</span>`;
        this.actionButton.textContent = "ゲーム開始";
        this.gameOverlay.classList.add('active');
        
        // タイトル画面の星を初期化
        if (this.titleStars.length === 0) {
            for (let i = 0; i < 100; i++) {
                this.titleStars.push({
                    x: Math.random() * this.canvasWidth,
                    y: Math.random() * this.canvasHeight,
                    size: Math.random() * 2 + 1,
                    speed: Math.random() * 0.5 + 0.2
                });
            }
        }
    }

    /**
     * ゲーム初期化
     * @param {number} stage 
     */
    init(stage = 1) {
        this.currentStage = stage;
        this.gameFrame = 0;
        this.gameState = 'stage_start';
        this.stageStartTimer = 120; // 2秒
        
        if (stage === 1) {
            this.score = 0;
        }
        
        // ステージデータ読み込み
        this.loadStageData(this.currentStage);
        
        // プレイヤー初期化
        this.player = new Player(this.canvasWidth / 2 - 20, this.canvasHeight - 80);
        
        // 各種マネージャーをクリア
        this.enemies = [];
        this.boss = null;
        this.bulletManager.clear();
        this.effectManager.clear();
        
        // 背景初期化
        this.background = { speed: 2, elements: [] };
        this.stageDataIndex = 0;
        this.enemyDataIndex = 0;
        
        // UIを非表示
        this.gameOverlay.classList.remove('active');
        
        // 無敵モード設定
        this.isInvincible = this.invincibleCheckbox.checked;
    }

    /**
     * ステージデータ読み込み
     * @param {number} stage 
     */
    loadStageData(stage) {
        this.stageData = stageData[stage - 1];
        this.enemyData = enemyData[stage - 1];
        this.tileColors = tileColors[stage - 1];
    }

    /**
     * メインゲームループ
     */
    gameLoop() {
        // 入力処理
        this.handleInput();
        
        // 状態別の更新処理
        switch (this.gameState) {
            case 'title':
                this.updateTitleScreen();
                this.drawTitleScreen();
                break;
            case 'stage_start':
                this.updateBackground();
                this.drawAllGameElements();
                this.drawStageStart();
                this.stageStartTimer--;
                if (this.stageStartTimer <= 0) {
                    this.gameState = 'playing';
                }
                break;
            case 'playing':
            case 'boss':
                this.update();
                this.checkCollisions();
                this.drawAllGameElements();
                break;
            case 'gameover':
            case 'game_clear':
            case 'stage_clear':
                this.effectManager.update();
                this.drawAllGameElements();
                if (this.effectManager.explosions.length === 0) {
                    if (this.gameState === 'gameover') {
                        this.showEndScreen(`GAME OVER<br><span style='font-size: 24px;'>SCORE: ${this.score}</span>`, 'タイトルへ戻る');
                        this.gameState = 'endscreen';
                    } else if (this.gameState === 'game_clear') {
                        this.showEndScreen(`GAME CLEAR!<br><span style='font-size: 24px;'>SCORE: ${this.score}</span>`, 'タイトルへ戻る');
                        this.gameState = 'endscreen';
                    } else if (this.gameState === 'stage_clear') {
                        this.init(this.currentStage + 1);
                    }
                }
                break;
            case 'endscreen':
                // 入力待ち
                break;
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * 入力処理
     */
    handleInput() {
        const input = this.inputManager.getInput();
        
        // タイトル画面やエンド画面での入力
        if ((this.gameState === 'title' || this.gameState === 'endscreen') && input.action) {
            this.actionButton.click();
            return;
        }
        
        // ゲーム中の入力
        if (this.player && this.player.active && this.gameState !== 'stage_start') {
            // 移動
            if (input.up) this.player.move(0, -1);
            if (input.down) this.player.move(0, 1);
            if (input.left) this.player.move(-1, 0);
            if (input.right) this.player.move(1, 0);
            
            // 画面内に収める
            this.player.clampToCanvas(this.canvasWidth, this.canvasHeight);
            
            // 射撃
            if (input.shoot && this.player.shoot()) {
                this.bulletManager.addPlayerDoubleBullets(this.player);
            }
        }
    }

    /**
     * ゲーム更新処理
     */
    update() {
        if (this.gameState === 'playing' || this.gameState === 'boss') {
            this.gameFrame++;
            
            // ステージ終了判定
            if (this.gameState === 'playing' && this.gameFrame > this.TOTAL_GAME_FRAMES) {
                this.gameState = 'boss';
                this.boss = new Boss(this.canvasWidth / 2, -120, this.currentStage);
                this.boss.active = true;
            }
            
            // 各要素の更新
            this.updateBackground();
            this.updateEnemies();
            this.player.update();
            this.bulletManager.update(this.canvasWidth, this.canvasHeight);
            this.effectManager.update();
            
            if (this.boss && this.boss.active) {
                this.boss.update(this.player);
                
                // ボス弾発射
                const bossBullets = this.boss.shoot();
                if (bossBullets) {
                    bossBullets.forEach(bullet => {
                        this.bulletManager.addBossBullet(
                            bullet.x, bullet.y, bullet.vx, bullet.vy, 
                            bullet.radius, bullet.color
                        );
                    });
                }
            }
        }
    }

    /**
     * 背景の更新
     */
    updateBackground() {
        // 背景速度調整
        if (this.gameState === 'boss') {
            this.background.speed = 0;
        } else {
            this.background.speed = 2;
        }
        
        // 背景要素の追加
        while (this.stageDataIndex < this.stageData.length && 
               this.stageData[this.stageDataIndex].time <= this.gameFrame) {
            const data = this.stageData[this.stageDataIndex];
            this.background.elements.push({
                x: data.x,
                y: -data.height,
                width: data.width,
                height: data.height,
                color: this.tileColors[data.type],
                shape: data.shape || 'rect'
            });
            this.stageDataIndex++;
        }
        
        // 背景要素の移動と削除
        this.background.elements = this.background.elements.filter(el => {
            el.y += this.background.speed;
            return el.y < this.canvasHeight;
        });
    }

    /**
     * 敵の更新
     */
    updateEnemies() {
        // 敵の生成
        while (this.enemyDataIndex < this.enemyData.length && 
               this.enemyData[this.enemyDataIndex].time <= this.gameFrame) {
            const data = this.enemyData[this.enemyDataIndex];
            this.enemies.push(EnemyFactory.create(data));
            this.enemyDataIndex++;
        }
        
        // 敵の更新と削除
        this.enemies = this.enemies.filter(enemy => {
            enemy.update(this.player);
            
            // 射撃判定
            const bullet = enemy.shoot();
            if (bullet) {
                this.bulletManager.addEnemyBullet(bullet.x, bullet.y, bullet.speed);
            }
            
            // 画面外判定
            if (enemy.isOutOfBounds(this.canvasWidth, this.canvasHeight)) {
                return false;
            }
            
            return enemy.active;
        });
    }

    /**
     * タイトル画面の更新
     */
    updateTitleScreen() {
        this.titleStars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.canvasHeight) {
                star.y = 0;
                star.x = Math.random() * this.canvasWidth;
            }
        });
    }

    /**
     * 衝突判定
     */
    checkCollisions() {
        if (this.isInvincible) {
            // 無敵モード時はプレイヤーへのダメージを無視
            this.collisionManager.checkBulletEnemyCollisions(
                this.bulletManager, this.enemies, this.effectManager, 
                (score) => this.score += score
            );
            
            if (this.boss && this.boss.active) {
                this.collisionManager.checkBulletBossCollisions(
                    this.bulletManager, this.boss, this.effectManager,
                    (score) => this.score += score,
                    () => this.onBossDefeated()
                );
            }
        } else {
            // 通常の衝突判定
            const gameOver = this.collisionManager.checkAllCollisions(
                this.player, this.enemies, this.boss,
                this.bulletManager, this.effectManager,
                (score) => this.score += score,
                () => this.onBossDefeated()
            );
            
            if (gameOver) {
                this.onGameOver();
            }
        }
    }

    /**
     * ボス撃破時の処理
     */
    onBossDefeated() {
        if (this.currentStage < 3) {
            this.gameState = 'stage_clear';
        } else {
            this.gameState = 'game_clear';
        }
    }

    /**
     * ゲームオーバー時の処理
     */
    onGameOver() {
        this.gameState = 'gameover';
    }

    /**
     * 終了画面表示
     * @param {string} message 
     * @param {string} buttonText 
     */
    showEndScreen(message, buttonText) {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('stellarStrikerHighScore', this.highScore);
            message += `<br><span style='font-size: 24px;'>HI-SCORE UPDATED!</span>`;
        }
        this.messageEl.innerHTML = message;
        this.actionButton.textContent = buttonText;
        this.gameOverlay.classList.add('active');
    }

    /**
     * タイトル画面の描画
     */
    drawTitleScreen() {
        this.ctx.fillStyle = '#000020';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        this.ctx.fillStyle = 'white';
        this.titleStars.forEach(star => {
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
        });
    }

    /**
     * ステージ開始画面の描画
     */
    drawStageStart() {
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(0, this.canvasHeight/2 - 60, this.canvasWidth, 120);
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 72px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`STAGE ${this.currentStage}`, this.canvasWidth/2, this.canvasHeight/2);
    }

    /**
     * すべてのゲーム要素を描画
     */
    drawAllGameElements() {
        this.drawBackground();
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        if (this.player) this.player.draw(this.ctx);
        this.bulletManager.draw(this.ctx);
        if (this.boss && this.boss.active) this.boss.draw(this.ctx);
        this.effectManager.draw(this.ctx);
        this.drawUI();
    }

    /**
     * 背景の描画
     */
    drawBackground() {
        if (!this.tileColors) return;
        
        // ベース色で塗りつぶし
        this.ctx.fillStyle = this.tileColors.base;
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // 背景要素の描画
        this.background.elements.forEach(el => {
            this.ctx.fillStyle = el.color;
            if (el.shape === 'pyramid') {
                this.ctx.beginPath();
                this.ctx.moveTo(el.x, el.y - el.height/2);
                this.ctx.lineTo(el.x - el.width/2, el.y + el.height/2);
                this.ctx.lineTo(el.x + el.width/2, el.y + el.height/2);
                this.ctx.closePath();
                this.ctx.fill();
            } else if (el.shape === 'star') {
                this.ctx.beginPath();
                this.ctx.arc(el.x, el.y, el.width, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                this.ctx.fillRect(el.x, el.y, el.width, el.height);
            }
        });
        
        // 暗めのオーバーレイ
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    /**
     * UIの描画
     */
    drawUI() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Inter';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`SCORE: ${this.score}`, 10, 10);
        this.ctx.fillText(`STAGE: ${this.currentStage}`, 10, 35);
        
        // ライフ表示
        if (this.player) {
            this.ctx.fillText(`LIVES: ${this.player.lives}`, 10, 60);
        }
        
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`HI-SCORE: ${this.highScore}`, this.canvasWidth - 10, 10);
        
        // ボスのHPバー
        if (this.boss && this.boss.active && this.boss.vulnerable) {
            this.boss.drawHealthBar(this.ctx, this.canvasWidth);
        }
    }

    /**
     * ゲーム開始
     */
    start() {
        this.gameLoop();
    }
}

export default GameManager;