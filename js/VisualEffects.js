class VisualEffects {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.screenShake = {
            intensity: 0,
            duration: 0,
            offsetX: 0,
            offsetY: 0
        };
        this.particles = [];
        this.damageNumbers = [];
        this.trails = [];
        this.comboDisplay = {
            count: 0,
            timer: 0,
            x: 0,
            y: 0,
            scale: 1
        };
    }
    
    // 画面揺れを開始
    startScreenShake(intensity = 10, duration = 300) {
        this.screenShake.intensity = intensity;
        this.screenShake.duration = duration;
    }
    
    // 画面揺れの更新
    updateScreenShake(deltaTime) {
        if (this.screenShake.duration > 0) {
            this.screenShake.duration -= deltaTime;
            this.screenShake.offsetX = (Math.random() - 0.5) * this.screenShake.intensity;
            this.screenShake.offsetY = (Math.random() - 0.5) * this.screenShake.intensity;
            
            // 徐々に弱まる
            this.screenShake.intensity *= 0.95;
        } else {
            this.screenShake.offsetX = 0;
            this.screenShake.offsetY = 0;
            this.screenShake.intensity = 0;
        }
    }
    
    // 画面揺れの適用
    applyScreenShake(ctx) {
        if (this.screenShake.duration > 0) {
            ctx.save();
            ctx.translate(this.screenShake.offsetX, this.screenShake.offsetY);
        }
    }
    
    // 画面揺れのリセット
    resetScreenShake(ctx) {
        if (this.screenShake.duration > 0) {
            ctx.restore();
        }
    }
    
    // パーティクルエフェクトを生成
    createParticles(x, y, type = 'explosion', count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const speed = Math.random() * 3 + 2;
            
            const particle = {
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                maxLife: 1.0,
                type: type,
                size: Math.random() * 4 + 2,
                color: this.getParticleColor(type),
                gravity: type === 'debris' ? 0.2 : 0
            };
            
            this.particles.push(particle);
        }
    }
    
    // パーティクルの色を取得
    getParticleColor(type) {
        switch(type) {
            case 'explosion':
                return `hsl(${Math.random() * 60}, 100%, 50%)`; // 赤〜黄色
            case 'powerup':
                return `hsl(${Math.random() * 120 + 180}, 100%, 50%)`; // 青〜緑
            case 'damage':
                return `hsl(0, 100%, ${Math.random() * 30 + 40}%)`; // 赤系
            case 'debris':
                return `hsl(0, 0%, ${Math.random() * 50 + 30}%)`; // グレー系
            default:
                return '#FFFFFF';
        }
    }
    
    // パーティクルの更新
    updateParticles(deltaTime) {
        const dt = deltaTime / 16.67; // 60FPSを基準に正規化
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // 位置更新
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            
            // 重力適用
            if (particle.gravity) {
                particle.vy += particle.gravity * dt;
            }
            
            // 減速
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            
            // ライフ減少
            particle.life -= 0.02 * dt;
            
            // 削除
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    // パーティクルの描画
    drawParticles(ctx) {
        ctx.save();
        
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            ctx.globalAlpha = alpha;
            
            // グロー効果
            if (particle.type === 'powerup' || particle.type === 'explosion') {
                ctx.shadowBlur = 10;
                ctx.shadowColor = particle.color;
            }
            
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }
    
    // ダメージ数値を表示
    showDamageNumber(x, y, damage, isCritical = false) {
        const damageNumber = {
            x: x + (Math.random() - 0.5) * 20,
            y: y,
            damage: damage,
            life: 1.0,
            isCritical: isCritical,
            vy: -2,
            scale: isCritical ? 1.5 : 1.0
        };
        
        this.damageNumbers.push(damageNumber);
    }
    
    // ダメージ数値の更新
    updateDamageNumbers(deltaTime) {
        const dt = deltaTime / 16.67;
        
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            const dmgNum = this.damageNumbers[i];
            
            // 位置更新
            dmgNum.y += dmgNum.vy * dt;
            dmgNum.vy += 0.1 * dt; // 重力
            
            // ライフ減少
            dmgNum.life -= 0.02 * dt;
            
            // スケールアニメーション
            if (dmgNum.life > 0.8) {
                dmgNum.scale += 0.05 * dt;
            }
            
            // 削除
            if (dmgNum.life <= 0) {
                this.damageNumbers.splice(i, 1);
            }
        }
    }
    
    // ダメージ数値の描画
    drawDamageNumbers(ctx) {
        ctx.save();
        
        this.damageNumbers.forEach(dmgNum => {
            ctx.globalAlpha = dmgNum.life;
            
            // クリティカルヒットは特別な表示
            if (dmgNum.isCritical) {
                ctx.fillStyle = '#FFD700';
                ctx.strokeStyle = '#FF0000';
                ctx.lineWidth = 2;
                ctx.font = `bold ${20 * dmgNum.scale}px Arial`;
            } else {
                ctx.fillStyle = '#FFFFFF';
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.font = `bold ${16 * dmgNum.scale}px Arial`;
            }
            
            ctx.strokeText(dmgNum.damage, dmgNum.x, dmgNum.y);
            ctx.fillText(dmgNum.damage, dmgNum.x, dmgNum.y);
        });
        
        ctx.restore();
    }
    
    // トレイルエフェクトを追加
    addTrail(x, y, color = '#FFFF00', size = 3) {
        const trail = {
            x: x,
            y: y,
            color: color,
            size: size,
            life: 1.0
        };
        
        this.trails.push(trail);
        
        // トレイルの数を制限
        if (this.trails.length > 100) {
            this.trails.shift();
        }
    }
    
    // トレイルの更新
    updateTrails(deltaTime) {
        const dt = deltaTime / 16.67;
        
        for (let i = this.trails.length - 1; i >= 0; i--) {
            this.trails[i].life -= 0.05 * dt;
            
            if (this.trails[i].life <= 0) {
                this.trails.splice(i, 1);
            }
        }
    }
    
    // トレイルの描画
    drawTrails(ctx) {
        ctx.save();
        
        this.trails.forEach((trail, index) => {
            ctx.globalAlpha = trail.life * 0.5;
            ctx.fillStyle = trail.color;
            ctx.beginPath();
            ctx.arc(trail.x, trail.y, trail.size * trail.life, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }
    
    // コンボ表示を更新
    updateCombo(count, x, y) {
        this.comboDisplay.count = count;
        this.comboDisplay.timer = 2000; // 2秒表示
        this.comboDisplay.x = x;
        this.comboDisplay.y = y;
        this.comboDisplay.scale = 1.5; // 初期スケール
    }
    
    // コンボ表示の更新
    updateComboDisplay(deltaTime) {
        if (this.comboDisplay.timer > 0) {
            this.comboDisplay.timer -= deltaTime;
            
            // スケールアニメーション
            if (this.comboDisplay.scale > 1.0) {
                this.comboDisplay.scale -= 0.02;
            }
        }
    }
    
    // コンボ表示の描画
    drawCombo(ctx) {
        if (this.comboDisplay.timer > 0 && this.comboDisplay.count > 1) {
            ctx.save();
            
            const alpha = Math.min(1, this.comboDisplay.timer / 500);
            ctx.globalAlpha = alpha;
            
            // コンボ数に応じて色を変更
            let color = '#FFFFFF';
            if (this.comboDisplay.count >= 10) {
                color = '#FFD700'; // ゴールド
            } else if (this.comboDisplay.count >= 5) {
                color = '#00FFFF'; // シアン
            }
            
            ctx.fillStyle = color;
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.font = `bold ${24 * this.comboDisplay.scale}px Arial`;
            ctx.textAlign = 'center';
            
            const text = `${this.comboDisplay.count} COMBO!`;
            ctx.strokeText(text, this.comboDisplay.x, this.comboDisplay.y);
            ctx.fillText(text, this.comboDisplay.x, this.comboDisplay.y);
            
            ctx.restore();
        }
    }
    
    // チェインボーナス表示
    showChainBonus(x, y, bonus) {
        const text = `+${bonus}`;
        const bonusDisplay = {
            x: x,
            y: y,
            damage: text,  // damageプロパティに統一
            life: 1.0,
            vy: -1,
            color: '#00FF00',
            scale: 1.0
        };
        
        this.damageNumbers.push(bonusDisplay);
    }
    
    // すべてのエフェクトを更新
    update(deltaTime) {
        this.updateScreenShake(deltaTime);
        this.updateParticles(deltaTime);
        this.updateDamageNumbers(deltaTime);
        this.updateTrails(deltaTime);
        this.updateComboDisplay(deltaTime);
    }
    
    // すべてのエフェクトを描画
    draw(ctx) {
        // トレイルは最初に描画（背景に近い）
        this.drawTrails(ctx);
        
        // パーティクル
        this.drawParticles(ctx);
        
        // ダメージ数値とコンボ（前面）
        this.drawDamageNumbers(ctx);
        this.drawCombo(ctx);
    }
    
    // クリーンアップ
    cleanup() {
        this.particles = [];
        this.damageNumbers = [];
        this.trails = [];
        this.screenShake.duration = 0;
        this.comboDisplay.timer = 0;
    }
}

export default VisualEffects;