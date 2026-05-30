// 1. Pagination dots & Slide Scroll Manager
const slides = document.querySelectorAll('.slide');
const dotsContainer = document.getElementById('slideDots');
let currentSlideIndex = 0;

// Generate Pagination Dots
slides.forEach((slide, idx) => {
    const dot = document.createElement('div');
    dot.className = `dot ${idx === 0 ? 'active' : ''}`;
    dot.title = `Page ${idx + 1}`;
    dot.addEventListener('click', () => {
        scrollToSlide(idx);
    });
    dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.dot');

function scrollToSlide(idx) {
    if (idx < 0 || idx >= slides.length) return;
    currentSlideIndex = idx;
    slides[idx].scrollIntoView({ behavior: 'smooth' });
    updateActiveDot(idx);
}

function updateActiveDot(idx) {
    dots.forEach((dot, dIdx) => {
        if (dIdx === idx) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Detect Slide View via IntersectionObserver
const observerOptions = {
    root: null,
    threshold: 0.6
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const idx = Array.from(slides).indexOf(entry.target);
            currentSlideIndex = idx;
            updateActiveDot(idx);
            if (idx === 1) {
                // Redraw lines on entering Page 2 to guarantee perfectly computed math coords
                drawTreeLines();
            }
        }
    });
}, observerOptions);

slides.forEach(slide => observer.observe(slide));

// Keyboard Controls
window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return; // Prevent navigation while typing
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        scrollToSlide(currentSlideIndex + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        scrollToSlide(currentSlideIndex - 1);
    }
});

// Touch Gestures
let touchStartY = 0;
window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;
    if (Math.abs(diff) > 80) {
        if (diff > 0) {
            scrollToSlide(currentSlideIndex + 1);
        } else {
            scrollToSlide(currentSlideIndex - 1);
        }
    }
}, { passive: true });


// 2. PAGE 02: Adaptive Line Render Implementation
function drawTreeLines() {
    const container = document.getElementById('treeContainer');
    const canvas = document.getElementById('treeCanvas');
    canvas.innerHTML = ''; // Reset canvas

    const rect = container.getBoundingClientRect();

    // Connect nodes perfectly by finding exact offset coords
    connectNodes('node-0', 'node-1a', true);
    connectNodes('node-0', 'node-1b', false);
    connectNodes('node-1a', 'node-2a', true);
    connectNodes('node-1a', 'node-2b', false);
    connectNodes('node-1b', 'node-2c', false);
    connectNodes('node-1b', 'node-2d', false);

    function connectNodes(idFrom, idTo, isActive) {
        const nodeFrom = document.getElementById(idFrom);
        const nodeTo = document.getElementById(idTo);
        if (!nodeFrom || !nodeTo) return;

        const rFrom = nodeFrom.getBoundingClientRect();
        const rTo = nodeTo.getBoundingClientRect();

        // Calculate relative starting/ending points
        const x1 = rFrom.right - rect.left;
        const y1 = (rFrom.top + rFrom.bottom) / 2 - rect.top;
        const x2 = rTo.left - rect.left;
        const y2 = (rTo.top + rTo.bottom) / 2 - rect.top;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        if (isActive) {
            line.classList.add('active-link');
        }
        canvas.appendChild(line);
    }
}

// Redraw on screen resize
window.addEventListener('resize', () => {
    if (currentSlideIndex === 1) drawTreeLines();
});


// 3. Page 3: Token Interactive Input Processing
function processTokens() {
    const val = document.getElementById('demoInput').value.trim();
    if(!val) return;

    // Step 1 node update
    document.getElementById('text-input-val').innerText = `"${val}"`;

    // Tokenizer simulation split
    const words = val.split(/\s+/);
    const tokenContainer = document.getElementById('text-token-val');
    tokenContainer.innerHTML = '';
    
    const chipsWrapper = document.createElement('div');
    chipsWrapper.className = 'pipe-val-tokens';

    const vectorList = [];

    words.forEach(word => {
        if (word.length > 5) {
            const p1 = word.slice(0, Math.floor(word.length / 2));
            const p2 = word.slice(Math.floor(word.length / 2));
            
            const chip1 = createTokenChip(p1);
            const chip2 = createTokenChip(`##${p2}`);
            chipsWrapper.appendChild(chip1);
            chipsWrapper.appendChild(chip2);

            vectorList.push(generatePseudoHash(p1));
            vectorList.push(generatePseudoHash(p2));
        } else {
            const chip = createTokenChip(word);
            chipsWrapper.appendChild(chip);
            vectorList.push(generatePseudoHash(word));
        }
    });

    tokenContainer.appendChild(chipsWrapper);

    // Step 3 node update
    document.getElementById('text-vector-val').innerText = `[${vectorList.join(', ')}]`;

    // Active flash animation
    const node2 = document.getElementById('node-2');
    const node3 = document.getElementById('node-3');
    node2.classList.add('highlight');
    node3.classList.add('highlight');
    setTimeout(() => {
        node2.classList.remove('highlight');
        node3.classList.remove('highlight');
    }, 800);
}

function createTokenChip(text) {
    const span = document.createElement('span');
    span.className = 'token-chip';
    span.innerText = text;
    return span;
}

function generatePseudoHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 20000) + 1000;
}


// 4. Page 4: Interactive Prediction Dataset (All English School Life Humors)
const datasets = {
    exam: [
        { token: "C", prob: 75.3 },
        { token: "B", prob: 15.2 },
        { token: "D", prob: 7.5 },
        { token: "A", prob: 2.0 }
    ],
    scholar: [
        { token: "Duke of Zhou (周公)", prob: 82.4 },
        { token: "Confucius (孔子)", prob: 12.1 },
        { token: "Mencius (孟子)", prob: 4.5 },
        { token: "Li Bai (李白)", prob: 1.0 }
    ],
    lie: [
        { token: "\"I didn't study\"", prob: 68.7 },
        { token: "\"I failed so bad\"", prob: 21.3 },
        { token: "\"This exam was hard\"", prob: 8.0 },
        { token: "\"I guessed last part\"", prob: 2.0 }
    ]
};

function switchPrompt(key, btn) {
    const btns = document.querySelectorAll('.prompt-btn');
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    renderChart(key);
}

function renderChart(key) {
    const data = datasets[key];
    const container = document.getElementById('chartContainer');
    container.innerHTML = '';

    data.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = `chart-row ${index === 0 ? 'top-predict' : ''}`;

        const label = document.createElement('div');
        label.className = 'chart-label';
        label.innerText = item.token;

        const barWrapper = document.createElement('div');
        barWrapper.className = 'chart-bar-wrapper';

        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        setTimeout(() => {
            bar.style.width = `${item.prob}%`;
        }, 50);

        const value = document.createElement('span');
        value.className = 'chart-value';
        value.innerText = `${item.prob}%`;

        barWrapper.appendChild(bar);
        row.appendChild(label);
        row.appendChild(barWrapper);
        row.appendChild(value); // Safely positioned in the 3rd column of the grid
        container.appendChild(row);
    });
}

// Initialization
window.onload = function () {
    processTokens();
    renderChart('exam');
    setTimeout(drawTreeLines, 100); // Small timeout to ensure layout width calculations are complete
};