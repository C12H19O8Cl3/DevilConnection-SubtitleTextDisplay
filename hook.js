(function () {
	'use strict';
	if (window.__SUBTITLE_DISPLAY_LOADED) return;
	window.__SUBTITLE_DISPLAY_LOADED = true;

	function getTYRANO() { return window.TYRANO; }
	function kag() { return getTYRANO().kag; }
	function pluginKag() { return window.tyrano && window.tyrano.plugin && window.tyrano.plugin.kag; }

	function injectSubtitleElement(iskill) {
		const menuLayer = pluginKag().layer.getMenuLayer();

		if (!menuLayer) {
			console.warn("[周目副标题显示] 未能找到菜单容器，跳过元素添加。");
			return;
		}

		const subtitleStyles = document.createElement('style');

		subtitleStyles.textContent = '@font-face{font-family:FZQKBYSJW;src:url(data/others/FZQKBYSJW.TTF)}@font-face{font-family:JH;src:url(data/others/JasonHandwriting7p.ttf)}';
		subtitleStyles.id = 'subtitle_styles';

		const subTitleElement = document.createElement('p');

		subTitleElement.className = "menu_subtitle_text";
		subTitleElement.id = 'loop_subtitle';
		subTitleElement.innerHTML = '副标题文本';
		subTitleElement.style.top = '139px';
		subTitleElement.style.left = '85px';
		subTitleElement.style.width = '300px';
		subTitleElement.style.zIndex = '99999';
		subTitleElement.style.color = iskill ? '#f00' : '#6db6aa';
		subTitleElement.style.textAlign = 'center';
		subTitleElement.style.fontSize = '16px';
		subTitleElement.style.transform = 'skew(0deg,-2.8deg)';
		subTitleElement.style.fontFamily = iskill ? 'JH' : 'FZQKBYSJW';
		subTitleElement.onmouseover = function () {
			this.style.textShadow = iskill ? '0.2px 0.2px 0.2px #000000' : '0.5px 0.5px 0.5px #888888';
			window.playSE('tap.ogg');
		};
		subTitleElement.onmouseout = function () {
			this.style.textShadow = '';
		};
		try {
			document.getElementById('menu_items').appendChild(subTitleElement);
			document.head.appendChild(subtitleStyles);
		} catch (err) {
			console.error('[周目副标题显示] 添加副标题时出错: ' + err);
		}

	}

	function rewriteShowMenu() {
		const k = pluginKag();
		const TYRANO = getTYRANO();
		const showMenu = k.menu.showMenu;
		if (!showMenu) { setTimeout(rewriteShowMenu, 300); return; }
		if (showMenu.__subtitleDisplayWrapped) {return;}

		const orig = k.menu.showMenu;

		window.tyrano.plugin.kag.menu.showMenu = function (force) {
			try {
				orig.call(this, force);
				const f = window.TYRANO.kag.stat.f;
				const layer_menu = TYRANO.kag.layer.getMenuLayer()
				const loopSubtitle = $.lang('subtitle')[f.subtitle] || '';
				const loopCount = '当前循环次数：' + f.currentLoop || '';
				const subtitle = f.subtitle || '';
				var currentSubtitle = loopSubtitle;
				var subtitleTextType = 0;

				if (loopSubtitle == '') {
					currentSubtitle = loopCount;
				}
				if (f.day_epilogue != 0) {
					currentSubtitle = '';
				}

				injectSubtitleElement(subtitle == 'bel');

				const menuImages = layer_menu.find(
					'#menu_items img, #menu_items p, .img_label_story, #loop_subtitle'
				);

				layer_menu
					.find('#loop_subtitle')
					.text(currentSubtitle)
					.on(
						'click', function () {
							if ((subtitleTextType == 0 || (loopSubtitle == '')) && !(subtitle == 'bel')) {
								subtitleTextType = 1;
								currentSubtitle = loopCount;
							} else {
								subtitleTextType = 0;
								currentSubtitle = loopSubtitle;
							}
							layer_menu.find('#loop_subtitle').text(currentSubtitle);
						}
					)
				menuImages.hide();

				setTimeout(() => {
					menuImages.fadeIn(200);
				}, 300);

				layer_menu.find('.area_close').on('click', function (e) {
					menuImages.fadeOut(200);
				})
			} catch (err) { console.error(err) }
		};
		showMenu.__subtitleDisplayWrapped = true;
	}
	rewriteShowMenu();
})();
