// ==================== 虚空坠落 - 特殊怪物/Boss系统 ====================

// ---- 浪人 (Ronin) 精英怪 ----
var ronins = [];
var roninBullets = [];
var roninPending = []; // 1秒预警
var roninSpawnTimer = 0;

// ---- 公牛 (Bull) 精英怪 ----
var bulls = [];
var bullBullets = [];
var bullPending = [];
var bullSpawnTimer = 0;

function fantasySpawn(dt, t) {
    var spawnInterval, maxRonins;
    if (difficulty === 'easy')      { spawnInterval = 60; maxRonins = 2; }
    else if (difficulty === 'hard') { spawnInterval = 20; maxRonins = 8; }
    else                            { spawnInterval = 40; maxRonins = 3; }

    roninSpawnTimer += dt;
    if (roninSpawnTimer >= spawnInterval && ronins.length + roninPending.length < maxRonins) {
        roninSpawnTimer = 0;
        var cw = gameCanvas.width, ch = gameCanvas.height, margin = 80;
        roninPending.push({
            x: margin + Math.random() * (cw - margin * 2),
            y: margin + Math.random() * (ch - margin * 2),
            timer: 1
        });
    }

    // 预警倒计时
    for (var pi = roninPending.length - 1; pi >= 0; pi--) {
        roninPending[pi].timer -= dt;
        if (roninPending[pi].timer <= 0) {
            var pp = roninPending[pi];
            roninPending.splice(pi, 1);
            spawnRoninAt(pp.x, pp.y);
        }
    }

    // ---- 公牛生成 ----
    var bullSpawnInterval, maxBulls;
    if (difficulty === 'easy')      { bullSpawnInterval = 180; maxBulls = 2; }
    else if (difficulty === 'hard') { bullSpawnInterval = 25; maxBulls = 5; }
    else                            { bullSpawnInterval = 120; maxBulls = 4; }

    bullSpawnTimer += dt;
    if (bullSpawnTimer >= bullSpawnInterval && bulls.length + bullPending.length < maxBulls) {
        bullSpawnTimer = 0;
        var cw2 = gameCanvas.width, ch2 = gameCanvas.height, margin2 = 80;
        bullPending.push({
            x: margin2 + Math.random() * (cw2 - margin2 * 2),
            y: margin2 + Math.random() * (ch2 - margin2 * 2),
            timer: 1
        });
    }

    for (var pj = bullPending.length - 1; pj >= 0; pj--) {
        bullPending[pj].timer -= dt;
        if (bullPending[pj].timer <= 0) {
            var bp = bullPending[pj];
            bullPending.splice(pj, 1);
            spawnBullAt(bp.x, bp.y);
        }
    }
}

function spawnRoninAt(x, y) {
    var r = unitSize * 8;
    var newRonin = {
        x: x, y: y, r: r,
        vx: (Math.random() - 0.5) * 80,
        vy: (Math.random() - 0.5) * 80,
        attackTimer: 0,
        colorPhase: 0
    };
    if (typeof frostSlowGlobal !== 'undefined' && frostSlowGlobal > 0) { newRonin.frostSlow = frostSlowGlobal; newRonin.frostSlowAmt = 0.5; }
    ronins.push(newRonin);
}

function spawnRonin() {} // 兼容旧调用

function spawnBullAt(x, y) {
    var r = unitSize * 11;
    var newBull = {
        x: x, y: y, r: r,
        state: 'chasing',
        stateTimer: 0,
        lockX: 0, lockY: 0,
        chargeVx: 0, chargeVy: 0,
        chargeStartX: 0, chargeStartY: 0,
        fireTimer: 0
    };
    if (typeof frostSlowGlobal !== 'undefined' && frostSlowGlobal > 0) { newBull.frostSlow = frostSlowGlobal; newBull.frostSlowAmt = 0.5; }
    bulls.push(newBull);
}

function fireBullBullets(bull) {
    var bulletSpeed = unitSize * 40;
    var bulletR = player.r * 2.1;
    var baseAngle = Math.atan2(bull.chargeVy, bull.chargeVx);
    var spread = Math.PI / 12;
    for (var i = 0; i < 4; i++) {
        var angle = baseAngle + (i - 1.5) * spread;
        bullBullets.push({
            x: bull.x, y: bull.y, r: bulletR,
            vx: Math.cos(angle) * bulletSpeed,
            vy: Math.sin(angle) * bulletSpeed
        });
    }
}

function fantasyUpdate(dt, t) {
    var cw = gameCanvas.width;
    var ch = gameCanvas.height;

    for (var i = 0; i < ronins.length; i++) {
        var rn = ronins[i];

        rn.vx += (Math.random() - 0.5) * 30 * dt;
        rn.vy += (Math.random() - 0.5) * 30 * dt;
        var spd = Math.sqrt(rn.vx * rn.vx + rn.vy * rn.vy);
        if (spd > 480) { rn.vx = rn.vx / spd * 480; rn.vy = rn.vy / spd * 480; }
        var rnSlow = (rn.frostSlow > 0) ? (rn.frostSlowAmt || 0.2) : 1;
        rn.x += rn.vx * rnSlow * dt;
        rn.y += rn.vy * rnSlow * dt;

        if (rn.x < rn.r) { rn.x = rn.r; rn.vx *= -1; }
        if (rn.x > cw - rn.r) { rn.x = cw - rn.r; rn.vx *= -1; }
        if (rn.y < rn.r) { rn.y = rn.r; rn.vy *= -1; }
        if (rn.y > ch - rn.r) { rn.y = ch - rn.r; rn.vy *= -1; }

        // 与普通怪推开
        for (var j = 0; j < holes.length; j++) {
            var h = holes[j];
            var dx = rn.x - h.x, dy = rn.y - h.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            var minDist = rn.r + h.r + 4;
            if (dist < minDist && dist > 0.01) {
                var f = (minDist - dist) / minDist * 60;
                rn.x += dx / dist * f * dt;
                rn.y += dy / dist * f * dt;
                h.x -= dx / dist * f * dt * 0.5;
                h.y -= dy / dist * f * dt * 0.5;
            }
        }

        // 5秒攻击循环：绿(0~1.7s)→黄(1.7~3.3s)→红(3.3~5s)→发射
        rn.attackTimer += dt;
        if (rn.attackTimer >= 5) {
            rn.attackTimer = 0;
            rn.colorPhase = 2;
            fireRoninBullets(rn);
        } else if (rn.attackTimer >= 3.3) { rn.colorPhase = 2; }
        else if (rn.attackTimer >= 1.7) { rn.colorPhase = 1; }
        else { rn.colorPhase = 0; }
    }

    // 子弹移动
    for (var bi = roninBullets.length - 1; bi >= 0; bi--) {
        var b = roninBullets[bi];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.x < 0 || b.x > cw || b.y < 0 || b.y > ch) {
            roninBullets.splice(bi, 1);
        }
    }

    // ---- 公牛更新 ----
    for (var k = 0; k < bulls.length; k++) {
        var bull = bulls[k];

        // 与普通怪推开
        for (var j = 0; j < holes.length; j++) {
            var h = holes[j];
            var bdx = bull.x - h.x, bdy = bull.y - h.y;
            var bdist = Math.sqrt(bdx * bdx + bdy * bdy);
            var bminDist = bull.r + h.r + 4;
            if (bdist < bminDist && bdist > 0.01) {
                var bf = (bminDist - bdist) / bminDist * 60;
                bull.x += bdx / bdist * bf * dt;
                bull.y += bdy / bdist * bf * dt;
                h.x -= bdx / bdist * bf * dt * 0.5;
                h.y -= bdy / bdist * bf * dt * 0.5;
            }
        }

        if (bull.state === 'chasing') {
            var pdx = player.x - bull.x;
            var pdy = player.y - bull.y;
            var bSlow = (bull.frostSlow > 0) ? (bull.frostSlowAmt || 0.2) : 1;
            var pdist = Math.sqrt(pdx * pdx + pdy * pdy);
            if (pdist > 0.01) {
                bull.x += pdx / pdist * 120 * bSlow * dt;
                bull.y += pdy / pdist * 120 * bSlow * dt;
            }
            if (pdist < 150) {
                bull.state = 'locking';
                bull.stateTimer = 0;
                bull.lockX = player.x;
                bull.lockY = player.y;
            }
        } else if (bull.state === 'locking') {
            bull.stateTimer += dt;
            if (bull.stateTimer >= 0.8) {
                bull.state = 'charging';
                bull.stateTimer = 0;
                bull.fireTimer = 0;
                bull.chargeStartX = bull.x;
                bull.chargeStartY = bull.y;
                var cdx = bull.lockX - bull.x;
                var cdy = bull.lockY - bull.y;
                var cdist = Math.sqrt(cdx * cdx + cdy * cdy);
                if (cdist > 0.01) {
                    bull.chargeVx = cdx / cdist * 240;
                    bull.chargeVy = cdy / cdist * 240;
                } else {
                    bull.chargeVx = 0;
                    bull.chargeVy = -240;
                }
            }
        } else if (bull.state === 'charging') {
            var bSlow2 = (bull.frostSlow > 0) ? (bull.frostSlowAmt || 0.2) : 1;
            bull.x += bull.chargeVx * bSlow2 * dt;
            bull.y += bull.chargeVy * bSlow2 * dt;

            bull.fireTimer += dt;
            if (bull.fireTimer >= 0.4) {
                bull.fireTimer -= 0.4;
                fireBullBullets(bull);
            }

            // 撞墙才停
            if (bull.x < bull.r) { bull.x = bull.r; bull.state = 'stunned'; bull.stateTimer = 0; }
            else if (bull.x > cw - bull.r) { bull.x = cw - bull.r; bull.state = 'stunned'; bull.stateTimer = 0; }
            else if (bull.y < bull.r) { bull.y = bull.r; bull.state = 'stunned'; bull.stateTimer = 0; }
            else if (bull.y > ch - bull.r) { bull.y = ch - bull.r; bull.state = 'stunned'; bull.stateTimer = 0; }
        } else if (bull.state === 'stunned') {
            bull.stateTimer += dt;
            if (bull.stateTimer >= 5) {
                bull.state = 'chasing';
                bull.stateTimer = 0;
            }
        }

        // 边界钳制
        if (bull.x < bull.r) bull.x = bull.r;
        if (bull.x > cw - bull.r) bull.x = cw - bull.r;
        if (bull.y < bull.r) bull.y = bull.r;
        if (bull.y > ch - bull.r) bull.y = ch - bull.r;
    }

    // 公牛子弹移动
    for (var bi2 = bullBullets.length - 1; bi2 >= 0; bi2--) {
        var bb = bullBullets[bi2];
        bb.x += bb.vx * dt;
        bb.y += bb.vy * dt;
        if (bb.x < 0 || bb.x > cw || bb.y < 0 || bb.y > ch) {
            bullBullets.splice(bi2, 1);
        }
    }
}

function fireRoninBullets(rn) {
    var bulletSpeed = unitSize * 40;
    var bulletR = player.r * 2.1;
    var dirs = [{ vx: 0, vy: -1 }, { vx: 0, vy: 1 }, { vx: -1, vy: 0 }, { vx: 1, vy: 0 }];
    for (var d = 0; d < dirs.length; d++) {
        roninBullets.push({
            x: rn.x, y: rn.y, r: bulletR,
            vx: dirs[d].vx * bulletSpeed,
            vy: dirs[d].vy * bulletSpeed
        });
    }
}

function fantasyCollision() {
    if (player.invincible || debugInvincible) return;

    // 浪人本体
    for (var i = 0; i < ronins.length; i++) {
        var rn = ronins[i];
        var dx = player.x - rn.x;
        var dy = player.y - rn.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < player.r + rn.r) {
            lastHitSource = 'ronin_body';
            takeDamage();
            if (dist > 0.01) {
                player.x += dx / dist * (player.r + rn.r - dist);
                player.y += dy / dist * (player.r + rn.r - dist);
            }
            break;
        }
    }

    // 子弹
    for (var bi = roninBullets.length - 1; bi >= 0; bi--) {
        var b = roninBullets[bi];
        var bdx = player.x - b.x;
        var bdy = player.y - b.y;
        var bdist = Math.sqrt(bdx * bdx + bdy * bdy);
        if (bdist < player.r * 0.65 + b.r) {
            lastHitSource = 'ronin_bullet';
            takeDamage();
            roninBullets.splice(bi, 1);
            break;
        }
    }

    // 公牛本体
    for (var j = 0; j < bulls.length; j++) {
        var bull = bulls[j];
        var dbx = player.x - bull.x;
        var dby = player.y - bull.y;
        var dbdist = Math.sqrt(dbx * dbx + dby * dby);
        if (dbdist < player.r + bull.r) {
            lastHitSource = 'bull_body';
            takeDamage();
            if (dbdist > 0.01) {
                player.x += dbx / dbdist * (player.r + bull.r - dbdist);
                player.y += dby / dbdist * (player.r + bull.r - dbdist);
            }
            break;
        }
    }

    // 公牛子弹
    for (var bj = bullBullets.length - 1; bj >= 0; bj--) {
        var bb = bullBullets[bj];
        var bbdx = player.x - bb.x;
        var bbdy = player.y - bb.y;
        var bbdist = Math.sqrt(bbdx * bbdx + bbdy * bbdy);
        if (bbdist < player.r * 0.65 + bb.r) {
            lastHitSource = 'bull_bullet';
            takeDamage();
            bullBullets.splice(bj, 1);
            break;
        }
    }
}

function drawRonin(rn) {
    var color;
    if (rn.colorPhase === 0) {
        color = lerpColor('#34d399', '#fbbf24', rn.attackTimer / 1.7);
    } else if (rn.colorPhase === 1) {
        color = lerpColor('#fbbf24', '#ef4444', (rn.attackTimer - 1.7) / 1.6);
    } else {
        color = '#ef4444';
    }

    // 电流光晕（3px 闪电感）
    var flicker = 0.4 + Math.random() * 0.6;
    var auraGlow = ctx.createRadialGradient(rn.x, rn.y, rn.r * 0.8, rn.x, rn.y, rn.r * 1.15);
    auraGlow.addColorStop(0, 'rgba(255,255,100,' + (0.3 * flicker) + ')');
    auraGlow.addColorStop(0.5, 'rgba(255,200,50,' + (0.15 * flicker) + ')');
    auraGlow.addColorStop(1, 'rgba(255,200,50,0)');
    ctx.fillStyle = auraGlow;
    ctx.beginPath();
    ctx.arc(rn.x, rn.y, rn.r * 1.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    var s = rn.r * 0.7;
    ctx.beginPath();
    ctx.moveTo(rn.x, rn.y - s);
    ctx.lineTo(rn.x + s, rn.y);
    ctx.lineTo(rn.x, rn.y + s);
    ctx.lineTo(rn.x - s, rn.y);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#000';
    ctx.font = 'bold ' + (rn.r * 0.6) + 'px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('浪', rn.x, rn.y);
}

function drawRoninBullet(b) {
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawBull(bull) {
    var color;
    if (bull.state === 'chasing') {
        color = '#f97316';
    } else if (bull.state === 'locking') {
        color = lerpColor('#f97316', '#ef4444', Math.min(bull.stateTimer / 0.8, 1));
    } else if (bull.state === 'charging') {
        color = '#ef4444';
    } else {
        color = '#22c55e';
    }

    var flicker = 0.4 + Math.random() * 0.6;
    var auraGlow = ctx.createRadialGradient(bull.x, bull.y, bull.r * 0.8, bull.x, bull.y, bull.r * 1.15);
    auraGlow.addColorStop(0, 'rgba(255,160,50,' + (0.3 * flicker) + ')');
    auraGlow.addColorStop(0.5, 'rgba(255,120,30,' + (0.15 * flicker) + ')');
    auraGlow.addColorStop(1, 'rgba(255,120,30,0)');
    ctx.fillStyle = auraGlow;
    ctx.beginPath();
    ctx.arc(bull.x, bull.y, bull.r * 1.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    var s = bull.r * 0.7;
    ctx.beginPath();
    ctx.moveTo(bull.x, bull.y - s);
    ctx.lineTo(bull.x + s * 0.87, bull.y + s * 0.5);
    ctx.lineTo(bull.x - s * 0.87, bull.y + s * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    if (bull.state === 'charging') {
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bull.x - bull.chargeVx / 240 * 20, bull.y - bull.chargeVy / 240 * 20);
        ctx.lineTo(bull.x - bull.chargeVx / 240 * 50, bull.y - bull.chargeVy / 240 * 50);
        ctx.stroke();
    }

    ctx.fillStyle = '#000';
    ctx.font = 'bold ' + (bull.r * 0.6) + 'px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('牛', bull.x, bull.y);
}

function drawBullBullet(b) {
    var glow = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    glow.addColorStop(0, 'rgba(255,255,255,0.9)');
    glow.addColorStop(0.3, 'rgba(96,165,250,0.8)');
    glow.addColorStop(0.7, 'rgba(59,130,246,0.4)');
    glow.addColorStop(1, 'rgba(30,64,175,0)');
    ctx.fillStyle = glow;
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function fantasyRender() {
    // 浪人预警
    for (var pi = 0; pi < roninPending.length; pi++) {
        var pp = roninPending[pi];
        var bounce = Math.abs(Math.sin(gameTime * 6 + pi)) * 4;
        ctx.fillStyle = 'rgba(168,85,247,' + (0.5 + pp.timer * 0.5) + ')';
        ctx.font = 'bold ' + (40 + bounce) + 'px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(168,85,247,0.8)'; ctx.shadowBlur = 12;
        ctx.fillText('!', pp.x, pp.y - bounce);
        ctx.shadowBlur = 0;
    }
    for (var i = 0; i < ronins.length; i++) { drawRonin(ronins[i]); }
    for (var j = 0; j < roninBullets.length; j++) { drawRoninBullet(roninBullets[j]); }

    // 公牛预警
    for (var qi = 0; qi < bullPending.length; qi++) {
        var bp = bullPending[qi];
        var bounce2 = Math.abs(Math.sin(gameTime * 6 + qi + 100)) * 4;
        ctx.fillStyle = 'rgba(249,115,22,' + (0.5 + bp.timer * 0.5) + ')';
        ctx.font = 'bold ' + (40 + bounce2) + 'px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(249,115,22,0.8)'; ctx.shadowBlur = 12;
        ctx.fillText('▲', bp.x, bp.y - bounce2);
        ctx.shadowBlur = 0;
    }
    for (var k = 0; k < bulls.length; k++) { drawBull(bulls[k]); }
    for (var m = 0; m < bullBullets.length; m++) { drawBullBullet(bullBullets[m]); }
}

function fantasyReset() {
    ronins = [];
    roninBullets = [];
    roninPending = [];
    roninSpawnTimer = 0;
    bulls = [];
    bullBullets = [];
    bullPending = [];
    bullSpawnTimer = 0;
}

function lerpColor(c1, c2, t) {
    t = Math.max(0, Math.min(1, t));
    var r1 = parseInt(c1.slice(1,3),16), g1 = parseInt(c1.slice(3,5),16), b1 = parseInt(c1.slice(5,7),16);
    var r2 = parseInt(c2.slice(1,3),16), g2 = parseInt(c2.slice(3,5),16), b2 = parseInt(c2.slice(5,7),16);
    return 'rgb(' + Math.round(r1+(r2-r1)*t) + ',' + Math.round(g1+(g2-g1)*t) + ',' + Math.round(b1+(b2-b1)*t) + ')';
}
