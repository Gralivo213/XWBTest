(function (global) {
    if (!global.IsoGameEngine) return;
    const proto = global.IsoGameEngine.prototype;
    const $ = global.$;
    const stopPropagation = global.stopPropagation;

    proto.setupSkillsUI = function () {
        const pBtn = $('btn-primary-skill');
        const paBtn = $('btn-passive-skill');
        const center = $('skill-content-center');

        const renderSkillUI = (type) => {
            const isPrimary = type === 'primary';
            const crystalColor = isPrimary ? '#3b82f6' : '#10b981';
            const shadowColor = isPrimary ? 'rgba(59, 130, 246, 0.8)' : 'rgba(16, 185, 129, 0.8)';
            const title = isPrimary ? 'Primary Abilities' : 'Passive Traits';
            const skillsList = isPrimary ? (this.skills?.active || []) : (this.skills?.passive || []);

            const gridHtml = `<div style="display:grid; grid-template-columns:repeat(4, 1fr); grid-template-rows:repeat(4, 1fr); gap:10px; padding:15px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); border-radius:8px; height:100%;">${Array(16).fill(0).map((_, i) => {
                const sk = skillsList[i];
                return sk ? `<div class="skill-book-slot filled" data-code="${sk.code}"><div class="skill-book-rank rank-${sk.rank.charAt(0)}">${sk.rank}</div><div class="skill-book-title">${sk.name}</div></div>`
                    : `<div class="skill-book-slot empty" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:4px; aspect-ratio:1; box-shadow:inset 0 0 10px rgba(0,0,0,0.8);"></div>`;
            }).join('')}</div>`;

            const boxesHtml = `<div style="display:flex; flex-direction:column; gap:15px; justify-content:center;">${Array(5).fill('<div style="width:45px; height:45px; background:rgba(0,0,0,0.6); border:1px solid ' + crystalColor + '; border-radius:4px; box-shadow:inset 0 0 10px ' + shadowColor + '"></div>').join('')}</div>`;

            center.innerHTML = `
                <div style="display:flex; width:100%; height:100%; padding:20px; gap:30px; box-sizing:border-box;">
                    <div style="flex:4; display:flex; flex-direction:column; height:100%;">
                        <h3 style="font-family:var(--font-title); color:${crystalColor}; margin:0 0 15px 0; text-align:center; letter-spacing:2px; text-shadow:0 0 10px ${shadowColor};">${title}</h3>
                        ${gridHtml}
                    </div>
                    <div style="flex:6; display:flex; align-items:center; justify-content:center; gap:40px; background:rgba(0,0,0,0.2); border-radius:12px; border:1px solid rgba(255,255,255,0.05); padding:20px;">
                        ${boxesHtml}
                        <div style="position:relative; width:120px; height:200px; display:flex; align-items:center; justify-content:center;">
                            <div style="position:absolute; width:180%; height:180%; background:radial-gradient(circle, ${crystalColor} 0%, transparent 60%); mix-blend-mode:screen; opacity:0.6;"></div>
                            <div style="position:absolute; width:100%; height:100%; box-shadow:0 0 60px 20px ${shadowColor}; border-radius:50%; z-index:1;"></div>
                            <div style="width:70px; height:160px; background:linear-gradient(135deg, #ffffff 0%, ${crystalColor} 50%, #000000 100%); clip-path:polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); box-shadow:inset 0 0 20px #fff; z-index:2; position:relative;">
                                <div style="position:absolute; top:0; left:25%; width:50%; height:100%; background:rgba(255,255,255,0.3); transform:skewX(-20deg);"></div>
                            </div>
                        </div>
                        ${boxesHtml}
                    </div>
                </div>`;

            center.querySelectorAll('.skill-book-slot.filled').forEach(slot => {
                slot.onclick = stopPropagation(() => this.openBook(slot.dataset.code));
            });
        };

        if (pBtn && paBtn && center) {
            pBtn.onclick = stopPropagation(() => renderSkillUI('primary'));
            paBtn.onclick = stopPropagation(() => renderSkillUI('passive'));
        }
    };
})(window);
