(function (global) {
    if (!global.IsoGameEngine) {
        console.error("IsoGameEngine not found when loading ui_relations_graph_core.js");
        return;
    }
    const proto = global.IsoGameEngine.prototype;
    const $ = global.$;

    proto.renderRelationsGraph = function () {
        const popup = $('iso-relations-popup');
        if (!popup || popup.style.display === 'none') return;

        const graphArea = $('relations-graph-area');
        const svg = $('relations-svg-lines');
        const nodesWrap = $('relations-nodes-wrap');
        if (!graphArea || !svg || !nodesWrap) return;

        svg.innerHTML = '';
        nodesWrap.innerHTML = '';

        const prevParticles = graphArea.querySelectorAll('.qi-particle');
        prevParticles.forEach(p => p.remove());
        for (let k = 0; k < 18; k++) {
            const particle = document.createElement('div');
            particle.className = 'qi-particle';
            particle.style.left = `${5 + Math.random() * 90}%`;
            particle.style.top = `${10 + Math.random() * 80}%`;
            particle.style.animationDelay = `${Math.random() * 6}s`;
            particle.style.animationDuration = `${6 + Math.random() * 6}s`;
            graphArea.appendChild(particle);
        }

        const rect = graphArea.getBoundingClientRect();
        const W = rect.width || window.innerWidth * 0.9;
        const H = rect.height || window.innerHeight * 0.85 - 60;
        const cx = W / 2, cy = H / 2;

        nodesWrap.insertAdjacentHTML('beforeend', `
            <div class="wuxia-bagua-bg">
                <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
                    <circle cx="50" cy="50" r="48" fill="#080a0e" stroke="var(--gold-primary)" stroke-width="1.5" />
                    <path d="M 50 2 A 48 48 0 0 1 50 98 A 24 24 0 0 1 50 50 A 24 24 0 0 0 50 2 Z" fill="rgba(251, 191, 36, 0.85)" />
                    <circle cx="50" cy="26" r="7" fill="rgba(251, 191, 36, 0.85)" />
                    <circle cx="50" cy="74" r="7" fill="#080a0e" />
                    <circle cx="50" cy="26" r="2.5" fill="#080a0e" />
                    <circle cx="50" cy="74" r="2.5" fill="rgba(251, 191, 36, 0.85)" />
                </svg>
            </div>
            <div class="wuxia-bagua-outer"></div>
            <div class="player-center-node" style="position:absolute; left: ${cx}px; top: ${cy}px; transform: translate(-50%, -50%); z-index: 10; display:flex; flex-direction:column; align-items:center;">
                <div style="position:relative; width: 84px; height: 84px; display:flex; justify-content:center; align-items:center;">
                    <div style="position:absolute; width: 100%; height: 100%; border: 2.5px solid var(--gold-primary); border-radius: 50%; box-shadow: 0 0 30px var(--gold-glow), inset 0 0 15px var(--gold-glow); animation: border-pulse 5s infinite ease-in-out;"></div>
                    <div style="width: 70px; height: 70px; border: 1.5px solid var(--gold-dark); border-radius: 50%; background: #07090d; display:flex; justify-content:center; align-items:center; overflow:hidden; z-index: 10;">
                        <img src="imh/P1.png" style="width:78%; height:78%; object-fit:contain; filter:drop-shadow(0 0 10px var(--gold-primary));">
                    </div>
                </div>
                <div style="margin-top: 12px; padding: 4px 16px; background: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(10,12,18,0.95) 20%, rgba(10,12,18,0.95) 80%, rgba(0,0,0,0) 100%); border-left: 2px solid var(--gold-primary); border-right: 2px solid var(--gold-primary); color: #fff; font-family: var(--font-title); font-size: 15px; font-weight: bold; letter-spacing: 2px; text-shadow: 0 0 8px var(--gold-glow); white-space:nowrap;">
                    ${this.playerName || "Wandering Cultivator"}
                </div>
            </div>`);

        if (typeof this.drawRelationsNodes === 'function') {
            this.drawRelationsNodes(svg, nodesWrap, cx, cy, W, H);
        }
    };
})(window);
