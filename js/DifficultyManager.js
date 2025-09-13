export class DifficultyManager {
    constructor() {
        this.selectionCooldown = 0;
        this.difficulties = {
            easy: {
                name: 'EASY',
                color: '#4CAF50',
                enemySpeedMultiplier: 0.7,
                enemyHealthMultiplier: 0.8,
                bulletSpeedMultiplier: 0.7,
                spawnRateMultiplier: 0.8,
                scoreMultiplier: 0.8,
                description: '初心者向け'
            },
            normal: {
                name: 'NORMAL',
                color: '#2196F3',
                enemySpeedMultiplier: 1.0,
                enemyHealthMultiplier: 1.0,
                bulletSpeedMultiplier: 1.0,
                spawnRateMultiplier: 1.0,
                scoreMultiplier: 1.0,
                description: '標準難易度'
            },
            hard: {
                name: 'HARD',
                color: '#FF9800',
                enemySpeedMultiplier: 1.3,
                enemyHealthMultiplier: 1.5,
                bulletSpeedMultiplier: 1.3,
                spawnRateMultiplier: 1.2,
                scoreMultiplier: 1.5,
                description: '上級者向け'
            },
            nightmare: {
                name: 'NIGHTMARE',
                color: '#F44336',
                enemySpeedMultiplier: 1.5,
                enemyHealthMultiplier: 2.0,
                bulletSpeedMultiplier: 1.5,
                spawnRateMultiplier: 1.5,
                scoreMultiplier: 2.0,
                description: '極限の挑戦'
            }
        };
        
        this.currentDifficulty = 'normal';
        this.dynamicAdjustmentEnabled = false;
        this.playerPerformance = {
            deaths: 0,
            stageClearTime: 0,
            accuracy: 0,
            damageDealt: 0,
            damageTaken: 0
        };
    }
    
    setDifficulty(difficulty) {
        if (this.difficulties[difficulty]) {
            this.currentDifficulty = difficulty;
            return true;
        }
        return false;
    }
    
    getDifficulty() {
        return this.difficulties[this.currentDifficulty];
    }
    
    getCurrentDifficultyName() {
        return this.currentDifficulty;
    }
    
    getEnemySpeed(baseSpeed) {
        return baseSpeed * this.getDifficulty().enemySpeedMultiplier;
    }
    
    getEnemyHealth(baseHealth) {
        return Math.floor(baseHealth * this.getDifficulty().enemyHealthMultiplier);
    }
    
    getBulletSpeed(baseSpeed) {
        return baseSpeed * this.getDifficulty().bulletSpeedMultiplier;
    }
    
    getSpawnRate(baseRate) {
        return Math.floor(baseRate / this.getDifficulty().spawnRateMultiplier);
    }
    
    getScore(baseScore) {
        return Math.floor(baseScore * this.getDifficulty().scoreMultiplier);
    }
    
    enableDynamicAdjustment() {
        this.dynamicAdjustmentEnabled = true;
    }
    
    disableDynamicAdjustment() {
        this.dynamicAdjustmentEnabled = false;
    }
    
    updatePlayerPerformance(stats) {
        Object.assign(this.playerPerformance, stats);
        
        if (this.dynamicAdjustmentEnabled) {
            this.adjustDifficulty();
        }
    }
    
    adjustDifficulty() {
        const deathRate = this.playerPerformance.deaths / Math.max(1, this.playerPerformance.stageClearTime);
        const damageRatio = this.playerPerformance.damageTaken / Math.max(1, this.playerPerformance.damageDealt);
        
        if (deathRate > 0.1 && damageRatio > 0.5) {
            if (this.currentDifficulty === 'nightmare') {
                this.setDifficulty('hard');
            } else if (this.currentDifficulty === 'hard') {
                this.setDifficulty('normal');
            } else if (this.currentDifficulty === 'normal') {
                this.setDifficulty('easy');
            }
        } else if (deathRate < 0.02 && damageRatio < 0.1) {
            if (this.currentDifficulty === 'easy') {
                this.setDifficulty('normal');
            } else if (this.currentDifficulty === 'normal') {
                this.setDifficulty('hard');
            } else if (this.currentDifficulty === 'hard') {
                this.setDifficulty('nightmare');
            }
        }
    }
    
    renderDifficultySelection(ctx, canvasWidth, canvasHeight) {
        ctx.save();
        
        // 背景を完全に黒でクリア
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('難易度選択', canvasWidth / 2, 150);
        
        const difficulties = Object.keys(this.difficulties);
        const boxWidth = 200;
        const boxHeight = 100;
        const startY = 250;
        const spacing = 20;
        
        difficulties.forEach((key, index) => {
            const diff = this.difficulties[key];
            const y = startY + index * (boxHeight + spacing);
            const x = canvasWidth / 2 - boxWidth / 2;
            
            ctx.fillStyle = this.currentDifficulty === key ? diff.color : 'rgba(50, 50, 50, 0.8)';
            ctx.fillRect(x, y, boxWidth, boxHeight);
            
            ctx.strokeStyle = this.currentDifficulty === key ? 'white' : diff.color;
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, boxWidth, boxHeight);
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 24px Arial';
            ctx.fillText(diff.name, canvasWidth / 2, y + 35);
            
            ctx.font = '16px Arial';
            ctx.fillText(diff.description, canvasWidth / 2, y + 60);
            
            if (diff.scoreMultiplier !== 1.0) {
                ctx.font = '14px Arial';
                ctx.fillStyle = '#FFD700';
                ctx.fillText(`スコア x${diff.scoreMultiplier}`, canvasWidth / 2, y + 80);
            }
        });
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '16px Arial';
        ctx.fillText('↑↓キーで選択、Enterで決定', canvasWidth / 2, canvasHeight - 50);
        
        ctx.restore();
    }
    
    handleDifficultySelection(input) {
        const difficulties = Object.keys(this.difficulties);
        const currentIndex = difficulties.indexOf(this.currentDifficulty);
        
        // クールダウン処理
        if (this.selectionCooldown > 0) {
            this.selectionCooldown--;
            return false;
        }
        
        if (input.up && currentIndex > 0) {
            this.currentDifficulty = difficulties[currentIndex - 1];
            this.selectionCooldown = 15; // 0.25秒のクールダウン（60FPS想定）
            return false;
        } else if (input.down && currentIndex < difficulties.length - 1) {
            this.currentDifficulty = difficulties[currentIndex + 1];
            this.selectionCooldown = 15; // 0.25秒のクールダウン
            return false;
        } else if (input.action) {
            return true;
        }
        
        return false;
    }
}