/**
 * 贵州珠宝网资讯 — 交互脚本 v3
 * 轮播 · Tab · 筛选 · 搜索 · 分享 · 移动菜单 · 滚动优化
 */
(function() {
  'use strict';

  // ==================== 轮播图 ====================
  function Carousel(el) {
    if (!el) return;
    var track = el.querySelector('.carousel-track');
    var slides = el.querySelectorAll('.carousel-slide');
    var dots = el.querySelectorAll('.carousel-dots span');
    var prev = el.querySelector('.carousel-ctrl.prev');
    var next = el.querySelector('.carousel-ctrl.next');
    if (!track || !slides.length) return;

    var idx = 0, total = slides.length, timer = null, paused = false;

    function go(n) {
      if (n < 0) n = total - 1;
      if (n >= total) n = 0;
      idx = n;
      track.style.transform = 'translateX(-' + (idx * 100) + '%)';
      if (dots.length) {
        dots.forEach(function(d, i) { if (i === idx) d.classList.add('active'); else d.classList.remove('active'); });
      }
    }

    function nextSlide() { if (!paused) go(idx + 1); }
    function prevSlide() { if (!paused) go(idx - 1); }
    function startAuto() { stopAuto(); if (!paused) timer = setInterval(nextSlide, 5000); }
    function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }

    if (prev) prev.addEventListener('click', function() { prevSlide(); startAuto(); });
    if (next) next.addEventListener('click', function() { nextSlide(); startAuto(); });
    if (dots.length) {
      dots.forEach(function(d, i) {
        d.addEventListener('click', function() { go(i); startAuto(); });
      });
    }
    el.addEventListener('mouseenter', function() { paused = true; stopAuto(); });
    el.addEventListener('mouseleave', function() { paused = false; startAuto(); });

    // 触摸滑动
    var touchX = 0;
    el.addEventListener('touchstart', function(e) { touchX = e.changedTouches[0].screenX; }, { passive: true });
    el.addEventListener('touchend', function(e) {
      var diff = touchX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide(); else prevSlide();
        startAuto();
      }
    });

    startAuto();
  }

  // ==================== Tab 切换 ====================
  function initTabs() {
    var tabBars = document.querySelectorAll('.news-tabs');
    tabBars.forEach(function(tabBar) {
      var btns = tabBar.querySelectorAll('button');
      var list = document.querySelector('.news-list');
      if (!list) return;

      btns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          btns.forEach(function(b) { b.classList.remove('active'); });
          this.classList.add('active');
          var filter = this.getAttribute('data-filter');
          var cards = list.querySelectorAll('.n-card');
          cards.forEach(function(card) {
            if (filter === 'all' || card.getAttribute('data-cat') === filter) {
              card.style.display = '';
            } else {
              card.style.display = 'none';
            }
          });
        });
      });
    });
  }

  // ==================== 商家筛选 ====================
  function initBizFilter() {
    var filterBars = document.querySelectorAll('.biz-filter');
    filterBars.forEach(function(filterBar) {
      var btns = filterBar.querySelectorAll('button');
      var grid = document.querySelector('.biz-grid');
      if (!grid) return;

      btns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          btns.forEach(function(b) { b.classList.remove('active'); });
          this.classList.add('active');
          var filter = this.getAttribute('data-filter');
          var cards = grid.querySelectorAll('.biz-card');
          cards.forEach(function(card) {
            if (filter === 'all' || card.getAttribute('data-type') === filter) {
              card.style.display = '';
            } else {
              card.style.display = 'none';
            }
          });
        });
      });
    });
  }

  // ==================== 搜索 ====================
  function initSearch() {
    var searchBoxes = document.querySelectorAll('.nav-search');
    searchBoxes.forEach(function(box) {
      var input = box.querySelector('input');
      var btn = box.querySelector('button');
      if (!input || !btn) return;

      function doSearch() {
        var q = input.value.trim();
        if (q) showToast('搜索：「' + q + '」（演示模式）');
      }
      btn.addEventListener('click', doSearch);
      input.addEventListener('keydown', function(e) { if (e.key === 'Enter') doSearch(); });
    });
  }

  // ==================== 登录按钮 ====================
  function initLogin() {
    var btns = document.querySelectorAll('.btn-login');
    btns.forEach(function(btn) {
      btn.addEventListener('click', function() { showToast('登录功能开发中，敬请期待'); });
    });
  }

  // ==================== 分享按钮 ====================
  function initShare() {
    var btns = document.querySelectorAll('.share-btn');
    btns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var platform = this.getAttribute('data-platform');
        var url = location.href;
        var title = document.title;
        if (platform === 'wechat') { copyText(url); showToast('链接已复制，请在微信中分享'); }
        else if (platform === 'weibo') {
          window.open('https://service.weibo.com/share/share.php?url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title), '_blank');
        }
        else { copyText(url); showToast('链接已复制到剪贴板'); }
      });
    });
  }

  // ==================== 分页 ====================
  function initPager() {
    var pagers = document.querySelectorAll('.pager');
    pagers.forEach(function(pager) {
      var links = pager.querySelectorAll('a:not(.off):not(.cur)');
      links.forEach(function(link) {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          pager.querySelectorAll('a').forEach(function(a) { a.classList.remove('cur'); });
          this.classList.add('cur');
          var newsList = document.querySelector('.news-list');
          if (newsList) newsList.scrollIntoView({ behavior: 'smooth', block: 'start' });
          showToast('切换到第 ' + this.textContent.trim() + ' 页（演示）');
        });
      });
    });
  }

  // ==================== 移动端菜单 ====================
  function initMobileMenu() {
    var nav = document.querySelector('.main-nav');
    if (!nav) return;
    var links = nav.querySelector('.nav-links');
    if (!links) return;

    // 避免重复创建
    if (nav.querySelector('.mob-menu-btn')) return;

    var btn = document.createElement('button');
    btn.className = 'mob-menu-btn';
    btn.setAttribute('aria-label', '菜单');
    btn.innerHTML = '&#9776;';

    var container = nav.querySelector('.container');
    if (container) container.insertBefore(btn, links);

    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var isOpen = links.classList.toggle('show');
      btn.innerHTML = isOpen ? '&#10005;' : '&#9776;';
    });

    document.addEventListener('click', function(e) {
      if (!nav.contains(e.target) && links.classList.contains('show')) {
        links.classList.remove('show');
        btn.innerHTML = '&#9776;';
      }
    });
  }

  // ==================== 导航滚动阴影 ====================
  function initNavShadow() {
    var nav = document.querySelector('.main-nav');
    if (!nav) return;
    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          if (window.scrollY > 10) nav.classList.add('scrolled');
          else nav.classList.remove('scrolled');
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // ==================== 返回顶部 ====================
  function initScrollTop() {
    // 避免重复创建
    if (document.querySelector('.scroll-top')) return;

    var btn = document.createElement('button');
    btn.className = 'scroll-top';
    btn.innerHTML = '&#8593;';
    btn.setAttribute('aria-label', '返回顶部');
    btn.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    document.body.appendChild(btn);

    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          if (window.scrollY > 500) btn.classList.add('show');
          else btn.classList.remove('show');
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // ==================== 导航当前页高亮 ====================
  function initActiveNav() {
    var path = location.pathname.replace(/\\/g, '/');
    var links = document.querySelectorAll('.nav-links a');
    links.forEach(function(link) {
      var href = link.getAttribute('href') || '';
      href = href.replace(/\\/g, '/');

      // 首页匹配
      if ((path.endsWith('/') || path.endsWith('index.html')) && (href === 'index.html' || href === '../index.html' || href.endsWith('/'))) {
        link.classList.add('active');
      }
      // 子页匹配
      else if (href && path.indexOf(href.replace(/^\.\.\//, '')) > -1) {
        link.classList.add('active');
      }
      // 精确匹配
      else if (href && path.endsWith(href.replace(/^\.\.\//, ''))) {
        link.classList.add('active');
      }
    });
  }

  // ==================== Toast 提示 ====================
  function showToast(msg) {
    var old = document.querySelector('.toast');
    if (old) old.remove();
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function() { if (el && el.parentNode) el.remove(); }, 2600);
  }

  // ==================== 剪贴板 ====================
  function copyText(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text).catch(function() { fallbackCopy(text); });
    } else { fallbackCopy(text); }
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); } catch(e) {}
    document.body.removeChild(ta);
  }

  // ==================== 日期显示 ====================
  function initDate() {
    var el = document.getElementById('today');
    if (!el) return;
    var d = new Date();
    var wd = ['日','一','二','三','四','五','六'];
    el.textContent = d.getFullYear() + '年' + (d.getMonth()+1) + '月' + d.getDate() + '日 星期' + wd[d.getDay()];
  }

  // ==================== 全局启动 ====================
  function boot() {
    initDate();
    initTabs();
    initBizFilter();
    initSearch();
    initLogin();
    initShare();
    initPager();
    initMobileMenu();
    initNavShadow();
    initScrollTop();
    initActiveNav();

    // 启动轮播
    var carousels = document.querySelectorAll('.carousel');
    carousels.forEach(function(c) { new Carousel(c); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
