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
        about: 'About',
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
        '项目与活动管理': 'Project & Event Management',
        '内容制作与传播': 'Content Production & Communication',
        '数据洞察与可视化': 'Data Insights & Visualization',
        '学术与政策研究': 'Academic & Policy Research',
        '教育经历': 'Education',
        '上海外国语大学': 'Shanghai International Studies University',
        '外国语言文学 · 法语专业 · 本科': 'Foreign Languages and Literature · French · B.A.',
        '中国海洋大学': 'Ocean University of China',
        '公共管理学 · 教育经济与管理 · 硕士': 'Public Administration · Economics and Management of Education · M.A.',
        '香港浸会大学*': 'Hong Kong Baptist University*',
        '传播学（Communication）· 文学硕士（MA）': 'Communication · Master of Arts (MA)',
        '*注：香港浸会大学为硕士阶段双学位项目': '*Note: Hong Kong Baptist University is a dual-degree master’s program.',
        '实习经历': 'Internship',
        '主要职责': 'Key Responsibilities',
        '数据维护 / 工单处理 / 秋招协助 / 团建落地': 'Data maintenance / ticket handling / recruitment support / team-building delivery',
        '跨机构活动与接待 / 公共活动支持 / 宣传物料制作': 'Cross-institutional events and reception / public-event support / promotional materials',
        '培训看板维护 / 培训活动落地 / 宣传物料制作': 'Training dashboard maintenance / training-event delivery / promotional materials',
        '实践项目': 'Projects',
        '香港浸会大学传理学院数字媒体创意方案设计项目': 'HKBU School of Communication Digital Media Creative Proposal Project',
        '数据可视化与数据新闻项目': 'Data Visualization & Data Journalism Project',
        '立邦「为爱上色」中国大学生农村支教项目': 'Nippon Paint “Colour, Way of Love” Rural Education Project',
        '大学生网络受骗风险防范意识现状与应对策略': 'University Students’ Online-Fraud Risk Awareness: Status and Responses',
        '国外新冠自主治疗咨询平台研究与国内平台建设推广': 'Research on Overseas COVID-19 Self-Care Platforms and Domestic Platform Development',
        '数字媒体': 'Digital Media',
        '数据新闻': 'Data Journalism',
        '公益支教': 'Educational Volunteering',
        '调研报告': 'Research Report',
        '对比研究': 'Comparative Research',
        '校园经历': 'Campus',
        '学生秘书': 'Student Secretary',
        '团委副书记': 'Deputy Secretary, Youth League Committee',
        '宣传部': 'Publicity Department',
        '团支部书记': 'Youth League Branch Secretary',
        '学生阶段所获奖项': 'Awards & Honors',
        '技能与作品': 'Skills & Works',
        '技能': 'Skills',
        '语言': 'Languages',
        '媒体技能': 'Media Skills',
        '数据分析与可视化': 'Data Analysis & Visualization',
        '常用AI工具': 'AI Tools',
        '公众号图文': 'WeChat Articles Layouts & Illustrations',
        '视频剪辑': 'Video Editing',
        '部分视觉与平面设计（非商用）': 'Selected Visual & Graphic Design (Non-commercial)',
        '点击卡片打开链接 · 查看详情': 'Click to open the link · View details',
        '鼠标悬停 · 查看详情': 'Hover to preview',
        '联系我': 'Contact',
        '邮箱': 'Email',
        'CV（中文）PDF': 'CV (Chinese) PDF',
        'CV（英文）PDF': 'CV (English) PDF',
        '导航': 'Navigation',
        '昕诺飞（中国）投资有限公司': 'Signify (China) Investment Co., Ltd.',
        '徐家汇书院（徐汇区图书馆）': 'Xujiahui Academy (Xuhui District Library)',
        '菲仕兰食品贸易（上海）有限公司': 'FrieslandCampina (Shanghai) Trading Co., Ltd.',
        'HR Services 实习生 — 支持亚太区人事数据管理、校园招聘、团队建设及基础人事运维等日常HR工作。': 'HR Services Intern — Supported APAC HR data management, campus recruitment, team-building, and daily HR operations.',
        '公共事业部 — 主任助理，协助开展对外合作、政社接待及公共活动落地工作。': 'Public Affairs Division — Director’s Assistant, supporting external partnerships, institutional reception, and public-program delivery.',
        'Learning & Development Intern — 负责员工培训数据可视化搭建与维护、新员工入职及管培生项目落地。': 'Learning & Development Intern — Built and maintained employee-training dashboards and supported onboarding and management-trainee programs.',
        '山东省与美国交流合作研究中心': 'Research Centre for Shandong–American Exchanges and Cooperation',
        '上海外国语大学法语系': 'School of French and Francophone Studies, SISU',
        '上海外国语大学团委学生会SYM工作室': 'SYM Studio, SISU Youth League & Student Union',
        '上海外国语大学法语系2020级本科四班': 'SISU School of French and Francophone Studies, Class of 2020, Class 4',
        '副组长': 'Deputy Lead',
        '（主席团成员）': '(Presidium Member)',
        '设计组副组长': 'Deputy Lead, Design Group',
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
        '作为法语系团委学生会主席团成员，负责': 'As a member of the executive committee of the French Department Youth League and Student Union, I coordinated ',
        '年度项目群统筹': 'annual project portfolios',
        '。一年内接连落地迎新、校地共建、毕业季等多类活动。任职期间系团委获评"2022年度上海市基层团组织典型选树团委"。': '. Within one year, I delivered orientation, university–community partnership, and graduation initiatives. During my term, the department’s Youth League Committee was recognized as a 2022 Shanghai model grassroots youth organization.',
        '运营上外法语系两个官方公众号，负责': 'Managed two official WeChat accounts for the French Department at SISU, responsible for ',
        '选题安排、素材组织与审核发布': 'topic planning, asset coordination, review, and publication',
        '，形成"活动－内容－素材库"的工作流程闭环。': ', establishing an end-to-end workflow linking events, content, and asset libraries.',
        '硕士阶段研究方向为': 'My master’s research focuses on ',
        'AI教育政策、高等教育国际化': 'AI education policy and the internationalization of higher education',
        '，现有2篇论文已于学术会议汇报发表，3篇待发表。': '; two papers have been presented at academic conferences, with three more in progress.',
        '掌握': 'Proficient in ',
        '政策文本分析、半结构化访谈、质性文本编码': 'policy text analysis, semi-structured interviews, and qualitative coding',
        '等研究方法，具备扎实的学术研究基础。': ', supported by a solid foundation in academic research.',
        '协助学术研究辅助、国际学术活动统筹执行、日常行政运维、财务报销与经费管理，保障科研推进与学术活动高效有序开展。': 'Supported academic research, coordinated and delivered international academic events, and handled daily administration, reimbursements, and budget management to ensure efficient research and event operations.',
        '分管系团学部、宣传部两个部门，统筹负责全系团学活动策划、新媒体运营、校地共建及学生会主要活动落地。': 'Led student-affairs and publicity teams, coordinated student-activity planning, managed new-media operations, advanced university–community partnerships, and delivered major Student Union events.',
        '负责校级团委学生会宣传工作，承担官方公众号视觉排版、宣传物料设计、插画制作，统筹组员工作分配。': 'Delivered visual layouts for official Student Union WeChat accounts, designed promotional materials and illustrations, and assigned work across the design team.',
        '聚焦中外新冠自主诊疗服务平台发展差异，开展多平台对比调研，为国内医疗自助服务平台优化提供参考。负责筛选美国、爱尔兰、法国等5个国外平台及4个国内新冠自查服务平台，系统性搜集各平台基础信息、运营模式、内容设计及服务功能；整合多维度数据完成对比分析。': 'Investigated differences between domestic and international COVID-19 self-care consultation platforms to inform domestic platform improvement. Selected five overseas platforms and four Chinese platforms, collected information on operating models, content, and services, and completed a comparative analysis.',
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
        '体系建设：': 'Organizational Development: '
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
