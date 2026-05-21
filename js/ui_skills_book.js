(function (global) {
    if (!global.IsoGameEngine) {
        console.error("IsoGameEngine not found when loading ui_skills_book.js");
        return;
    }
    const proto = global.IsoGameEngine.prototype;
    const $ = global.$;

    proto.openBook = function (code) {
        const skill = [...(this.skills.active || []), ...(this.skills.passive || [])].find(s => s.code === code);
        if (!skill) return;
        this.currentBook = skill;
        this.currentBookPage = 0;
        this.renderBookPage();
        $('iso-book-modal').classList.add('visible');
    };

    proto.renderBookPage = function () {
        const skill = this.currentBook;
        const container = $('iso-book-pages');
        const prev = $('iso-book-prev');
        const next = $('iso-book-next');

        prev.style.display = this.currentBookPage > 0 ? 'block' : 'none';
        next.style.display = this.currentBookPage < skill.pages.length ? 'block' : 'none';

        if (this.currentBookPage === 0) {
            container.innerHTML = `
                <div class="book-title-page">
                    <div class="book-rank">${skill.rank}</div>
                    <h1>${skill.name}</h1>
                    <div class="book-meta"><span>Type:</span> ${skill.type.toUpperCase()} | <span>Method:</span> ${skill.method.toUpperCase()}</div>
                    <div class="book-req"><span>Requirement:</span> ${skill.req}</div>
                    <div class="book-desc">${skill.description}</div>
                </div>`;
        } else {
            const pageIdx = this.currentBookPage - 1;
            const pageData = skill.pages[pageIdx];

            if (!pageData) {
                container.innerHTML = `<div class="book-page-content blank">Blank Page</div>`;
                return;
            }

            let prog = 0;
            if (pageIdx < skill.progressPageIdx) prog = 100;
            else if (pageIdx === skill.progressPageIdx) prog = skill.progressVal;

            const isLocked = pageData.locked || (pageIdx > 0 && skill.pages[pageIdx - 1] && (pageIdx - 1) >= skill.progressPageIdx && skill.progressVal < 100);

            if (isLocked) {
                container.innerHTML = `
                    <div class="book-page-content locked">
                        <span class="material-symbols-outlined lock-icon">lock</span>
                        <div class="lock-text">Page Locked.<br>Comprehend previous pages to unlock.</div>
                    </div>`;
            } else {
                const reqHtml = pageData.req ? `<div class="book-page-req"><span>Condition:</span> ${pageData.req}</div>` : '';
                container.innerHTML = `
                    <div class="book-page-content">
                        <h2 class="book-page-title">Chapter ${this.currentBookPage}</h2>
                        ${reqHtml}
                        <div class="book-page-text">${pageData.text}</div>
                        ${pageIdx <= skill.progressPageIdx ? `
                        <div class="book-progress-container">
                            <div class="book-progress-bar" style="width: ${prog}%"></div>
                            <div class="book-progress-text">Comprehension: ${prog}%</div>
                        </div>` : ''}
                    </div>`;
            }
        }
    };
})(window);
