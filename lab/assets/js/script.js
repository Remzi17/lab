(function () {
	'use strict';

	// 
	// 
	// 
	// 
	// Переменные
	const body = document.querySelector('body');
	const html = document.querySelector('html');
	const popup$1 = document.querySelectorAll('.popup');

	const headerTop = document.querySelector('.header-fixed') ? document.querySelector('.header-fixed') : document.querySelector('head');
	const headerTopFixed = 'header-fixed_fixed';
	let fixedElements = document.querySelectorAll('[data-fixed]');
	let stickyObservers = new Map();

	const menuClass = '.header__mobile';
	const menu = document.querySelector(menuClass) ? document.querySelector(menuClass) : document.querySelector('head');
	const menuLink = document.querySelector('.menu-link') ? document.querySelector('.menu-link') : document.querySelector('head');
	const menuActive = 'active';

	const burgerMedia = 991;
	const bodyOpenModalClass = 'popup-show';

	let windowWidth = window.innerWidth;
	document.querySelector('.container')?.offsetWidth || 0;

	const checkWindowWidth = () => {
		windowWidth = window.innerWidth;
		document.querySelector('.container')?.offsetWidth || 0;
	};

	//
	//  
	//
	//
	// Проверки

	// Проверка на мобильное устройство
	function isMobile() {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)
	}

	// Проверка на десктоп разрешение 
	function isDesktop() {
		return windowWidth > burgerMedia
	}

	// Проверка поддержки webp 
	function checkWebp() {
		const webP = new Image();
		webP.onload = webP.onerror = function () {
			if (webP.height !== 2) {
				document.querySelectorAll('[style]').forEach(item => {
					const styleAttr = item.getAttribute('style');
					if (styleAttr.indexOf('background-image') === 0) {
						item.setAttribute('style', styleAttr.replace('.webp', '.jpg'));
					}
				});
			}
		};
		webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
	}

	// Проверка на браузер safari
	const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

	// Проверка есть ли скролл 
	function haveScroll() {
		return document.documentElement.scrollHeight !== document.documentElement.clientHeight
	}

	// Видимость элемента
	function isHidden(el) {
		return window.getComputedStyle(el).display === 'none'
	}

	// Закрытие бургера на десктопе
	function checkBurgerAndMenu() {
		if (isDesktop()) {
			menuLink.classList.remove('active');
			if (menu) {
				menu.classList.remove(menuActive);
				if (!body.classList.contains(bodyOpenModalClass)) {
					body.classList.remove('no-scroll');
				}
			}
		}

		if (html.classList.contains('lg-on')) {
			if (isMobile()) {
				body.style.paddingRight = '0';
			} else {
				body.style.paddingRight = getScrollBarWidth() + 'px';
			}
		}
	}

	// Получение объектов с медиа-запросами
	function dataMediaQueries(array, dataSetValue) {
		let media = Array.from(array).filter(function (item) {
			if (item.dataset[dataSetValue]) {
				return item.dataset[dataSetValue].split(",")[0]
			}
		});

		if (media.length) {
			let breakpointsArray = [];
			media.forEach(item => {
				let params = item.dataset[dataSetValue];
				let breakpoint = {};
				let paramsArray = params.split(",");
				breakpoint.value = paramsArray[0];
				breakpoint.type = paramsArray[1] ? paramsArray[1].trim() : "max";
				breakpoint.item = item;
				breakpointsArray.push(breakpoint);
			});

			let mdQueries = breakpointsArray.map(function (item) {
				return '(' + item.type + "-width: " + item.value + "px)," + item.value + ',' + item.type
			});

			mdQueries = uniqArray(mdQueries);
			let mdQueriesArray = [];

			if (mdQueries.length) {
				mdQueries.forEach(breakpoint => {
					let paramsArray = breakpoint.split(",");
					let mediaBreakpoint = paramsArray[1];
					let mediaType = paramsArray[2];
					let matchMedia = window.matchMedia(paramsArray[0]);

					let itemsArray = breakpointsArray.filter(function (item) {
						return item.value === mediaBreakpoint && item.type === mediaType
					});

					mdQueriesArray.push({ itemsArray, matchMedia });
				});

				return mdQueriesArray
			}
		}
	}

	// Задержка при вызове функции
	function throttle(fn, delay) {
		let timer;
		return () => {
			clearTimeout(timer);
			timer = setTimeout(() => fn.apply(this, arguments), delay);
		};
	}

	// Закрытие элемента при клике вне него
	function closeOutClick(closedElement, clickedButton, clickedButtonActiveClass, callback) {
		document.addEventListener('click', (e) => {
			const button = document.querySelector(clickedButton);
			const element = document.querySelector(closedElement);
			const withinBoundaries = e.composedPath().includes(element);

			if (!withinBoundaries && button?.classList.contains(clickedButtonActiveClass) && e.target !== button) {
				element.classList.remove('active');
				button.classList.remove(clickedButtonActiveClass);
			}
		});
	}

	// Плавный скролл
	function scrollToSmoothly(pos, time = 400) {
		const currentPos = window.pageYOffset;
		let start = null;
		window.requestAnimationFrame(function step(currentTime) {
			start = !start ? currentTime : start;
			const progress = currentTime - start;
			if (currentPos < pos) {
				window.scrollTo(0, ((pos - currentPos) * progress / time) + currentPos);
			} else {
				window.scrollTo(0, currentPos - ((currentPos - pos) * progress / time));
			}
			if (progress < time) {
				window.requestAnimationFrame(step);
			} else {
				window.scrollTo(0, pos);
			}
		});
	}

	window.addEventListener('resize', throttle(checkWindowWidth, 100));


	//
	//
	//
	//
	// Позиционирование

	// Отступ элемента от краев страницы
	function offset(el) {
		var rect = el.getBoundingClientRect(),
			scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
			scrollTop = window.pageYOffset || document.documentElement.scrollTop;

		return {
			top: rect.top + scrollTop,
			left: rect.left + scrollLeft,
			right: windowWidth - rect.width - (rect.left + scrollLeft),
		}
	}

	// 
	// 
	// 
	// 
	// Массивы

	// Индекс элемента
	function indexInParent(node) {
		var children = node.parentNode.childNodes;
		var num = 0;
		for (var i = 0; i < children.length; i++) {
			if (children[i] == node) return num;
			if (children[i].nodeType == 1) num++;
		}
		return -1;
	}

	// Изменение ссылок в меню 
	if (!document.querySelector('body').classList.contains('home') && document.querySelector('body').classList.contains('wp')) {
		let menu = document.querySelectorAll('.menu li a');

		for (let i = 0; i < menu.length; i++) {
			if (menu[i].getAttribute('href').indexOf('#') > -1) {
				menu[i].setAttribute('href', '/' + menu[i].getAttribute('href'));
			}
		}
	}

	// Добавление класса loaded после полной загрузки страницы
	function loaded() {
		document.addEventListener('DOMContentLoaded', function () {
			html.classList.add('loaded');
			if (document.querySelector('header')) {
				document.querySelector('header').classList.add('loaded');
			}
			if (haveScroll()) {
				setTimeout(() => {
					html.classList.remove('scrollbar-auto');
				}, 500);
			}
		});
	}

	// Для локалки
	if (window.location.hostname == 'localhost' || window.location.hostname.includes('192.168')) {
		document.querySelectorAll('.logo, .crumbs>li:first-child>a').forEach(logo => {
			logo.setAttribute('href', '/');
		});

		document.querySelectorAll('.menu a').forEach(item => {
			let firstSlash = 0;
			let lastSlash = 0;

			if (item.href.split('/').length - 1 == 4) {
				for (let i = 0; i < item.href.length; i++) {
					if (item.href[i] == '/') {
						if (i > 6 && firstSlash == 0) {
							firstSlash = i;
							continue
						}

						if (i > 6 && lastSlash == 0) {
							lastSlash = i;
						}
					}
				}

				let newLink = '';
				let removeProjectName = '';

				for (let i = 0; i < item.href.length; i++) {
					if (i > firstSlash && i < lastSlash + 1) {
						removeProjectName += item.href[i];
					}
				}

				newLink = item.href.replace(removeProjectName, '');
				item.href = newLink;
			}
		});
	}

	function setHeaderFixedHeight() {
		document.documentElement.style.removeProperty('--headerFixedHeight');
		void headerTop.offsetHeight;
		requestAnimationFrame(() => {
			document.documentElement.style.setProperty(
				'--headerFixedHeight',
				headerTop.offsetHeight + 'px'
			);
		});
	}

	let resizeTimer;

	window.addEventListener('resize', () => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(setHeaderFixedHeight, 1);
	});

	setHeaderFixedHeight();

	// 
	// 
	// 
	// 
	// Функции для работы со скроллом и скроллбаром

	// Скрытие скроллбара
	function hideScrollbar() {
		// changeScrollbarGutter()

		popup$1.forEach(element => {
			element.style.display = 'none';
		});

		if (haveScroll()) {
			body.classList.add('no-scroll');
			body.classList.add(bodyOpenModalClass);
		}

		changeScrollbarPadding();
	}

	function showScrollbar() {
		if (!menu.classList.contains(menuActive)) {
			body.classList.remove('no-scroll');
		}

		changeScrollbarPadding(false);

		if (haveScroll()) {
			body.classList.add('scrollbar-auto');
			html.classList.add('scrollbar-auto');
		}
	}

	// Ширина скроллбара
	function getScrollBarWidth$1() {
		let div = document.createElement('div');
		div.style.overflowY = 'scroll';
		div.style.width = '50px';
		div.style.height = '50px';
		document.body.append(div);
		let scrollWidth = div.offsetWidth - div.clientWidth;
		div.remove();

		if (haveScroll()) {
			return scrollWidth
		} else {
			return 0
		}
	}

	// Добавление полосы прокрутки
	function changeScrollbarGutter(add = true) {
		if (haveScroll()) {
			if (add) {
				body.classList.add(bodyOpenModalClass, 'scrollbar-auto');
				html.classList.add('scrollbar-auto');
			} else {
				body.classList.remove(bodyOpenModalClass, 'scrollbar-auto');
				html.classList.remove('scrollbar-auto');
			}
		}
	}

	// Добавление и удаление отступа у body и фиксированных элементов
	function changeScrollbarPadding(add = true) {
		const scrollbarPadding = getScrollBarWidth$1() + 'px';

		fixedElements.forEach(elem => {
			const position = window.getComputedStyle(elem).position;

			if (position === 'sticky') {
				if (add) {
					if (!stickyObservers.has(elem)) {
						const observer = new IntersectionObserver(([entry]) => {
							if (!entry.isIntersecting) {
								elem.style.paddingRight = scrollbarPadding;
							} else {
								elem.style.paddingRight = '0';
							}
						}, {
							threshold: [1]
						});
						observer.observe(elem);
						stickyObservers.set(elem, observer);
					}
				} else {
					elem.style.paddingRight = '0';
					const observer = stickyObservers.get(elem);
					if (observer) {
						observer.unobserve(elem);
						stickyObservers.delete(elem);
					}
				}
			} else {
				elem.style.paddingRight = add ? scrollbarPadding : '0';
			}
		});

		body.style.paddingRight = add ? scrollbarPadding : '0';
	}

	// Добавление прокрутки мышью для горизонтальных блоков
	function scrolling() {
		let dataScrollingBlocks = document.querySelectorAll('[data-scrolling]');

		if (dataScrollingBlocks) {
			dataScrollingBlocks.forEach(element => {
				let isDragging = false;
				let startX;
				let scrollLeft;
				let moved = false;

				element.addEventListener('mousedown', event => {
					isDragging = true;
					moved = false;
					element.classList.add('dragging');
					startX = event.pageX - element.offsetLeft;
					scrollLeft = element.scrollLeft;

					element.querySelectorAll('img, a').forEach(item => item.ondragstart = () => false);
				});

				element.addEventListener('mousemove', event => {
					if (!isDragging) return
					event.preventDefault();
					moved = true;
					const x = event.pageX - element.offsetLeft;
					const walk = x - startX;
					element.scrollLeft = scrollLeft - walk;
				});

				element.addEventListener('mouseup', event => {
					isDragging = false;
					element.classList.remove('dragging');

					element.querySelectorAll('img, a').forEach(item => item.ondragstart = null);

					if (moved) {
						event.preventDefault();
						event.stopPropagation();
					}
				});

				element.addEventListener('mouseleave', () => {
					isDragging = false;
					element.classList.remove('dragging');
					element.querySelectorAll('img, a').forEach(item => item.ondragstart = null);
				});

				element.querySelectorAll('a').forEach(link => {
					link.addEventListener('click', event => {
						if (moved) {
							event.preventDefault();
							event.stopPropagation();
						}
					});
				});
			});
		}
	}

	// Замена текста при выборе файла 
	function formFiles() {
		let files = document.querySelectorAll('.input-file');
		let fileText, fileDefaultText, filesNames, fileName;

		files.forEach(file => {
			fileText = file.querySelector('.input-file-text');
			fileDefaultText = fileText.textContent;

			const handleFiles = (fileInput, fileText) => {
				filesNames = '';

				for (let i = 0; i < fileInput.files.length; i++) {
					filesNames += fileInput.files[i].name;

					if (i !== fileInput.files.length - 1) {
						filesNames += ', ';
					}
				}

				fileName = fileInput.value.split('\\').pop();
				fileText.textContent = fileName ? filesNames : fileDefaultText;
			};

			file.querySelector('input').addEventListener('change', function () {
				handleFiles(this, fileText);
			});

			file.closest('form').addEventListener('reset', function () {
				fileText.textContent = fileDefaultText;
			});

			file.addEventListener('dragover', (e) => {
				e.preventDefault();
				file.classList.add('dragover');
			});

			file.addEventListener('dragleave', () => {
				file.classList.remove('dragover');
			});

			file.addEventListener('drop', (e) => {
				e.preventDefault();
				file.classList.remove('dragover');

				const droppedFiles = e.dataTransfer.files;

				if (droppedFiles.length > 0) {
					file.querySelector('input').files = droppedFiles;

					handleFiles(file.querySelector('input'), fileText);
				}
			});
		});
	}

	// Проверка на браузер safari
	if (isSafari) document.documentElement.classList.add('safari');

	// Проверка поддержки webp 
	checkWebp();

	// Закрытие бургера на десктопе
	window.addEventListener('resize', throttle(checkBurgerAndMenu, 100));
	checkBurgerAndMenu();

	// Добавление класса loaded при загрузке страницы
	loaded();

	// Горизонтальный скролл
	scrolling();

	formFiles();

	/* 
		================================================
		  
		Фиксированное меню
		
		================================================
	*/

	function fixedMenu() {
		Array.from(fixedElements);

		if (!headerTop) return;

		const isFixed = window.scrollY > 50;

		if (isFixed) {
			headerTop.classList.add(headerTopFixed);
		} else {
			headerTop.classList.remove(headerTopFixed);
		}
	}

	window.addEventListener('scroll', fixedMenu);
	window.addEventListener('resize', fixedMenu);

	/* 
		================================================
		  
		Галереи
		
		================================================
	*/

	function gallery() {
		let popupState = false;

		document.querySelectorAll('.text-block img:not([src$=svg])').forEach(item => {
			if (!item.closest('[data-gallery]')) {
				item.insertAdjacentHTML(
					'beforebegin',
					`<a href="${item.currentSrc}" data-gallery></a>`
				);
				item.previousElementSibling.appendChild(item);
			}
		});

		let galleries = document.querySelectorAll('[data-gallery]');

		if (galleries.length) {
			galleries.forEach(gallery => {
				if (!gallery.classList.contains('gallery_init')) {
					let selector = false;

					if (gallery.querySelectorAll('[data-gallery-item]').length) {
						selector = '[data-gallery-item]';
					} else if (gallery.classList.contains('swiper-wrapper')) {
						selector = '.swiper-slide>a';
					} else if (gallery.tagName == 'A') {
						selector = false;
					} else {
						selector = 'a';
					}

					lightGallery(gallery, {
						plugins: [lgZoom, lgThumbnail],
						licenseKey: '7EC452A9-0CFD441C-BD984C7C-17C8456E',
						speed: 300,
						selector: selector,
						mousewheel: true,
						zoomFromOrigin: false,
						mobileSettings: {
							controls: false,
							showCloseIcon: true,
							download: true,
						},
						subHtmlSelectorRelative: true,
					});

					gallery.classList.add('gallery_init');

					gallery.addEventListener('lgBeforeOpen', () => {
						if (body.classList.contains(bodyOpenModalClass)) {
							popupState = true;
						}

						body.style.paddingRight = getScrollBarWidth$1() + 'px';
						changeScrollbarPadding(false);
						hideScrollbar();
						changeScrollbarGutter();
					});

					gallery.addEventListener('lgBeforeClose', () => {
						body.classList.remove(bodyOpenModalClass);

						setTimeout(() => {
							if (!menu.classList.contains(menuActive) && !popupState) {
								body.style.paddingRight = '0';
								body.classList.remove('no-scroll');
							}

							showScrollbar();
						}, 400);

					});
				}
			});
		}
	}

	/* 
		================================================
		  
		Карты
		
		================================================
	*/


	function map() {
		let spinner = document.querySelectorAll('.loader');
		let check_if_load = false;

		function loadScript(url, callback) {
			let script = document.createElement("script");
			if (script.readyState) {
				script.onreadystatechange = function () {
					if (script.readyState == "loaded" || script.readyState == "complete") {
						script.onreadystatechange = null;
						callback();
					}
				};
			} else {
				script.onload = function () {
					callback();
				};
			}

			script.src = url;
			document.getElementsByTagName("head")[0].appendChild(script);
		}

		function initMap() {
			loadScript("https://api-maps.yandex.ru/2.1/?apikey=5b7736c7-611f-40ce-a5a8-b7fd86e6737c&lang=ru_RU&amp;loadByRequire=1", function () {
				ymaps.load(init);
			});
			check_if_load = true;
		}

		if (document.querySelectorAll('.map').length) {
			let observer = new IntersectionObserver(function (entries) {
				if (entries[0]['isIntersecting'] === true) {
					if (!check_if_load) {
						spinner.forEach(element => {
							element.classList.add('is-active');
						});
						if (entries[0]['intersectionRatio'] > 0.2) {
							initMap();
						}
					}
				}
			}, {
				threshold: [0, 0.5, 1]
			});

			observer.observe(document.querySelector('.map'));
		}
	}

	function waitForTilesLoad(layer) {
		return new ymaps.vow.Promise(function (resolve, reject) {
			let tc = getTileContainer(layer), readyAll = true;
			tc.tiles.each(function (tile, number) {
				if (!tile.isReady()) {
					readyAll = false;
				}
			});
			if (readyAll) {
				resolve();
			} else {
				tc.events.once("ready", function () {
					resolve();
				});
			}
		});
	}

	function getTileContainer(layer) {
		for (let k in layer) {
			if (layer.hasOwnProperty(k)) {
				if (layer[k] instanceof ymaps.layer.tileContainer.CanvasContainer || layer[k] instanceof ymaps.layer.tileContainer.DomContainer) {
					return layer[k];
				}
			}
		}
		return null;
	}

	window.waitForTilesLoad = waitForTilesLoad;
	window.getTileContainer = getTileContainer;

	// 
	// 
	// 
	// 
	// Анимации 

	// Плавное появление
	const fadeIn = (el, isItem = false, display, timeout = 400) => {

		let elements = isItem ? el : document.querySelectorAll(el);

		if (elements.length > 0) {
			elements.forEach(element => {
				element.style.opacity = 0;
				element.style.display = 'block';
				element.style.transition = `opacity ${timeout}ms`;
				setTimeout(() => {
					element.style.opacity = 1;
				}, 10);
			});
		} else {
			el.style.opacity = 0;
			el.style.display = 'block';
			el.style.transition = `opacity ${timeout}ms`;
			setTimeout(() => {
				el.style.opacity = 1;
			}, 10);
		}
	};

	// Плавное исчезание
	const fadeOut = (el, isItem = false, timeout = 400) => {
		let elements = isItem ? el : document.querySelectorAll(el);

		if (elements.length > 0) {
			elements.forEach(element => {
				element.style.opacity = 1;
				element.style.transition = `opacity ${timeout}ms`;
				element.style.opacity = 0;
				setTimeout(() => {
					element.style.display = 'none';
				}, timeout);
				setTimeout(() => {
					element.removeAttribute('style');
				}, timeout + 400);
			});
		} else {
			el.style.opacity = 1;
			el.style.transition = `opacity ${timeout}ms`;
			el.style.opacity = 0;
			setTimeout(() => {
				el.style.display = 'none';
			}, timeout);
			setTimeout(() => {
				el.removeAttribute('style');
			}, timeout + 400);
		}
	};

	// Плавно скрыть с анимацией слайда 
	const _slideUp$1 = (target, duration = 400, showmore = 0) => {
		if (target && !target.classList.contains('_slide')) {
			target.classList.add('_slide');
			target.style.transitionProperty = 'height, margin, padding';
			target.style.transitionDuration = duration + 'ms';
			target.style.height = `${target.offsetHeight}px`;
			target.offsetHeight;
			target.style.overflow = 'hidden';
			target.style.height = showmore ? `${showmore}px` : `0px`;
			target.style.paddingTop = 0;
			target.style.paddingBottom = 0;
			target.style.marginTop = 0;
			target.style.marginBottom = 0;
			window.setTimeout(() => {
				target.style.display = !showmore ? 'none' : 'block';
				!showmore ? target.style.removeProperty('height') : null;
				target.style.removeProperty('padding-top');
				target.style.removeProperty('padding-bottom');
				target.style.removeProperty('margin-top');
				target.style.removeProperty('margin-bottom');
				!showmore ? target.style.removeProperty('overflow') : null;
				target.style.removeProperty('transition-duration');
				target.style.removeProperty('transition-property');
				target.classList.remove('_slide');
				document.dispatchEvent(new CustomEvent("slideUpDone", {
					detail: {
						target: target
					}
				}));
			}, duration);
		}
	};

	// Плавно показать с анимацией слайда 
	const _slideDown$1 = (target, duration = 400) => {
		if (target && !target.classList.contains('_slide')) {
			target.style.removeProperty('display');
			let display = window.getComputedStyle(target).display;
			if (display === 'none') display = 'block';
			target.style.display = display;
			let height = target.offsetHeight;
			target.style.overflow = 'hidden';
			target.style.height = 0;
			target.style.paddingTop = 0;
			target.style.paddingBottom = 0;
			target.style.marginTop = 0;
			target.style.marginBottom = 0;
			target.offsetHeight;
			target.style.transitionProperty = "height, margin, padding";
			target.style.transitionDuration = duration + 'ms';
			target.style.height = height + 'px';
			target.style.removeProperty('padding-top');
			target.style.removeProperty('padding-bottom');
			target.style.removeProperty('margin-top');
			target.style.removeProperty('margin-bottom');
			window.setTimeout(() => {
				target.style.removeProperty('height');
				target.style.removeProperty('overflow');
				target.style.removeProperty('transition-duration');
				target.style.removeProperty('transition-property');
			}, duration);
		}
	};

	// Плавно изменить состояние между _slideUp и _slideDown
	const _slideToggle = (target, duration = 400) => {
		if (target && isHidden(target)) {
			return _slideDown$1(target, duration);
		} else {
			return _slideUp$1(target, duration);
		}
	};

	//
	//
	//
	//
	// Работа с url

	// Получение хэша
	function getHash() {
		return location.hash ? location.hash.replace('#', '') : '';
	}

	// Удаление хэша
	function removeHash() {
		setTimeout(() => {
			history.pushState("", document.title, window.location.pathname + window.location.search);
		}, 100);
	}

	// Очистка input и textarea при закрытии модалки и отправки формы / Удаление классов ошибки
	let inputs = document.querySelectorAll('input, textarea');

	function clearInputs() {
		inputs.forEach(element => {
			element.classList.remove('wpcf7-not-valid', 'error');
		});
	}

	inputs.forEach(input => {
		const parentElement = input.parentElement;
		const submitButton = input.closest('form')?.querySelector('.submit');

		const updateActiveState = () => {
			if (input.type === 'text' || input.type === 'date') {
				parentElement.classList.toggle('active', input.value.length > 0);
			}
		};

		const resetValidation = () => {
			input.setCustomValidity('');
			submitButton.disabled = false;
		};

		input.addEventListener('keyup', updateActiveState);
		input.addEventListener('change', () => {
			input.classList.remove('wpcf7-not-valid');
			updateActiveState();
		});

		input.addEventListener('input', () => {
			// Форматирование чисел
			if (input.getAttribute('data-number')) {
				input.value = input.value.replace(/\D/g, '').replace(/(\d)(?=(\d{3})+$)/g, '$1 ');
			}

			// Валидация email
			if (input.type === 'email') {
				input.value = input.value.replace(/[^0-9a-zA-Zа-яА-ЯёЁ@.-]+/g, '');
			}

			// Валидация имени
			const nameAttr = input.name?.toLowerCase() || '';
			const placeholder = input.placeholder?.toLowerCase() || '';
			const fioKeywords = ['имя', 'фамилия', 'отчество'];
			const isFIO = nameAttr.includes('name') || fioKeywords.some(word => placeholder.includes(word));

			if (isFIO) {
				input.value = input.value.replace(/[^а-яА-ЯёЁa-zA-Z ]/g, '');
				return;
			}
		});

		if (input.type === 'tel' || input.type === 'email') {
			input.addEventListener('input', resetValidation);
		}
	});

	// Проверка формы перед отправкой
	function initFormValidation(form) {
		// Функция для проверки обязательных полей на выбор
		const checkRequiredChoice = () => {
			let requiredChoice = form.querySelectorAll('[data-required-choice]');
			let hasValue = Array.from(requiredChoice).some(input => input.value.trim() !== '' && input.value !== '+7 ');

			requiredChoice.forEach(input => {
				if (!hasValue) {
					input.setAttribute('required', 'true');
				} else {
					input.removeAttribute('required');
				}
			});
		};

		// Проверка при загрузке страницы
		checkRequiredChoice();

		form.addEventListener('submit', (e) => {
			let isValid = true;

			form.querySelectorAll('input[type="tel"]').forEach(input => {
				if (input.value.length < 17 && input.value.length > 3) {
					input.setCustomValidity('Телефон должен содержать 11 цифр');
					input.reportValidity();
					isValid = false;
				} else {
					input.setCustomValidity('');
				}
			});

			// Проверяем обязательные поля на выбор перед отправкой
			checkRequiredChoice();

			if (!isValid || !form.checkValidity()) e.preventDefault();
		});

		// Обновление `required` при вводе
		let requiredChoice = form.querySelectorAll('[data-required-choice]');

		requiredChoice.forEach(input => {
			input.addEventListener('input', checkRequiredChoice);
		});
	}

	document.querySelectorAll('form').forEach(initFormValidation);

	/* 
		================================================
		  
		Попапы
		
		================================================
	*/

	function popup() {
		document.querySelectorAll('.popup');

		document.querySelectorAll('[data-modal]').forEach(button => {
			button.addEventListener('click', function () {
				let [dataModal, dataTab] = button.getAttribute('data-modal').split('#');

				let popup = document.querySelector(`#${dataModal}`);
				if (!popup) return

				// Удалить хеш текущего попапа
				if (getHash()) {
					history.pushState("", document.title, (window.location.pathname + window.location.search).replace(getHash(), ''));
				}

				hideScrollbar();

				// Добавить хеш нового попапа
				if (!window.location.hash.includes(dataModal)) {
					window.location.hash = dataModal;
				}

				fadeIn(popup, true);

				// открыть таб в попапе
				if (dataTab) {
					document.querySelector(`[data-href="#${dataTab}"]`).click();
				}
			});
		});

		// Открытие модалки по хешу
		window.addEventListener('load', () => {
			const hash = window.location.hash.replace('#', '');
			if (hash) {
				const popup = document.querySelector(`.popup[id="${hash}"]`);
				if (popup) {
					setTimeout(() => {
						hideScrollbar();
						fadeIn(popup, true);
					}, 500);
				}
			}
		});


		// 
		// 
		// Закрытие модалок

		function closeModal(removeHashFlag = true) {
			fadeOut('.popup');
			document.querySelectorAll('[data-modal]').forEach(button => button.disabled = true);
			body.classList.remove(bodyOpenModalClass);

			setTimeout(() => {
				let modalInfo = document.querySelector('.modal-info');
				if (modalInfo) {
					modalInfo.value = '';
				}

				showScrollbar();
				document.querySelectorAll('[data-modal]').forEach(button => button.disabled = false);
			}, 400);

			if (removeHashFlag) {
				history.pushState('', document.title, window.location.pathname + window.location.search);
			}

			clearInputs();

			setTimeout(() => {
				document.querySelectorAll('.scrollbar-auto').forEach(item => {
					item.classList.remove('scrollbar-auto');
				});
			}, 500);
		}

		// Закрытие модалки при клике на крестик
		document.querySelectorAll('[data-popup-close]').forEach(element => {
			element.addEventListener('click', closeModal);
		});

		// Закрытие модалки при клике вне области контента
		let popupDialog = document.querySelectorAll('.popup__dialog');

		window.addEventListener('click', function (e) {
			popupDialog.forEach(popup => {
				if (e.target === popup) {
					closeModal();
				}
			});
		});

		// Закрытие модалки при клике ESC
		window.onkeydown = function (event) {
			if (event.key === 'Escape' && document.querySelectorAll('.lg-show').length === 0) {
				closeModal();
			}
		};

		// Навигация назад/вперёд
		let isAnimating = false;

		window.addEventListener('popstate', async () => {
			if (isAnimating) {
				await new Promise(resolve => {
					const checkAnimation = () => {
						if (!document.body.classList.contains('_fade')) {
							resolve();
						} else {
							setTimeout(checkAnimation, 50);
						}
					};
					checkAnimation();
				});
			}

			const hash = window.location.hash.replace('#', '');
			if (hash) {
				const popup = document.querySelector(`.popup[id="${hash}"]`);
				if (popup) {
					hideScrollbar();
					isAnimating = true;
					await fadeIn(popup, true);
					isAnimating = false;
				}
			} else {
				isAnimating = true;
				await closeModal(false);
				isAnimating = false;
			}
		});
	}

	/* 
		================================================
		  
		Звёздный рейтинг
		
		================================================
	*/

	function rating() {
		const ratings = document.querySelectorAll('.rating__item');

		ratings.forEach(initRating);

		function initRating(rating) {
			const ratingActive = rating.querySelector('.rating__active');
			const ratingValue = rating.querySelector('.rating__value');
			const ratingInputs = rating.querySelectorAll('input');

			setRatingActiveWidth(ratingActive, ratingValue, ratingInputs.length);

			if (rating.classList.contains('rating__item_set')) {
				setRating(rating, ratingActive, ratingValue, ratingInputs.length);
			}
		}

		function setRatingActiveWidth(ratingActive, ratingValue, totalStars, index = null) {
			const value = index !== null ? index : ratingValue.innerHTML;
			const ratingActiveWidth = (100 / totalStars) * value;
			ratingActive.style.width = `${ratingActiveWidth}%`;
		}

		function setRating(rating, ratingActive, ratingValue, totalStars) {
			const ratingItems = rating.querySelectorAll('.rating__items input');

			ratingItems.forEach((ratingItem, index) => {
				ratingItem.addEventListener('mouseenter', () => {
					setRatingActiveWidth(ratingActive, ratingValue, totalStars, ratingItem.value);
				});

				ratingItem.addEventListener('mouseleave', () => {
					setRatingActiveWidth(ratingActive, ratingValue, totalStars);
				});

				ratingItem.addEventListener('click', () => {
					ratingValue.innerHTML = index + 1;
					setRatingActiveWidth(ratingActive, ratingValue, totalStars);
				});
			});
		}
	}

	/* 
		================================================
		  
		Отправка форм
		
		================================================
	*/

	function form() {
		const allForms = document.querySelectorAll('form');

		allForms.forEach(form => {
			if (!form.classList.contains('wpcf7-form') && !form.classList.contains('catalog__left')) {
				if (!form.hasAttribute('enctype')) {
					form.setAttribute('enctype', 'multipart/form-data');
				}

				form.addEventListener('submit', formSend);

				async function formSend(e) {
					e.preventDefault();

					let formData = new FormData(form);
					form.classList.add('sending');

					try {
						let mailResponse = await fetch('/mail.php', {
							method: 'POST',
							body: formData
						});

						let wpFormData = new FormData(form);
						wpFormData.append('action', 'submit_request');

						let wpResponse = await fetch('/wp-admin/admin-ajax.php', {
							method: 'POST',
							body: wpFormData,
							credentials: 'same-origin'
						});

						let wpResult = await wpResponse.json();

						if (mailResponse.ok && wpResult.success) {
							fadeOut('.popup');

							setTimeout(() => {
								fadeIn('.popup-thank');
							}, 1000);

							setTimeout(() => {
								fadeOut('.popup');
							}, 3000);

							setTimeout(() => {
								body.classList.remove('no-scroll');
							}, 3500);

							form.reset();
						} else {
							console.error('Ошибка при отправке:', {
								mail: mailResponse,
								wp: wpResult
							});
						}
					} catch (error) {
						console.error('Ошибка сети:', error);
					} finally {
						form.classList.remove('sending');
					}
				}
			}
		});
	}

	/* 
		================================================
		  
		Перенос данных в элементы
		
		================================================
	*/

	function text() {
		let dataText = document.querySelectorAll('[data-text]');

		dataText.forEach(dataTextItem => {
			dataTextItem.addEventListener('click', function () {
				let text = this.getAttribute('data-text').replace(/\s{2,}/g, ' ').split(';');

				text.forEach(element => {
					let items = element.split('|'); // Если несколько 

					items.forEach(item => {
						let parent = item.split(',')[0].trim(); // Родитель
						let children = item.split(',')[1].trim(); // Дочерний (из которого берется контент)
						let where = item.split(',')[2].trim(); // Куда вставлять
						let issetParent = this.closest(parent).length != 0; // Если есть родитель

						let isClassMatch = this.classList.contains(children.substr(1)); // Если класс во втором параметре совпадает с классом элемента, на который кликнули

						let isNotInput = document.querySelector(where).tagName != 'INPUT'; // Если тег, куда будет вставляться контент != input

						let searchInChildren;

						let target = this.closest(parent).querySelector(children);

						searchInChildren = target ? target[isNotInput ? 'innerHTML' : 'value'] : false; // Если элемент, из которого берется контент находится внутри элемента, на который кликнули

						let searchInThis = document.querySelector(children).innerHTML; // Если элемент, из которого берется контент равен элементу, на который кликнули

						// Если нужно переместить весь блок целиком 
						if (parent == children) {
							document.querySelector(where).innerHTML = `${this.closest(parent).outerHTML}`;
						}

						// Если нужно вставить в src 
						if (
							document.querySelector(where).tagName == 'IMG' &&
							document.querySelector(children).tagName == 'IMG'
						) {
							document.querySelector(where).style.opacity = '0';
							document.querySelector(where).src = document.querySelector(children).getAttribute('src');

							setTimeout(() => {
								document.querySelector(where).style.opacity = '1';
							}, 300);

						} else {
							if ((issetParent && isNotInput && isClassMatch && searchInThis) || (!issetParent && isNotInput && isClassMatch && searchInThis)) {
								document.querySelector(where).innerHTML = searchInThis;
							}

							if ((issetParent && isNotInput && !isClassMatch && searchInChildren) || (!issetParent && isNotInput && !isClassMatch && searchInChildren)) {
								document.querySelector(where).innerHTML = searchInChildren;
							}

							if ((issetParent && !isNotInput && isClassMatch && searchInThis) || (!issetParent && !isNotInput && isClassMatch && searchInThis)) {
								document.querySelector(where).value = searchInThis;
							}

							if ((issetParent && !isNotInput && !isClassMatch && searchInChildren) || (!issetParent && !isNotInput && !isClassMatch && searchInChildren)) {
								document.querySelector(where).value = searchInChildren;
							}

							if (where.charAt(0) == 'a') {
								// Если нужно вставить в href 
								document.querySelector(where).setAttribute('href', document.querySelector(children).getAttribute('href'));
							}
						}
					});
				});
			});
		});
	}

	text();

	/* 
		================================================
		  
		Плавная прокрутка
		
		================================================
	*/

	function scroll() {
		let headerScroll = 0;
		const scrollLinks = document.querySelectorAll('.scroll, .menu a');

		if (scrollLinks.length) {
			scrollLinks.forEach(link => {
				link.addEventListener('click', e => {
					const target = link.hash;

					if (target && target !== '#') {
						const scrollBlock = document.querySelector(target);
						e.preventDefault();

						if (scrollBlock) {
							headerScroll = (window.getComputedStyle(scrollBlock).paddingTop === '0px') ? -40 : 0;

							scrollToSmoothly(
								offset(scrollBlock).top - parseInt(headerTop.clientHeight - headerScroll),
								400
							);

							removeHash();
							menu.classList.remove(menuActive);
							menuLink.classList.remove('active');
							body.classList.remove('no-scroll');
						} else {
							let [baseUrl, hash] = link.href.split('#');
							if (window.location.href !== baseUrl && hash) {
								link.setAttribute('href', `${baseUrl}?link=${hash}`);
								window.location = link.getAttribute('href');
							}
						}
					}
				});
			});
		}

		document.addEventListener('DOMContentLoaded', () => {
			const urlParams = new URLSearchParams(window.location.search);
			const link = urlParams.get('link');

			if (link) {
				const scrollBlock = document.getElementById(link);
				if (scrollBlock) {
					headerScroll = (window.getComputedStyle(scrollBlock).paddingTop === '0px') ? -40 : 0;

					scrollToSmoothly(
						offset(scrollBlock).top - parseInt(headerTop.clientHeight - headerScroll),
						400
					);

					urlParams.delete('link');
					window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`);
				}
			}
		});
	}

	/* 
		================================================
		  
		Табы
		
		================================================
	*/

	function tab() {
		let tabs = document.querySelectorAll('[data-tabs]');
		let tabsActiveHash = [];

		if (tabs.length > 0) {
			let hash = getHash();

			if (hash && hash.startsWith('tab-')) {
				tabsActiveHash = hash.replace('tab-', '').split('-');
			}

			tabs.forEach((tabsBlock, index) => {
				tabsBlock.classList.add('tab_init');
				tabsBlock.setAttribute('data-tabs-index', index);
				tabsBlock.addEventListener("click", setTabsAction);
				initTabs(tabsBlock);
			});

			let mdQueriesArray = dataMediaQueries(tabs, "tabs");

			if (mdQueriesArray && mdQueriesArray.length) {
				mdQueriesArray.forEach(mdQueriesItem => {
					mdQueriesItem.matchMedia.addEventListener("change", function () {
						setTitlePosition(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
					});
					setTitlePosition(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
				});
			}
		}

		function setTitlePosition(tabsMediaArray, matchMedia) {
			tabsMediaArray.forEach(tabsMediaItem => {
				tabsMediaItem = tabsMediaItem.item;
				let tabsTitles = tabsMediaItem.querySelector('[data-tabs-header]');
				let tabsTitleItems = tabsMediaItem.querySelectorAll('[data-tabs-title]');
				let tabsContent = tabsMediaItem.querySelector('[data-tabs-body]');
				let tabsContentItems = tabsMediaItem.querySelectorAll('[data-tabs-item]');

				tabsTitleItems = Array.from(tabsTitleItems).filter(item => item.closest('[data-tabs]') === tabsMediaItem);
				tabsContentItems = Array.from(tabsContentItems).filter(item => item.closest('[data-tabs]') === tabsMediaItem);
				tabsContentItems.forEach((tabsContentItem, index) => {
					if (matchMedia.matches) {
						tabsContent.append(tabsTitleItems[index]);
						tabsContent.append(tabsContentItem);
						tabsMediaItem.classList.add('tab-spoller');
					} else {
						tabsTitles.append(tabsTitleItems[index]);
						tabsMediaItem.classList.remove('tab-spoller');
					}
				});
			});
		}

		function initTabs(tabsBlock) {
			let tabsTitles = tabsBlock.querySelectorAll('[data-tabs-header]>*');
			let tabsContent = tabsBlock.querySelectorAll('[data-tabs-body]>*');
			let tabsBlockIndex = tabsBlock.dataset.tabsIndex;
			let tabsActiveHashBlock = tabsActiveHash[0] == tabsBlockIndex;

			if (tabsActiveHashBlock) {
				let tabsActiveTitle = tabsBlock.querySelector('[data-tabs-header]>.active');
				tabsActiveTitle ? tabsActiveTitle.classList.remove('active') : null;
			}

			if (tabsContent.length) {
				tabsContent.forEach((tabsContentItem, index) => {
					tabsTitles[index].setAttribute('data-tabs-title', '');
					tabsContentItem.setAttribute('data-tabs-item', '');

					if (tabsActiveHashBlock && index == tabsActiveHash[1]) {
						tabsTitles[index].classList.add('active');
					}

					tabsContentItem.hidden = true;
				});

				if (!tabsBlock.querySelector('[data-tabs-header]>.active')) {
					tabsBlock.querySelector('[data-tabs-body]').children[0].hidden = false;
				} else {
					tabsBlock.querySelector('[data-tabs-body]').children[indexInParent(tabsBlock.querySelector('[data-tabs-header]>.active'))].hidden = false;
				}
			}
		}

		function setTabsStatus(tabsBlock) {
			let tabsTitles = tabsBlock.querySelectorAll('[data-tabs-title]');
			let tabsContent = tabsBlock.querySelectorAll('[data-tabs-item]');
			let tabsBlockIndex = tabsBlock.dataset.tabsIndex;

			function isTabsAnamate(tabsBlock) {
				if (tabsBlock.hasAttribute('data-tabs-animate')) {
					return tabsBlock.dataset.tabsAnimate > 0 ? Number(tabsBlock.dataset.tabsAnimate) : 500;
				}
			}

			let tabsBlockAnimate = isTabsAnamate(tabsBlock);

			if (tabsContent.length > 0) {
				let isHash = tabsBlock.hasAttribute('data-tabs-hash');

				tabsContent = Array.from(tabsContent).filter(item => item.closest('[data-tabs]') === tabsBlock);
				tabsTitles = Array.from(tabsTitles).filter(item => item.closest('[data-tabs]') === tabsBlock);
				tabsContent.forEach((tabsContentItem, index) => {
					if (tabsTitles[index].classList.contains('active')) {
						if (tabsBlockAnimate) {
							_slideDown(tabsContentItem, tabsBlockAnimate);
						} else {
							fadeIn(tabsContentItem, true);
							tabsContentItem.hidden = false;
						}
						if (isHash && !tabsContentItem.closest('.popup')) {
							setHash(`tab-${tabsBlockIndex}-${index}`);
						}
					} else {
						if (tabsBlockAnimate) {
							_slideUp(tabsContentItem, tabsBlockAnimate);
						} else {
							tabsContentItem.style.display = 'none';
							tabsContentItem.hidden = true;
						}
					}
				});
			}
		}

		function setTabsAction(e) {
			let el = e.target;

			if (el.closest('[data-tabs-title]') && !el.closest('[data-tabs-title]').classList.contains('active')) {
				let tabTitle = el.closest('[data-tabs-title]');
				let tabsBlock = tabTitle.closest('[data-tabs]');

				if (!tabTitle.classList.contains('active') && !tabsBlock.querySelector('._slide')) {
					let tabActiveTitle = tabsBlock.querySelectorAll('[data-tabs-title].active');
					tabActiveTitle.length ? tabActiveTitle = Array.from(tabActiveTitle).filter(item => item.closest('[data-tabs]') === tabsBlock) : null;
					tabActiveTitle.length ? tabActiveTitle[0].classList.remove('active') : null;
					tabTitle.classList.add('active');
					setTabsStatus(tabsBlock);

					scrollToSmoothly(offset(el.closest('[data-tabs]')).top - parseInt(headerTop.clientHeight));

				}

				e.preventDefault();
			}
		}

		// Переключение табов левыми кнопками (атрибут data-tab="") 
		let dataTabs = document.querySelectorAll('[data-tab]');

		dataTabs.forEach(button => {
			button.addEventListener('click', function () {
				document.querySelector(button.getAttribute('data-tab')).click();
				scrollToSmoothly(offset(document.querySelector(button.getAttribute('data-tab'))
				).top - parseInt(headerTop.clientHeight));
			});
		});
	}

	/* 
		================================================
		  
		Бургер
		
		================================================
	*/

	function burger() {
		if (menuLink) {
			let marginTop = 0;
			let isAnimating = false;

			menuLink.addEventListener('click', function (e) {
				if (isAnimating) return
				isAnimating = true;

				marginTop = headerTop.getBoundingClientRect().height + headerTop.getBoundingClientRect().y;
				menuLink.classList.toggle('active');
				menu.style.marginTop = marginTop + 'px';
				menu.classList.toggle(menuActive);

				if (menu.classList.contains(menuActive)) {
					hideScrollbar();
				} else {
					setTimeout(() => {
						showScrollbar();
					}, 400);
				}

				setTimeout(() => {
					isAnimating = false;
				}, 500);
			});

			function checkHeaderOffset() {
				if (isMobile()) {
					changeScrollbarPadding(false);
				} else {
					if (body.classList.contains(bodyOpenModalClass)) {
						changeScrollbarPadding();
					}
				}

				if (isDesktop()) {
					menu.removeAttribute('style');
				} else {
					if (marginTop != headerTop.getBoundingClientRect().height) {
						menu.style.marginTop = headerTop.getBoundingClientRect().height + 'px';
					}
				}
			}

			window.addEventListener('resize', throttle(checkHeaderOffset, 50));
			window.addEventListener('resize', throttle(checkHeaderOffset, 150));

			if (document.querySelector('.header__mobile')) {
				closeOutClick('.header__mobile', '.menu-link', 'active');
			}
		}
	}

	/* 
		================================================
		  
		Спойлеры
		
		================================================
	*/

	function spoller() {
		const spollersArray = document.querySelectorAll('[data-spollers]');

		if (spollersArray.length > 0) {
			document.addEventListener("click", setSpollerAction);

			// Получение обычных слойлеров
			const spollersRegular = Array.from(spollersArray).filter(function (item, index, self) {
				return !item.dataset.spollers.split(",")[0];
			});

			// Инициализация обычных слойлеров
			if (spollersRegular.length) {
				initSpollers(spollersRegular);
			}

			// Получение слойлеров с медиа-запросами
			let mdQueriesArray = dataMediaQueries(spollersArray, "spollers");

			if (mdQueriesArray && mdQueriesArray.length) {
				mdQueriesArray.forEach(mdQueriesItem => {
					mdQueriesItem.matchMedia.addEventListener("change", function () {
						initSpollers(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
					});
					initSpollers(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
				});
			}

			// Инициализация
			function initSpollers(spollersArray, matchMedia = false) {
				spollersArray.forEach(spollersBlock => {
					spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;

					if (matchMedia.matches || !matchMedia) {
						spollersBlock.classList.add('_spoller-init');
						initSpollerBody(spollersBlock);
					} else {
						spollersBlock.classList.remove('_spoller-init');
						initSpollerBody(spollersBlock, false);
					}
				});
			}

			// Работа с контентом
			function initSpollerBody(spollersBlock, hideSpollerBody = true) {
				let spollerItems = spollersBlock.querySelectorAll('details');

				if (spollerItems.length) {
					spollerItems.forEach(spollerItem => {
						let spollerTitle = spollerItem.querySelector('summary');

						if (hideSpollerBody) {
							spollerTitle.removeAttribute('tabindex');

							if (!spollerItem.hasAttribute('data-open')) {
								spollerItem.open = false;

								if (spollerTitle.nextElementSibling) {
									spollerTitle.nextElementSibling.style.display = 'none';
								}
							} else {
								spollerTitle.classList.add('active');
								spollerItem.open = true;
							}

							spollerTitle.removeAttribute('disabled');

						} else {
							spollerTitle.setAttribute('disabled', '');
							spollerTitle.setAttribute('tabindex', '-1');
							spollerTitle.classList.remove('active');
							spollerItem.open = true;

							if (spollerTitle.nextElementSibling) {
								spollerTitle.nextElementSibling.style.display = 'block';
							}
						}
					});
				}
			}

			function setSpollerAction(e) {
				const el = e.target;

				if (el.closest('summary') && el.closest('[data-spollers]')) {
					if (el.tagName != 'A') {
						e.preventDefault();
					} else {
						return false;
					}

					const spollersBlock = el.closest('[data-spollers]');
					if (spollersBlock.classList.contains('_disabled-click')) return

					spollersBlock.classList.add('_disabled-click');

					setTimeout(() => {
						spollersBlock.classList.remove('_disabled-click');
					}, 500);

					if (spollersBlock.classList.contains('_spoller-init')) {
						const spollerTitle = el.closest('summary');
						const spollerBlock = spollerTitle.closest('details');
						const oneSpoller = spollersBlock.hasAttribute('data-one-spoller');
						const scrollSpoller = spollerBlock.hasAttribute('data-spoller-scroll');
						const spollerSpeed = spollersBlock.dataset.spollersSpeed ? parseInt(spollersBlock.dataset.spollersSpeed) : 500;

						if (!spollersBlock.querySelectorAll('._slide').length) {
							if (oneSpoller && !spollerBlock.open) {
								hideSpollersBody(spollersBlock);
							}

							!spollerBlock.open ? spollerBlock.open = true : setTimeout(() => { spollerBlock.open = false; }, spollerSpeed);

							spollerTitle.classList.toggle('active');
							_slideToggle(spollerTitle.nextElementSibling, spollerSpeed);

							if (scrollSpoller && spollerTitle.classList.contains('active')) {
								const scrollSpollerValue = spollerBlock.dataset.spollerScroll;
								const scrollSpollerOffset = +scrollSpollerValue ? +scrollSpollerValue : 0;
								const scrollSpollerNoHeader = spollerBlock.hasAttribute('data-spoller-scroll-noheader') ? document.querySelector('.header').offsetHeight : 0;

								window.scrollTo({
									top: spollerBlock.offsetTop - (scrollSpollerOffset + scrollSpollerNoHeader),
									behavior: 'smooth'
								});
							}
						}
					}
				}

				// Закрытие при клике вне спойлера
				if (!el.closest('[data-spollers]')) {
					const spollersClose = document.querySelectorAll('[data-spoller-close]');

					if (spollersClose.length) {
						spollersClose.forEach(spollerClose => {
							const spollersBlock = spollerClose.closest('[data-spollers]');
							const spollerCloseBlock = spollerClose.parentNode;

							if (spollersBlock.classList.contains('_spoller-init')) {
								const spollerSpeed = spollersBlock.dataset.spollersSpeed ? parseInt(spollersBlock.dataset.spollersSpeed) : 500;
								spollerClose.classList.remove('active');
								_slideUp(spollerClose.nextElementSibling, spollerSpeed);
								setTimeout(() => { spollerCloseBlock.open = false; }, spollerSpeed);
							}
						});
					}
				}
			}

			function hideSpollersBody(spollersBlock) {
				const spollerActiveBlock = spollersBlock.querySelector('details[open]');

				if (spollerActiveBlock && !spollersBlock.querySelectorAll('._slide').length) {
					const spollerActiveTitle = spollerActiveBlock.querySelector('summary');
					const spollerSpeed = spollersBlock.dataset.spollersSpeed ? parseInt(spollersBlock.dataset.spollersSpeed) : 500;
					spollerActiveTitle.classList.remove('active');
					_slideUp(spollerActiveTitle.nextElementSibling, spollerSpeed);
					setTimeout(() => { spollerActiveBlock.open = false; }, spollerSpeed);
				}
			}
		}
	}

	burger();
	gallery();
	map();
	popup();
	rating();
	scroll();
	tab();
	text();
	fixedMenu();
	form();
	spoller();

	//
	//
	//
	//
	// Общие скрипты

	// 
	// 
	// Слайдеры

	// Проекты
	if (document.querySelector('.project-container')) {

		new Swiper('.project-container', {
			loop: true,
			centeredSlides: true,
			spaceBetween: 20,
			slidesPerView: 'auto',
			keyboard: {
				enabled: true,
				onlyInViewport: false,
			},
			navigation: {
				nextEl: '.project__next',
				prevEl: '.project__prev',
			},
			speed: 500,
		});

	}

	// Карточка
	if (document.querySelector('.card-container')) {
		new Swiper('.card-container', {
			// autoplay: {
			// 	delay: 6000,
			// }, 
			loop: true,
			effect: 'fade',
			fadeEffect: {
				crossFade: true
			},
			pagination: {
				el: '.card__pagination',
				type: 'bullets',
				clickable: true,
			},
			keyboard: {
				enabled: true,
				onlyInViewport: false,
			},
			speed: 500,
		});
	}


	// Добавить активный цвет товара в модалку
	let cardItemCheckbox = document.querySelector('.card__item-checkboxes');
	let modalInfo = document.querySelector('.popup .modal-info');

	if (cardItemCheckbox && modalInfo) {
		modalInfo.value = cardItemCheckbox.querySelector('input:checked').value;
	}

})();
//# sourceMappingURL=script.js.map
