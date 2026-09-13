document.addEventListener('DOMContentLoaded', function() {

    // --- 获取需要操作的DOM元素 ---
    const headerContainer = document.querySelector('.header-image-container');
    const progressNav = document.getElementById('progress-nav');
    const progressBar = document.getElementById('progress-bar');
    const topBanner = document.getElementById('top-banner');
    const mainContent = document.getElementById('main-content-area');
    const sections = document.querySelectorAll('.content-module[id^="part"]');
    const navLinks = document.querySelectorAll('#progress-nav a[data-section]');

    // 定义标题淡出的阈值
    const headerFadeEndThreshold = window.innerHeight * 0.7;

    // --- 效果：标题与底图随滚动消失 ---
    function handleHeaderFade() {
        if (!headerContainer) return;
        const scrollY = window.scrollY;
        const opacity = Math.max(0, 1 - (scrollY / headerFadeEndThreshold));
        headerContainer.style.opacity = opacity;
    }

    // --- 效果：在标题消失后显示进度条 ---
    function handleProgressBarVisibility() {
        if (!progressNav) return;
        const scrollY = window.scrollY;
        
        if (scrollY >= headerFadeEndThreshold) {
            progressNav.classList.add('visible');
        } else {
            progressNav.classList.remove('visible');
        }
    }

    // --- 新增：在标题与底图完全淡出后显示顶部细banner ---
    function handleTopBannerVisibility() {
        if (!topBanner) return;
        const scrollY = window.scrollY;
        if (scrollY >= headerFadeEndThreshold) {
            topBanner.classList.add('visible');
        } else {
            topBanner.classList.remove('visible');
        }
    }

    // --- 功能：点击进度条圆点平滑跳转 ---
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // --- 功能：更新阅读进度条和圆点状态 ---
    function updateProgressBar() {
        if (!mainContent || !progressBar) return;

        const contentTop = mainContent.offsetTop;
        const contentHeight = mainContent.offsetHeight;
        const scrollPosition = window.scrollY;
        
        const totalScrollableHeight = contentHeight - window.innerHeight;
        const scrollInContent = Math.max(0, scrollPosition - contentTop);

        let progressPercentage = 0;
        if (scrollInContent > 0 && totalScrollableHeight > 0) {
            progressPercentage = (scrollInContent / totalScrollableHeight) * 100;
        }
        
        progressPercentage = Math.max(0, Math.min(100, progressPercentage));
        progressBar.style.height = progressPercentage + '%';
        
        let currentSectionId = '';
        const activationPoint = scrollPosition + window.innerHeight * 0.25;

        sections.forEach(section => {
            if (activationPoint >= section.offsetTop) {
                currentSectionId = section.id;
            }
        });

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-section') === currentSectionId);
        });
    }

    // --- 原有功能：Part 3 可折叠面板交互 ---
    const trigger = document.querySelector('.collapsible-trigger');
    if (trigger) {
        trigger.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                content.style.paddingTop = "0";
                content.style.paddingBottom = "0";
            } else {
                content.style.maxHeight = content.scrollHeight + 30 + "px";
                content.style.paddingTop = "1px";
                content.style.paddingBottom = "15px";
            }
        });
    }

    // --- 修改：滚动触发的浮现动画（可重复播放） ---
// 进入视口时添加 .visible；离开视口时移除 .visible。
const observerOptions = { root: null, rootMargin: '0px', threshold: 0.2 };
const observerCallback = (entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        } else {
            entry.target.classList.remove('visible'); // 离开视口时移除，确保回滚可重播
        }
    });
};
const animationObserver = new IntersectionObserver(observerCallback, observerOptions);
const animatedElements = document.querySelectorAll('.special-highlight, .finding-item, .part-conclusion');
animatedElements.forEach(el => animationObserver.observe(el));
    
    // ======================================================= //
    // === Part 2 原生嵌入图表交互逻辑 (无修改) === //
    // ======================================================= //
    const chartContainer = document.getElementById('part2-chart');
    if (chartContainer) {
        const toggle = document.getElementById('focusToggle');
        const col2024 = document.getElementById('col-2024');
        const col2025 = document.getElementById('col-2025');
        const k2024 = document.getElementById('korea-2024');
        const k2025 = document.getElementById('korea-2025');
        const o2024 = document.getElementById('other-2024');
        const o2025 = document.getElementById('other-2025');
        const num2024 = document.getElementById('num-2024');
        const num2025 = document.getElementById('num-2025');
        const centerBadge = document.getElementById('center-badge');
        const subBadge = document.getElementById('sub-badge'); 
        
        const svgPoly = document.getElementById('svg-poly');
        const svgLineTop = document.getElementById('svg-line-top');
        const svgLineBottom = document.getElementById('svg-line-bottom');

        function alignVectors() {
            const stage = document.getElementById('chart-stage').getBoundingClientRect();
            if (stage.width === 0) return;
            
            const k2024Rect = k2024.getBoundingClientRect();
            const k2025Rect = k2025.getBoundingClientRect();
            const o2024Rect = o2024.getBoundingClientRect();
            const o2025Rect = o2025.getBoundingClientRect();
            
            const isKoreaFocus = toggle.checked;
            const x1 = k2024Rect.right - stage.left;
            const x2 = k2025Rect.left - stage.left;
            
            let y1Top, y1Bottom, y2Top, y2Bottom, strokeColor, fillColor;

            if (isKoreaFocus) {
                y1Top = k2024Rect.top - stage.top;
                y1Bottom = k2024Rect.bottom - stage.top;
                y2Top = k2025Rect.top - stage.top;
                y2Bottom = k2025Rect.bottom - stage.top;
                strokeColor = '#e43f77';
                fillColor = 'rgba(228, 63, 119, 0.08)';
            } else {
                y1Top = k2024Rect.top - stage.top;
                y1Bottom = o2024Rect.bottom - stage.top;
                y2Top = k2025Rect.top - stage.top;
                y2Bottom = o2025Rect.bottom - stage.top;
                strokeColor = '#9ca3af';
                fillColor = 'rgba(209, 213, 219, 0.3)';
            }

            svgLineTop.setAttribute('x1', x1);
            svgLineTop.setAttribute('y1', y1Top);
            svgLineTop.setAttribute('x2', x2);
            svgLineTop.setAttribute('y2', y2Top);
            svgLineTop.setAttribute('stroke', strokeColor);

            svgLineBottom.setAttribute('x1', x1);
            svgLineBottom.setAttribute('y1', y1Bottom);
            svgLineBottom.setAttribute('x2', x2);
            svgLineBottom.setAttribute('y2', y2Bottom);
            svgLineBottom.setAttribute('stroke', strokeColor);

            svgPoly.setAttribute('points', `${x1},${y1Top} ${x2},${y2Top} ${x2},${y2Bottom} ${x1},${y1Bottom}`);
            svgPoly.setAttribute('fill', fillColor);

            const midX = (x1 + x2) / 2;
            const midY = (y1Top + y1Bottom + y2Top + y2Bottom) / 4;
            
            centerBadge.style.left = `${midX}px`;
            centerBadge.style.top = `${midY}px`;
            
            subBadge.style.left = `${midX}px`;
            subBadge.style.top = `${midY + 22}px`; 
        }

        function animateSVG() {
            let start = null;
            function step(timestamp) {
                if (!start) start = timestamp;
                let progress = timestamp - start;
                alignVectors();
                if (progress < 450) { 
                    window.requestAnimationFrame(step);
                }
            }
            window.requestAnimationFrame(step);
        }

        function updateChartState(isActive) {
            if (isActive) {
                col2024.style.height = '36.83%'; 
                col2025.style.height = '75%';
                k2024.style.height = '100%';
                k2025.style.height = '100%';
                o2024.style.height = '0%';
                o2025.style.height = '0%';
                o2024.style.opacity = '0';
                o2025.style.opacity = '0';
                num2024.innerText = '44.65万';
                num2024.style.color = '#e43f77';
                num2025.innerText = '90.91万';
                num2025.style.color = '#e43f77';
                centerBadge.innerText = '+103.61%';
                centerBadge.style.color = '#e43f77';
                centerBadge.style.borderColor = '#e43f77';
                subBadge.innerText = '客源国Top 1';
                subBadge.style.color = '#e43f77';
                subBadge.style.opacity = '1';
            } else {
                col2024.style.height = '50%'; 
                col2025.style.height = '75%';
                k2024.style.height = '9.38%';
                k2025.style.height = '12.73%';
                o2024.style.height = '90.62%';
                o2025.style.height = '87.27%';
                o2024.style.opacity = '1';
                o2025.style.opacity = '1';
                num2024.innerText = '475.91万';
                num2024.style.color = '#111827';
                num2025.innerText = '713.87万';
                num2025.style.color = '#111827';
                centerBadge.innerText = '+50.00%';
                centerBadge.style.color = '#6b7280';
                centerBadge.style.borderColor = '#9ca3af';
                subBadge.innerText = '所有外国游客';
                subBadge.style.color = '#6b7280';
                subBadge.style.opacity = '1';
            }
            animateSVG();
        }

        toggle.addEventListener('change', function() {
            updateChartState(this.checked);
        });
        
        const resizeObserver = new ResizeObserver(() => alignVectors());
        resizeObserver.observe(document.getElementById('chart-stage'));

        updateChartState(toggle.checked);
    }
  
    
    // --- 统一的事件监听 ---
    function onScroll() {
        handleHeaderFade();
        handleProgressBarVisibility();
        handleTopBannerVisibility();
        updateProgressBar();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('load', () => {
        onScroll(); // 页面加载时执行一次，确保初始状态正确
        if (chartContainer) {
            setTimeout(() => {
                // 触发一次矢量对齐，避免初始抖动
                const chartStage = document.getElementById('chart-stage');
                if (chartStage) {
                    const evt = new Event('resize');
                    window.dispatchEvent(evt);
                }
            }, 50);
        }
    });
    window.addEventListener('resize', onScroll);
});