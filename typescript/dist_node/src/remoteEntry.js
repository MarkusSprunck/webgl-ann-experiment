"use strict";
async function fetchModel() {
    const res = await fetch('/api/model');
    if (!res.ok)
        throw new Error('fetch model failed');
    return res.text();
}
async function start() {
    try {
        const model = await fetchModel();
        if (typeof window.renderData === 'function') {
            window.renderData(model);
        }
        else {
            console.warn('renderer function not found');
        }
    }
    catch (e) {
        console.error(e);
    }
}
if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', start);
else
    start();
