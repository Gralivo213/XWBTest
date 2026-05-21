(function (global) {
    const AssetManager = {
        cache: new Map(), lodCache: new Map(), _onLoadCallbacks: new Map(),
        load(url) {
            if (!url || this.cache.has(url)) return;
            this.cache.set(url, null);
            const img = new Image();
            if (url.startsWith('http')) img.crossOrigin = "Anonymous";
            img.src = url;
            img.onload = () => {
                this.cache.set(url, img);
                const oc = document.createElement('canvas');
                oc.width = Math.max(1, Math.floor(img.width * 0.3)); oc.height = Math.max(1, Math.floor(img.height * 0.3));
                oc.getContext('2d').drawImage(img, 0, 0, oc.width, oc.height);
                this.lodCache.set(url, oc);
                const callbacks = this._onLoadCallbacks.get(url);
                if (callbacks) { this._onLoadCallbacks.delete(url); callbacks.forEach(cb => cb()); }
            };
            img.onerror = () => this.cache.set(url, 'error');
        },
        get(url, useLOD = false) {
            if (useLOD && this.lodCache.has(url)) return this.lodCache.get(url);
            const a = this.cache.get(url);
            if (a === undefined) { this.load(url); return null; }
            return a === 'error' ? null : a;
        },
        whenReady(url, callback) {
            if (!url) return;
            const a = this.cache.get(url);
            if (a && a !== 'error') return callback();
            if (!this.cache.has(url)) this.load(url);
            if (!this._onLoadCallbacks.has(url)) this._onLoadCallbacks.set(url, []);
            this._onLoadCallbacks.get(url).push(callback);
        },
        getTinted(url, tint, useLOD = false) {
            if (!tint || tint === 'none') return this.get(url, useLOD);
            const baseImg = this.get(url, useLOD);
            if (!baseImg || baseImg === 'error') return baseImg;
            const key = `${url}_tint_${tint}${useLOD ? '_lod' : ''}`;
            if (this.cache.has(key)) return this.cache.get(key);

            const iw = baseImg.width || baseImg.naturalWidth, ih = baseImg.height || baseImg.naturalHeight;
            if (!iw) return null;
            const oc = document.createElement('canvas'), octx = oc.getContext('2d');
            oc.width = iw; oc.height = ih;
            octx.drawImage(baseImg, 0, 0);
            octx.globalCompositeOperation = 'source-atop'; octx.fillStyle = tint; octx.fillRect(0, 0, iw, ih);
            octx.globalCompositeOperation = 'multiply'; octx.drawImage(baseImg, 0, 0);

            this.cache.set(key, oc); return oc;
        }
    };

    global.AssetManager = AssetManager;
})(window);
