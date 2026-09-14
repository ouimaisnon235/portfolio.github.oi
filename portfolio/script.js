/* ============================================
   个人主页交互脚本
   功能：抽屉导航 · Scroll Spy · 平滑滚动
         阅读进度条 · 回顶按钮 · 走马灯
         IntersectionObserver 入场动画
   ============================================ */

(function () {
    'use strict';

    /* ====== 0. 工具函数 ====== */

    const $ = (selector, ctx) => (ctx || document).querySelector(selector);
    const $$ = (selector, ctx) => Array.from((ctx || document).querySelectorAll(selector));
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ====== 0.5 紫色圆点光标 ====== */

    const cursorDot = $('#cursorDot');
    const cursorRing = $('#cursorRing');

    if (cursorDot && cursorRing && !prefersReducedMotion &&
        window.matchMedia('(min-width: 769px) and (hover: hover)').matches) {
        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        });

        // Ring 用 lerp 平滑跟随
        function animateRing() {
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top = ringY + 'px';
            requestAnimationFrame(animateRing);
        }
        animateRing();

        // 悬停可交互元素
        const hoverables = $$('a, button, .skill-tag, .carousel-card, .award-item, .program-image-link, .contact-link, .nav-link, .drawer-link, .dropdown-link, .hero-cta, .carousel-btn, .back-to-top, .table-btn, .hamburger, .drawer-close');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorDot.classList.add('hovering');
                cursorRing.classList.add('hovering');
            });
            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('hovering');
                cursorRing.classList.remove('hovering');
            });
        });

        // 点击时光标缩放
        document.addEventListener('mousedown', () => {
            cursorRing.style.transform = 'translate(-50%, -50%) scale(0.8)';
        });
        document.addEventListener('mouseup', () => {
            cursorRing.style.transform = 'translate(-50%, -50%) scale(1)';
        });

        // 离开窗口时隐藏
        document.addEventListener('mouseleave', () => {
            cursorDot.style.opacity = '0';
            cursorRing.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            cursorDot.style.opacity = '1';
            cursorRing.style.opacity = '';
        });
    }

    /* ====== 1. 顶部导航 - 滚动阴影 ====== */

    const navbar = $('#navbar');

    function handleNavScroll() {
        if (window.scrollY > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    /* ====== 2. Table 目录下拉 ====== */

    const tableBtn = $('#tableBtn');
    const tableDropdown = $('#tableDropdown');

    if (tableBtn && tableDropdown) {
        tableBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = tableDropdown.classList.toggle('open');
            tableBtn.setAttribute('aria-expanded', isOpen);
            tableDropdown.setAttribute('aria-hidden', !isOpen);
        });

        document.addEventListener('click', (e) => {
            if (!tableDropdown.contains(e.target) && e.target !== tableBtn) {
                tableDropdown.classList.remove('open');
                tableBtn.setAttribute('aria-expanded', 'false');
                tableDropdown.setAttribute('aria-hidden', 'true');
            }
        });

        // 点击下拉项后关闭
        $$('.dropdown-link', tableDropdown).forEach(link => {
            link.addEventListener('click', () => {
                tableDropdown.classList.remove('open');
                tableBtn.setAttribute('aria-expanded', 'false');
                tableDropdown.setAttribute('aria-hidden', 'true');
            });
        });
    }

    /* ====== 3. 移动端抽屉导航 ====== */

    const hamburger = $('#hamburger');
    const drawer = $('#drawer');
    const drawerOverlay = $('#drawerOverlay');
    const drawerClose = $('#drawerClose');

    function openDrawer() {
        if (!drawer) return;
        drawer.classList.add('open');
        drawerOverlay.classList.add('open');
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        drawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        if (!drawer) return;
        drawer.classList.remove('open');
        drawerOverlay.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        drawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    if (hamburger) {
        hamburger.addEventListener('click', openDrawer);
    }
    if (drawerClose) {
        drawerClose.addEventListener('click', closeDrawer);
    }
    if (drawerOverlay) {
        drawerOverlay.addEventListener('click', closeDrawer);
    }

    // 点击抽屉链接后关闭
    $$('.drawer-link').forEach(link => {
        link.addEventListener('click', closeDrawer);
    });

    // ESC 关闭抽屉
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
            closeDrawer();
        }
    });

    /* ====== 4. 平滑滚动 + Hash 更新 ====== */

    // 所有带 data-nav 的链接
    const navLinks = $$('[data-nav]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (!targetId || !targetId.startsWith('#')) return;

            const target = $(targetId);
            if (!target) return;

            e.preventDefault();
            const navHeight = navbar.offsetHeight;
            const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

            if (prefersReducedMotion) {
                window.scrollTo(0, targetTop);
            } else {
                window.scrollTo({ top: targetTop, behavior: 'smooth' });
            }

            // 更新 URL hash
            history.replaceState(null, '', targetId);
        });
    });

    /* ====== 5. Scroll Spy - 高亮当前导航项 ====== */

    const sections = $$('section[id]');
    const allNavLinks = $$('.nav-link, .drawer-link, .dropdown-link');

    function handleScrollSpy() {
        const navHeight = navbar.offsetHeight;
        const scrollPos = window.scrollY + navHeight + 80;
        let currentId = '';

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;

            if (scrollPos >= top && scrollPos < bottom) {
                currentId = section.id;
                break;
            }

            // 如果滚过最后一个 section，高亮最后一个
            if (i === sections.length - 1 && scrollPos >= top) {
                currentId = section.id;
            }
        }

        // 如果在页面顶部，高亮首页
        if (window.scrollY < 100) {
            currentId = 'home';
        }

        if (currentId) {
            allNavLinks.forEach(link => {
                const isActive = link.getAttribute('data-nav') === currentId;
                link.classList.toggle('active', isActive);
            });
        }
    }

    /* ====== 6. 阅读进度条 + 回顶按钮 ====== */

    const progressContainer = $('#progressContainer');
    const progressBar = $('#progressBar');
    const progressText = $('#progressText');
    const backToTop = $('#backToTop');

    function handleProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(100, Math.round((scrollTop / docHeight) * 100)) : 0;

        // 进度条
        if (progressBar) {
            progressBar.style.height = progress + '%';
        }
        if (progressText) {
            progressText.textContent = progress + '%';
        }

        // 滚动一定距离后显示进度条和回顶按钮
        const showThreshold = 300;
        if (scrollTop > showThreshold) {
            progressContainer && progressContainer.classList.add('visible');
            backToTop && backToTop.classList.add('visible');
        } else {
            progressContainer && progressContainer.classList.remove('visible');
            backToTop && backToTop.classList.remove('visible');
        }
    }

    // 回顶按钮
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            if (prefersReducedMotion) {
                window.scrollTo(0, 0);
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    /* ====== 7. 滚动事件合并 ====== */

    let ticking = false;

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleNavScroll();
                handleScrollSpy();
                handleProgress();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', handleScrollSpy, { passive: true });

    // 初始化
    handleNavScroll();
    handleScrollSpy();
    handleProgress();

    /* ====== 8. IntersectionObserver - 入场动画 ====== */

    const animatedElements = $$(
        '.stacked-card, .timeline-item, .internship-card, .program-card, .campus-card, ' +
        '.section-header, .skills-group, .works-section, .awards-block, .contact-links'
    );

    if ('IntersectionObserver' in window && !prefersReducedMotion) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                } else {
                    // 离开视口时移除动画类，下次进入可重新播放
                    entry.target.classList.remove('animate-in');
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    } else {
        animatedElements.forEach(el => el.classList.add('animate-in'));
    }

    /* ====== 9. 走马灯 - 自动滚动 + 悬停暂停 ====== */

    const carousels = $$('.carousel');

    carousels.forEach(carousel => {
        const track = $('.carousel-track', carousel);
        if (!track) return;

        let scrollTimer = null;
        let isPaused = false;
        const scrollSpeed = 0.5; // px per frame
        const originalItems = Array.from(track.children);

        // 复制一份原内容。滚动跨过第一个周期时回退一个周期，视觉上头尾连续。
        originalItems.forEach(item => {
            const duplicate = item.cloneNode(true);
            duplicate.setAttribute('aria-hidden', 'true');
            duplicate.querySelectorAll('a, button, input, select, textarea').forEach(element => {
                element.tabIndex = -1;
            });
            track.appendChild(duplicate);
        });

        function getCycleWidth() {
            const firstDuplicate = track.children[originalItems.length];
            return firstDuplicate ? firstDuplicate.offsetLeft - track.children[0].offsetLeft : 0;
        }

        function normalizeScrollPosition() {
            const cycleWidth = getCycleWidth();
            if (cycleWidth > 0 && track.scrollLeft >= cycleWidth) {
                track.scrollLeft -= cycleWidth;
            }
        }

        // 自动滚动
        function autoScroll() {
            if (isPaused) return;
            track.scrollLeft += scrollSpeed;
            normalizeScrollPosition();
        }

        function startAutoScroll() {
            if (prefersReducedMotion) return;
            if (scrollTimer) return;
            scrollTimer = setInterval(autoScroll, 30);
        }

        function stopAutoScroll() {
            if (scrollTimer) {
                clearInterval(scrollTimer);
                scrollTimer = null;
            }
        }

        // 鼠标悬停暂停
        carousel.addEventListener('mouseenter', () => {
            isPaused = true;
        });

        carousel.addEventListener('mouseleave', () => {
            isPaused = false;
        });

        // 设计作品悬停时，以视口 80% 的最大尺寸居中预览。
        if (carousel.classList.contains('design-gallery')) {
            const preview = $('.design-preview img', carousel);
            const designItems = $$('.design-gallery-item', carousel);
            designItems.forEach(item => {
                const image = $('img', item);
                if (!image || !preview) return;
                item.addEventListener('mouseenter', () => {
                    preview.src = image.currentSrc || image.src;
                    preview.alt = image.alt;
                    carousel.classList.add('is-previewing');
                });
                item.addEventListener('mouseleave', () => {
                    carousel.classList.remove('is-previewing');
                });
            });
        }

        // 触摸支持
        carousel.addEventListener('touchstart', () => {
            isPaused = true;
        }, { passive: true });

        carousel.addEventListener('touchend', () => {
            isPaused = false;
        }, { passive: true });

        // 左右按钮
        const prevBtn = $('.carousel-prev', carousel);
        const nextBtn = $('.carousel-next', carousel);

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const scrollAmount = track.clientWidth * 0.8;
                track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const scrollAmount = track.clientWidth * 0.8;
                track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });
        }

        // 键盘控制
        carousel.setAttribute('tabindex', '0');
        carousel.addEventListener('keydown', (e) => {
            const scrollAmount = track.clientWidth * 0.8;
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        });

        track.addEventListener('scroll', () => {
            if (!isPaused) normalizeScrollPosition();
        }, { passive: true });

        // 启动自动滚动
        startAutoScroll();
    });

    /* ====== 10. 页面语言切换 ====== */

    const languageSwitch = $('#languageSwitch');
    const navigationLabels = {
        about: 'About Me',
        education: 'Education',
        internship: 'Internship',
        programs: 'Programs',
        campus: 'Campus',
        skills: '🙋Skills & Works',
        contact: 'Contact'
    };
    const navigationMarkup = new Map();
    const navigationItems = $$('[data-nav]').filter(item => navigationLabels[item.dataset.nav]);
    navigationItems.forEach(item => navigationMarkup.set(item, item.innerHTML));

    // 附件未收录的细项保留中文原文，确保不出现占位符。
    const englishTranslations = {
        '你好，欢迎来到': 'Hello, welcome to',
        '蔡依莹的个人主页': "CAI Yiying's Portfolio",
        '公共管理学 · 传播学 · 法语语言文学': 'Public Administration · Communication · French',
        '2027届硕士研究生，专注于': 'Master’s candidate, Class of 2027, focused on ',
        '教育政策研究': 'education policy research',
        '、数据可视化': ', data visualization',
        '与': ' and ',
        '内容传播': 'content communication',
        '。具有跨学科背景与丰富的项目管理、内容制作与数据分析经验。': '. With an interdisciplinary background and extensive experience in project management, content production, and data analysis.',
        '关于我': 'About Me',
        '项目与活动管理': 'Program & Campaign',
        '内容制作与传播': 'Content Communication',
        '数据洞察与可视化': 'Data Visualization',
        '学术与政策研究': 'Research Experience',
        '教育经历': 'Education',
        '上海外国语大学': 'Shanghai International Studies University',
        '外国语言文学 · 法语专业 · 本科': 'Bachelor of Arts in French',
        '中国海洋大学': 'Ocean University of China',
        '公共管理学 · 教育经济与管理 · 硕士': 'Master of Public Administration (academic), major in Educational Economics and Management',
        '香港浸会大学*': 'Hong Kong Baptist University*',
        '传播学（Communication）· 文学硕士（MA）': 'Master of Arts in Communication',
        '*注：香港浸会大学为硕士阶段双学位项目': '*Note: Hong Kong Baptist University is a dual-degree master’s program.',
        '传播学QS48':'Communication QS48',
        '实习经历': 'Internship',
        '主要职责': 'Key Responsibilities',
        '数据维护 / 工单处理 / 秋招协助 / 团建落地': 'Data maintenance / Service request processing / Autumn campus recruitment support / Team-building event',
        '跨机构活动与接待 / 公共活动支持 / 宣传物料制作': 'Cross-institutional events and reception / Public programs support / Promotional materials production',
        '培训看板维护 / 培训活动落地 / 宣传物料制作': 'Training dashboard maintenance / Training program delivery / Promotional materials production',
        '实践项目': 'Projects',
        '香港浸会大学传理学院数字媒体创意方案设计项目': 'HKBU School of Communication Digital Media Creative Project',
        '数据可视化与数据新闻项目': 'Data Visualization & Data Journalism Project',
        '立邦「为爱上色」中国大学生农村支教项目': 'Nippon Paint “Colourful Way of Love” Rural Education Support',
        '大学生网络受骗风险防范意识现状与应对策略': 'Undergraduates’ Awareness and Countermeasures for Online Fraud',
        '国外新冠自主治疗咨询平台研究与国内平台建设推广': 'Comparative Study of Overseas COVID Self-Care Consultation Platforms and Recommendations for Domestic Platform Development',
        '数字媒体': 'Digital Media',
        '数据新闻': 'Data Journalism',
        '公益支教': 'Educational Volunteer',
        '调研报告': 'Research Report',
        '校园经历': 'Campus',
        '学生秘书': 'Student Assistant',
        '团委副书记': 'Presidium Member',
        '宣传部': '',
        '团支部书记': 'Youth League Branch Secretary',
        '学生阶段所获奖项': 'Awards & Honors',
        '技能与作品': 'Skills & Works',
        '技能': 'Skills',
        '语言': 'Languages',
        '媒体技能': 'Media Skills',
        '数据分析与可视化': 'Data Analysis & Visualization',
        '常用AI工具': 'Common AI Tools',
        '公众号图文': 'WeChat Articles Layouts & Illustrations',
        '视频剪辑': 'Video Editing',
        '部分视觉与平面设计（非商用）': 'Selected Visual & Graphic Design (Non-commercial)',
        '点击卡片打开链接 · 查看详情': 'Click to open the link · View details',
        '鼠标悬停 · 查看详情': 'Hover to preview',
        '点击图片查看更多': 'Click the image to view more',
        '联系我': 'Contact',
        '邮箱': 'Email',
        'CV（中文）PDF': 'CV (Chinese) PDF',
        'CV（英文）PDF': 'CV (English) PDF',
        '导航': 'Navigation',
        '昕诺飞（中国）投资有限公司': 'Signify (China) Investment Co., Ltd.',
        '徐家汇书院（徐汇区图书馆）': 'Xujiahui Academy (Xuhui District Library)',
        '菲仕兰食品贸易（上海）有限公司': 'FrieslandCampina (Shanghai) Trading Co., Ltd.',
        'HR Services 实习生 — 支持亚太区人事数据管理、校园招聘、团队建设及基础人事运维等日常HR工作。': 'HR Services Intern — Supported APAC HR data management, campus recruitment, team-building, and daily HR operations.',
        '公共事业部 — 主任助理，协助开展对外合作、政社接待及公共活动落地工作。': 'Public Affairs Division Assistant, supporting external partnerships, institutional reception, and public-program delivery.',
        'Learning & Development Intern — 负责员工培训数据可视化搭建与维护、新员工入职及管培生项目落地。': 'Learning & Development Intern — Built and maintained employee-training dashboards and supported onboarding and management-trainee programs.',
        '山东省与美国交流合作研究中心': 'Research Centre for Shandong–American Exchanges and Cooperation',
        '上海外国语大学法语系': 'School of French and Francophone Studies, SISU',
        '上海外国语大学团委学生会SYM工作室': 'SYM Studio, SISU Youth League & Student Union',
        '上海外国语大学法语系2020级本科四班': 'SISU School of French and Francophone Studies, Class of 2020, Class 4',
        '副组长': 'Deputy Lead',
        '主席团成员': 'Presidium Member',
        '宣传部设计组副组长': 'Deputy Lead, Design Group',
        'Memento MR概念展示': 'Memento MR Concept Showcase',
        '免签政策数据新闻网页': 'Visa-Free Policy Data News Website',
        '中国海洋大学2024级3年制研究生学习奖学金': 'Ocean University of China Performance Scholarship for Three-year Master’s Students',
        '第四届全球视野中的教育政策论坛主题汇报三等奖': 'Third Prize, The 4th Education Policy Forum in a Global Perspective',
        '2023年上海市青少年模拟政协提案"最具潜力模拟提案"': 'Most Promising Youth Proposal, Shanghai Youth Model Committee, 2023',
        '2023年徐汇区青少年优秀模拟政协提案': 'Excellent Youth Proposal, Xuhui District, 2023',
        '上海外国语大学冬季"致远计划"社会实践大赛三等奖': 'Third Prize, SISU Winter “Zhiyuan Program” Social Practice Competition',
        '上海外国语大学2021-2022学年"优秀学生"': 'SISU “Outstanding Student,” Academic Year 2021–2022',
        '上海外国语大学2022-2023学年"优秀学生干部"': 'SISU “Outstanding Student Cadre,” Academic Year 2022–2023',
        '上海外国语大学优秀学生奖学金二等奖': 'SISU Outstanding Student Scholarship, Second Prize',
        '上海外国语大学优秀学生奖学金三等奖': 'SISU Outstanding Student Scholarship, Third Prize',
        '多次': 'Multiple awards',
        '上海外国语大学法语系团委学生会明星部长': 'Star Section Head, School of French and Francophone Studies Youth League & Student Union',
        '作为法语系团委学生会主席团成员，负责': 'As a Presidium member of the Student Union of the School of French and Francophone Studies at SISU, I undertook and led ',
        '年度项目群统筹': 'a series of several main programs',
        '。一年内接连落地迎新、校地共建、毕业季等多类活动。任职期间系团委获评"2022年度上海市基层团组织典型选树团委"。': ' within one year, including Orientation, University–Local Community cooperation, and Graduation Season activities. During my term, the department’s Youth League Committee was recognized as a 2022 Shanghai model grassroots youth organization.',
        '作为研究中心学生秘书，参与2次学术会议、3次讲座/论坛的': 'As a student secretary at a research center, I supported two academic conferences and three lectures/forums, covering ',
        '审批、手册、接待、现场支持与新闻稿工作': 'approval procedures, conference handbooks, guest reception, on-site coordination, and post-event news release',
        '。': '.',
        '实习期间，曾参与': 'During HR internships, I supported ',
        '秋招线上直播支持': 'autumn campus recruitment live streams',
        '，负责设备检查、场地布置与应急处理；负责部门员工团建活动的策划与落地。': ', handling equipment checks, venue setup, and standby support. I also planned and delivered employee team-building activities.',
        '具有': 'I have ',
        '国际会议与展会接待经验': 'hands-on experience with international conferences and exhibitions',
        '，具有丰富跨文化沟通与现场协作经验。': ', along with fruitful cross-cultural communication and on-site coordination experience.',
        '运营上外法语系两个官方公众号，负责': 'Managed two official WeChat public accounts for the School of French and Francophone Studies (SISU), responsible for ',
        '选题安排、素材组织与审核发布': 'topic planning, editorial review, and publishing',
        '，形成"活动－内容－素材库"的工作流程闭环。': ', establishing an end-to-end workflow linking events, content, and asset libraries.',
        '公众号排版与平面设计经验': 'WeChat layout and graphic design experience',
        '，为学校团委学生会主要公众号进行推送排版及插图制作、各类讲座及校园活动进行宣传物料制作。': ', producing layouts and illustrations for the university’s two main Student Union WeChat accounts, and designing promotional materials for lectures and campus events. I also create non-commercial visual design work in my spare time.',
        '视频策划与剪辑经验': 'video planning and editing experience',
        '。独立承担3条长视频全程剪辑、1条合作剪辑视频，参与毕业季视频策划、拍摄统筹、脚本与剪辑。': '. While serving in the Student Union, I independently edited 3 long-form videos and co-edited 1 collaborative video, and contributed to graduation-season video planning, production coordination, scripting, and editing.',
        '香港学习期间参与': 'While studying in Hong Kong, I took part in ',
        '数字媒体创意方案项目': 'the digital media creative project “Memento”',
        '，结合AI视频生成工具Seedance、Kling与剪映，制作概念视频。': ', combining Seedance, Kling, and CapCut to produce a concept video that integrates technology with emotive storytelling.',
        '在立邦"为爱上色"支教项目宣传组中，产出多轮图文与短视频内容，覆盖公众号、微博、美篇等平台。': 'As part of the publicity team for Nippon Paint’s “Colourful Way of Love” rural education support project, I produced multiple rounds of graphic and short-video content across WeChat, Weibo, and Meipian.',
        '实习期间': 'During my internship, I ',
        '维护与迭代HR培训可视化Dashboard': 'maintained and iterated HR training dashboards in Power BI',
        '，确保每周五准时更新。用Excel的VLOOKUP与数据透视表整理多源数据，标准化各类数据；在Power BI中进行看板维护。': ', ensuring updates every Friday. I used Excel (VLOOKUP and pivot tables) to organize multi-source data and standardize data formats.',
        '实习期间维护HR数据系统，负责月度考勤/薪酬福利登记核对，参与HR工单派单。': 'I maintained HR data systems by reconciling monthly attendance and payroll/benefits records, and supported HR ticket dispatch and tracking.',
        '数据新闻课程项目': 'a data journalism course project',
        '，围绕免签政策的可视化故事，负责数据收集、数据标准化、图表设计、网页搭建。': ' that built a visual narrative on China’s visa-free policy, covering data collection, standardization, chart design, and web deployment.',
        '硕士阶段研究方向为': 'My master’s research focuses on ',
        'AI教育政策、高等教育国际化': 'AI education policy and the internationalization of higher education',
        '，现有2篇论文已于学术会议汇报发表，3篇待发表。': '; two research papers have been presented at academic conferences, with three yet to be published.',
        '掌握': 'I have experience in ',
        '政策文本分析、半结构化访谈、质性文本编码': 'policy text analysis, semi-structured interviews, qualitative coding, thematic analysis, social network analysis, and comparative research',
        '等研究方法，具备扎实的学术研究基础。': ' methods, supported by a solid foundation in academic research.',
        '协助学术研究辅助、国际学术活动统筹执行、日常行政运维、财务报销与经费管理，保障科研推进与学术活动高效有序开展。': 'Supported academic research, coordinated and delivered international academic events, and handled daily administration, reimbursements, and budget management to ensure efficient research and event operations.',
        '分管系团学部、宣传部两个部门，统筹负责全系团学活动策划、新媒体运营、校地共建及学生会主要活动落地。': 'Led student-affairs and publicity teams, coordinated student-activity planning, managed new-media operations, advanced university–community partnerships, and delivered major Student Union events.',
        '负责校级团委学生会宣传工作，承担官方公众号视觉排版、宣传物料设计、插画制作，统筹组员工作分配。': 'Delivered visual layouts for official Student Union WeChat accounts, designed promotional materials and illustrations, and assigned work across the design team.',
        '聚焦中外新冠自主诊疗服务平台发展差异，开展多平台对比调研，为国内医疗自助服务平台优化提供参考。负责筛选美国、爱尔兰、法国等5个国外平台及4个国内新冠自查服务平台，系统性搜集各平台基础信息、运营模式、内容设计及服务功能；整合多维度数据完成对比分析。': 'Investigated differences between domestic and international COVID-19 self-care consultation platforms to inform the optimization of domestic platforms. Selected five overseas platforms (from the US, Ireland, France, and other countries) and four domestic platforms, systematically collected data on their operating models, content, and service functions, and completed a comparative analysis.',
        '服务"上外学联"、"青春上外"两大校级官方公众号，常态化完成推文排版、配图设计、活动海报、物料制作等宣传工作。': 'Supported the “SISU Student Union” and “Youth SISU” official accounts with editorial layouts, visual assets, event posters, and promotional materials.',
        '根据校园活动排期合理分配组员任务，保障宣传工作高效有序落地。': 'Allocated team tasks according to the campus-event schedule to ensure efficient delivery of communications work.',
        '科研辅助：': 'Research assistance: ',
        '活动执行：': 'Event execution: ',
        '行政运维：': 'Administration: ',
        '涉外接待：': 'Additional reception experience: ',
        '迎新统筹：': 'Orientation: ',
        '校地共建：': 'University–Community Partnership: ',
        '新媒体运营：': 'Media Operations: ',
        '毕业季项目：': 'Graduation Season: ',
        '体系建设：': 'Organizational Development: ',
        '协助中心主任完成文献搜集筛选、文献综述撰写、课题申报材料撰写。': 'helped with literature search/screening, literature reviews, and grant application materials to support project advancement.',
        '全程参与2次国际学术会议、3场学术讲座及论坛的策划筹备与落地执行，涵盖外籍专家来访审批、会议手册编制、专家对接接待、会场协调。': 'participated in 2 international conferences and 3 lectures/forums, covering approval for overseas experts, conference handbook preparation, expert reception, venue setup, attendee registration coordination, and post-event news release.',
        '负责中心日常事务协调、项目经费核对与财务报销、各类科研及活动材料分类归档。': 'coordinated daily center affairs, managed project budgets and reimbursements, and archived research and event materials to standardize records management.',
        '担任百年校庆志愿者，负责法国高校外宾接待；参与香港浸会大学合作交流午宴接待工作。': 'served as a volunteer for OUC’s centenary, responsible for receiving guests from French universities; supported a collaborative luncheon at HKBU by introducing postgraduate programs, research outputs, and student experience.',
        '全权负责新生系列活动，涵盖新生晚会全流程筹划落地、新生指南推送、学生会纳新宣传、线下路演招募、面试筛选及新成员培训动员。': 'responsible for the full lifecycle of orientation initiatives, including the welcoming gala, new-student guide posts, recruitment for Student Union departments (online promotion, offline roadshows, interviews), and onboarding and training.',
        '对接徐家汇街道团委，落地两大合作项目。组织中英法三语志愿者团队，承接徐汇建筑可阅读计划、百代小楼等文化场所场馆讲解、导览。': 'coordinated with the Xujiahui Subdistrict Youth League Committee to deliver two major collaborations: organizing a tri-lingual (Chinese–English–French) volunteer team supporting tours and guided visits at cultural venues such as the Xuhui Architecture Reading Program and the Pathé Building; and delivering K-12 aesthetic education sessions combining Chinese and French culture for the Xuhui Middle School French Club.',
        '统筹运营"上外法语系学生联合会"、"上外法语系"公众号，负责选题策划、内容审核、统筹活动影像记录及推文推送。': 'led the two WeChat public accounts of the School of French and Francophone Studies, covering topic planning, media coordination, and editorial review.',
        '作为主创核心成员，统筹毕业歌会落地、毕业礼品采购定制，独立完成17分钟毕业主题纪录片的拍摄统筹与全片剪辑。': 'as a core producer, coordinated the graduation gala, sourced and customized graduation gifts, and independently managed the shoot coordination and full, 17-minute documentary editing.',
        '参与系团委创建工作，助力系团委获评"2022年度上海市基层团组织典型选树团委"。': 'took part in founding the department’s Youth League Committee, contributing to its recognition as a 2022 Shanghai model grassroots youth organization.',
        '运用': 'Used ',
        'Excel VLOOKUP、数据透视表工具': 'Excel (VLOOKUP, pivot tables)',
        '，完成月度员工考勤、薪酬福利数据的登记、核对与报表整理，保障人事数据无误。': ' to record, update, and report monthly employee attendance and payroll/benefits data, ensuring data accuracy in HR systems. Managed employee HR service requests in the internal system by routing requests to responsible owners and tracking resolution.',
        '参与': 'Supported ',
        '秋季校园招聘': 'autumn campus recruitment',
        '，承担线上宣讲会设备调试、场地布置、直播待命及突发问题应急处理。': ', handling equipment setup, venue preparation, and live support.',
        '负责': 'Supported ',
        '部门月度团建项目': 'monthly team-building projects for the department',
        '，统筹活动游戏策划、场地预定、物料及餐点采购、现场执行。': ', including game/activity design, venue booking, procurement of materials and catering, and on-site execution.',
        '常态化更新企业人事系统及员工档案，标准化办理员工在职、离职等证明。': 'Regularly updated personnel files and standardized employment/separation documentation for employees.',
        '对接政府单位、各类社会组织及合作机构': 'Liaised with government agencies, social organizations, and partner institutions',
        '，完成日常接待工作，承担机构部分文稿翻译。': ' for reception and communication, and supported translation of institutional documents.',
        '协同联动西岸美术馆、辖区企业': 'Partnered with the West Bund Museum and local enterprises to launch ',
        '落地“灯塔书房”领读人公益阅读活动': 'the “X-Lighthouse” public reading program',
        '，负责宣传物料制作、会场布置、现场影像记录，完成活动回顾视频剪辑。': ', producing promotional materials, setting up venues, recording on-site photos and videos, and editing recap videos.',
        '书院“寻光之夜”大型公共活动': 'the “Seeking Light Night” large-scale public event',
        '，负责现场客流引导、秩序维护、游客答疑等保障工作。': ', handling guest-flow guidance, order maintenance, visitor Q&A, and other on-site support.',
        '整合各部门员工培训数据，运用Excel函数、数据透视表及Power BI搭建并每周': 'Consolidated cross-department training data and used Excel functions, pivot tables, and Power BI to build and ',
        '迭代更新培训数据可视化看板': 'iterate a weekly-updated training-data visualization dashboard',
        '，定期完成数据核查与复盘。': ', regularly performing data checks and reviews to support L&D reviews.',
        '管培生培训项目': 'the management trainee program',
        '，对接管培生群体，收集培训反馈、记录活动全过程影像，独立完成项目宣传视频、总结视频剪辑。': ': connected with management trainees, collected feedback, documented the program on video, and independently edited the promotional and summary videos.',
        '社招新员工培训项目': 'the new-hire onboarding program',
        '，协助完成员工资料录入、基础培训落地及活动盘点总结。': ', assisting with employee record entry, training delivery, and event summaries.',
        '协助落地其他各类人才培养与发展活动，负责宣传文案撰写、物料中英文翻译、活动会场布置及流程统筹。': 'Assisted with talent-development activities by drafting promotional copy, translating materials between Chinese and English, setting up event venues, and coordinating logistics.',
        '聚焦情感记忆沉浸式体验赛道，参与': 'Focused on immersive emotional-memory experiences and developed ',
        'MR混合现实创意产品Memento': 'the MR concept product “Memento”',
        '方案策划。完成': '. Completed ',
        '行业前置调研、产品方案打磨、概念视频制作': 'industry and user research, refined product positioning and features, and produced a concept video',
        '，落地完整的MR情感体验产品方案。基于学术论文、行业报告及现有产品数据，开展前置调研，挖掘用户需求，打磨产品核心定位与功能方案，整合6DoF采集、BCI情感感知、多感官重现核心技术。产出概念展示视频，形成创新性的数字媒体设计成果。': ' to present a full creative proposal. Conducted front-end research via academic literature, industry reports, and product benchmarks; identified core user needs; defined product positioning and feature set; and integrated key technologies (6DoF capture, BCI-based affect sensing, and multi-sensory re-creation). Generated concept video assets using Seedance and Kling, and edited the final cut via CapCut, delivering a complete MR emotional-experience concept and an innovative digital media design outcome.',
        '围绕中国单方面免签政策落地实效开展数据新闻创作，通过': 'Produced a data story on the outcome of China’s visa-free policy, using ',
        '数据挖掘、可视化呈现与网页搭建': 'data mining, visualization, and web deployment',
        '，直观解读政策经济价值与落地效果。团队自主确定研究选题，梳理免签政策扩容历程，以上海韩国游客激增为核心案例，收集、标准化处理多维度数据，剖析政策对入境旅游、区域经济的影响。在项目中': ' to interpret its economic value and policy outcomes. The team independently defined the research topic, traced the policy’s expansion, and used Shanghai’s surge in South Korean visitors as the core case, collecting and standardizing multi-dimensional data to analyze the policy’s impact on inbound tourism and the regional economy. In this project, I ',
        '独立负责完成网页设计与搭建': 'independently designed and built the website',
        '协助落地乡村支教课程、乡村文化探访活动，负责项目全渠道线上宣传与内容产出。参与福建南平、厦门两地乡村美育课程授课及乡村文化探访行动，担任宣传组成员，依托微信公众号、微博、美篇等新媒体平台产出多轮图文与短视频内容。顺利完成乡村支教公益授课任务，': 'Assisted in delivering rural education courses and cultural-heritage visits, leading full-channel online promotion and content production. Taught aesthetic-education courses and joined cultural fieldwork in Nanping and Xiamen, Fujian, as a member of the publicity team, producing graphic posts, video diaries, and other content across WeChat, Weibo, and Meipian. Successfully completed the volunteer teaching tasks and ',
        '扩大项目公益影响力': 'expanded the project’s public impact',
        '，传递乡村教育公益价值。': ', conveying the value of rural education.',
        '针对大学生网络诈骗高发问题，': 'In response to the high incidence of online fraud among university students, ',
        '联合校方及公安部门开展专项调研与科普宣传': 'launched joint research and public-education campaigns with the university and local police',
        '，助力提升高校学生反诈防范意识。联动当地派出所、学校保卫处，设计调研问卷并回收有效样本500余份，系统梳理当代大学生反诈现状、现存风险与防范困境，完成专项调研报告撰写。': ' to raise students’ anti-fraud awareness. Partnered with the local police station and university security office to design surveys and collect 500+ valid responses, mapped current awareness levels, risks, and prevention challenges, and authored a special research report; also operated a WeChat account publishing ongoing anti-fraud content.',
        '英语专四优秀': 'TEM-4 Excellent',
        '英语专八良好': 'TEM-8 Good',
        'CET-4 605分': 'CET-4 605',
        'CET-6 613分': 'CET-6 613',
        '法语专业背景': 'French major',
        '剪映': 'CapCut',
        '秀米': 'Xiumi',
        'Codex（vibe coding）': 'Codex (vibe coding)',
        'Claude（数据分析）': 'Claude (data analysis)',
        'Consensus（文献检索）': 'Consensus (literature retrieval)',
        'Gemini（vibe coding）': 'Gemini (vibe coding)'
    };
    const originalTextNodes = [];
    const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            const parent = node.parentElement;
            if (!node.nodeValue.trim() || !parent ||
                parent.closest('script, style, .language-switch') ||
                parent.closest('[data-nav]')) {
                return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
        }
    });
    let textNode;
    while ((textNode = textWalker.nextNode())) {
        originalTextNodes.push([textNode, textNode.nodeValue]);
    }

    function englishPlaceholder(node) {
        const source = node.nodeValue.trim();
        // 原本就是英文、数字、日期或符号的文案无需替换。
        if (/^[\x00-\x7F]+$/.test(source)) return source;
        return englishTranslations[source] || source;
    }

    function setLanguage(language) {
        const isEnglish = language === 'en';
        document.documentElement.lang = isEnglish ? 'en' : 'zh-CN';
        document.documentElement.classList.toggle('is-english', isEnglish);
        navigationItems.forEach(item => {
            item.innerHTML = isEnglish ? navigationLabels[item.dataset.nav] : navigationMarkup.get(item);
        });
        originalTextNodes.forEach(([node, original]) => {
            node.nodeValue = isEnglish ? englishPlaceholder(node) : original;
        });
        languageSwitch?.setAttribute('aria-pressed', String(isEnglish));
        languageSwitch?.setAttribute('aria-label', isEnglish ? 'Switch to Chinese' : 'Switch to English');
        try {
            localStorage.setItem('portfolio-language', language);
        } catch (error) {
            // 浏览器禁用存储时仍可正常切换语言。
        }
    }

    if (languageSwitch) {
        languageSwitch.addEventListener('click', () => {
            setLanguage(document.documentElement.lang === 'en' ? 'zh' : 'en');
        });
        try {
            if (localStorage.getItem('portfolio-language') === 'en') setLanguage('en');
        } catch (error) {
            // 忽略受限存储环境。
        }
    }

    /* ====== 11. 页面加载完成 ====== */

    window.addEventListener('load', () => {
        // 如果 URL 有 hash，滚动到对应位置
        const hash = window.location.hash;
        if (hash) {
            const target = $(hash);
            if (target) {
                setTimeout(() => {
                    const navHeight = navbar.offsetHeight;
                    const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;
                    window.scrollTo({ top: targetTop, behavior: 'smooth' });
                }, 100);
            }
        }
    });

})();
