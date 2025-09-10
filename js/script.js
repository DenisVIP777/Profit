$('document').ready(function(){
	
});

"use strict"

const isMobile = {
	Android: function() {
		return navigator.userAgent.match(/Android/i);
	},
	BlackBerry: function() {
		return navigator.userAgent.match(/BlackBerry/i);
	},
	iOS: function() {
		return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	},
	Opera: function() {
		return navigator.userAgent.match(/Opera Mini/i);
	},
	Windows: function() {
		return navigator.userAgent.match(/IEMobile/i);
	},
	any: function() {
		return (
			isMobile.Android() || 
			isMobile.BlackBerry() || 
			isMobile.iOS() || 
			isMobile.Opera() || 
			isMobile.Windows());
	}
};

//Прокрутка при клике

//Для начала я ищу все объекты с классом .menu__link, но с data-атрибутом data-goto
const menuLinks = document.querySelectorAll('.menu__link[data-goto]');
//Проверяю есть ли у нас что нибудь из этого
if (menuLinks.length > 0) {
	//Пробежимся по ним
	menuLinks.forEach(menuLink => {
		//И вешаем событие клик при котором вызываем функцию onMenuLinkClick
		menuLink.addEventListener("click", onMenuLinkClick);
	});

	function onMenuLinkClick(e) {
		//Сдесь нам нужно получить объект на который мы кликаем
		const menuLink = e.target;
		//Далее важное условие
		//во первых проверяю заполнен ли этот дата атрибут, и проверяю существует ли объект на который ссылается данный дата-атрибут
		if (menuLink.dataset.goto && document.querySelector(menuLink.dataset.goto)) {
			//Далее получаю в константу этот объект
			const gotoBlock = document.querySelector(menuLink.dataset.goto);
			//Далее нам нужно высчитать положение этого объекта с учётом высоты шапки
			//с помощью getBoundingClientRect().top я получаю его местоположение на странице в пикселях, далее я прибавляю колличество прокрученных пикселей
			//и далее я убавляю высоту шапки
			const gotoBlockValue = gotoBlock.getBoundingClientRect().top + pageYOffset - document.querySelector('header').offsetHeight;


			//Закрытие меню при клике на li
			if (iconMenu.classList.contains('_active')) {
				document.body.classList.remove('_lock');
				iconMenu.classList.remove('_active');
				menuBody.classList.remove('_active');
			}

			//Далее код который заставит скролл прокрутиться к нужному месту
			window.scrollTo({
				top: gotoBlockValue,
				behavior: "smooth"
			});
			//добавим e.preventDefault(); для того чтобы отключить работу ссылок
			e.preventDefault();
		}
	}
}

//Меню бургер
const iconMenu = document.querySelector('.menu__icon');
const menuBody = document.querySelector('.menu__body');
const headerLogo = document.querySelector('.header__logo');
if(iconMenu) {
	iconMenu.addEventListener("click", function(e) {
		document.body.classList.toggle('_lock');
		iconMenu.classList.toggle('_active');
		menuBody.classList.toggle('_active');
		headerLogo.classList.toggle('_active');
    mobileForm.classList.remove('_active');
	});
}

/*script open/close mobile-form*/
const mobileForm = document.querySelector('.menu__mobile-form');
const headerButton = document.querySelector('.header__button');
const buttonOpenMobileForm = document.querySelector('.main-section__button-open-form');
var mobileFormDisplayStyle = window.getComputedStyle(mobileForm).display;
if (!(mobileFormDisplayStyle === 'none')) {
  
  headerButton.addEventListener('click', function (event) {
    mobileForm.classList.add('_active');

    document.body.classList.add('_lock');
    iconMenu.classList.add('_active');
    headerLogo.classList.add('_active');
  });
  if (buttonOpenMobileForm) {
    buttonOpenMobileForm.addEventListener('click', function (event) {
      mobileForm.classList.add('_active');

      menuBody.classList.add('_active');
      document.body.classList.add('_lock');
      iconMenu.classList.add('_active');
      headerLogo.classList.add('_active');
    });
  }
}

/**
 * @typedef {Object} dNode
 * @property {HTMLElement} parent
 * @property {HTMLElement} element
 * @property {HTMLElement} to
 * @property {string} breakpoint
 * @property {string} order
 * @property {number} index
 */

/**
 * @typedef {Object} dMediaQuery
 * @property {string} query
 * @property {number} breakpoint
 */

/**
 * @param {'min' | 'max'} type
 */
function useDynamicAdapt(type = 'max') {
    const className = '_dynamic_adapt_'
    const attrName = 'data-da'
  
    /** @type {dNode[]} */
    const dNodes = getDNodes()
  
    /** @type {dMediaQuery[]} */
    const dMediaQueries = getDMediaQueries(dNodes)
  
    dMediaQueries.forEach((dMediaQuery) => {
      const matchMedia = window.matchMedia(dMediaQuery.query)
      // массив объектов с подходящим брейкпоинтом
      const filteredDNodes = dNodes.filter(({ breakpoint }) => breakpoint === dMediaQuery.breakpoint)
      const mediaHandler = getMediaHandler(matchMedia, filteredDNodes)
      matchMedia.addEventListener('change', mediaHandler)
  
      mediaHandler()
    })
  
    function getDNodes() {
      const result = []
      const elements = [...document.querySelectorAll(`[${attrName}]`)]
  
      elements.forEach((element) => {
        const attr = element.getAttribute(attrName)
        const [toSelector, breakpoint, order] = attr.split(',').map((val) => val.trim())
  
        const to = document.querySelector(toSelector)
  
        if (to) {
          result.push({
            parent: element.parentElement,
            element,
            to,
            breakpoint: breakpoint ?? '767',
            order: order !== undefined ? (isNumber(order) ? Number(order) : order) : 'last',
            index: -1,
          })
        }
      })
  
      return sortDNodes(result)
    }
  
    /**
     * @param {dNode} items
     * @returns {dMediaQuery[]}
     */
    function getDMediaQueries(items) {
      const uniqItems = [...new Set(items.map(({ breakpoint }) => `(${type}-width: ${breakpoint}px),${breakpoint}`))]
  
      return uniqItems.map((item) => {
        const [query, breakpoint] = item.split(',')
  
        return { query, breakpoint }
      })
    }
  
    /**
     * @param {MediaQueryList} matchMedia
     * @param {dNodes} items
     */
    function getMediaHandler(matchMedia, items) {
      return function mediaHandler() {
        if (matchMedia.matches) {
          items.forEach((item) => {
            moveTo(item)
          })
  
          items.reverse()
        } else {
          items.forEach((item) => {
            if (item.element.classList.contains(className)) {
              moveBack(item)
            }
          })
  
          items.reverse()
        }
      }
    }
  
    /**
     * @param {dNode} dNode
     */
    function moveTo(dNode) {
      const { to, element, order } = dNode
      dNode.index = getIndexInParent(dNode.element, dNode.element.parentElement)
      element.classList.add(className)
  
      if (order === 'last' || order >= to.children.length) {
        to.append(element)
  
        return
      }
  
      if (order === 'first') {
        to.prepend(element)
  
        return
      }
  
      to.children[order].before(element)
    }
  
    /**
     * @param {dNode} dNode
     */
    function moveBack(dNode) {
      const { parent, element, index } = dNode
      element.classList.remove(className)
  
      if (index >= 0 && parent.children[index]) {
        parent.children[index].before(element)
      } else {
        parent.append(element)
      }
    }
  
    /**
     * @param {HTMLElement} element
     * @param {HTMLElement} parent
     */
    function getIndexInParent(element, parent) {
      return [...parent.children].indexOf(element)
    }
  
    /**
     * Функция сортировки массива по breakpoint и order
     * по возрастанию для type = min
     * по убыванию для type = max
     *
     * @param {dNode[]} items
     */
    function sortDNodes(items) {
      const isMin = type === 'min' ? 1 : 0
  
      return [...items].sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.order === b.order) {
            return 0
          }
  
          if (a.order === 'first' || b.order === 'last') {
            return -1 * isMin
          }
  
          if (a.order === 'last' || b.order === 'first') {
            return 1 * isMin
          }
  
          return 0
        }
  
        return (a.breakpoint - b.breakpoint) * isMin
      })
    }
  
    function isNumber(value) {
      return !isNaN(value)
    }
  }
  
useDynamicAdapt();


/*castom select script*/
const defaultSelect = () => {
  const elements = document.querySelectorAll('.select');
  if(elements.length > 0) {
    elements.forEach(element => {
      const choices = new Choices(element, {
        silent: false,
        items: [],
        choices: [],
        renderChoiceLimit: -1,
        maxItemCount: -1,
        addItems: true,
        addItemFilter: null,
        removeItems: true,
        removeItemButton: false,
        editItems: false,
        allowHTML: true,
        duplicateItemsAllowed: true,
        delimiter: ',',
        paste: true,
        searchEnabled: false, //Поиск по селекту
        searchChoices: true,
        searchFloor: 1,
        searchResultLimit: 4,
        searchFields: ['label', 'value'],
        position: 'auto',
        resetScrollPosition: true,
        shouldSort: true,
        shouldSortItems: false,
        sorter: () => {},
        placeholder: false,
        placeholderValue: null,
        searchPlaceholderValue: null,
        prependValue: null,
        appendValue: null,
        renderSelectedChoices: 'auto',
        loadingText: 'Loading...',
        noResultsText: 'No results found', //Текст когда поиск по селекту не находит результата
        noChoicesText: 'No choices to choose from',
        itemSelectText: 'Press to select',
        uniqueItemText: 'Only unique values can be added',
        customAddItemText: 'Only values matching specific conditions can be added',
        classNames: {
          containerOuter: 'choices',
          containerInner: 'choices__inner',
          input: 'choices__input',
          inputCloned: 'choices__input--cloned',
          list: 'choices__list',
          listItems: 'choices__list--multiple',
          listSingle: 'choices__list--single',
          listDropdown: 'choices__list--dropdown',
          item: 'choices__item',
          itemSelectable: 'choices__item--selectable',
          itemDisabled: 'choices__item--disabled',
          itemChoice: 'choices__item--choice',
          placeholder: 'choices__placeholder',
          group: 'choices__group',
          groupHeading: 'choices__heading',
          button: 'choices__button',
          activeState: 'is-active',
          focusState: 'is-focused',
          openState: 'is-open',
          disabledState: 'is-disabled',
          highlightedState: 'is-highlighted',
          selectedState: 'is-selected',
          flippedState: 'is-flipped',
          loadingState: 'is-loading',
          noResults: 'has-no-results',
          noChoices: 'has-no-choices'
        },
        // Choices uses the great Fuse library for searching. You
        // can find more options here: https://fusejs.io/api/options.html
        fuseOptions: {
          includeScore: true
        },
        labelId: '',
        callbackOnInit: null,
        callbackOnCreateTemplates: null
      });


      let areaLabel = element.getAttribute('aria-label');
      element.closest('.choices').setAttribute('aria-label', areaLabel);
    });
  }
}

defaultSelect();



/*slider-swiper script*/
new Swiper('.examples-slider', {
  navigation: {
    prevEl: '.section-examples__slider-arrow_prev',
		nextEl: '.section-examples__slider-arrow_next',
	},
  pagination: {
		el: '.swiper-pagination',
		
		//Буллеты
		type: 'bullets',
		//Активация клика на булиты
		clickable: true,
	},

  // Колличество слайдов для показа
  slidesPerView: 1,

  // Колличество пролистываемых слайдов
	slidesPerGroup: 1,
});



/*gratitude-slider*/
new Swiper('.gratitude-slider', {
  navigation: {
    prevEl: '.gratitude-slider__arrow_prev',
		nextEl: '.gratitude-slider__arrow_next',
	},

  spaceBetween: 20,

  // Колличество слайдов для показа
  slidesPerView: 4,

  // Колличество пролистываемых слайдов
	slidesPerGroup: 1,

  breakpoints: {
		320: {
			slidesPerView: 1,
		},
		480: {
			slidesPerView: 2,
		},
    767: {
			slidesPerView: 3,
		},
		992: {
			slidesPerView: 4,
		},
	},
});




/*Tabs script start*/
const tabsTitle = document.querySelectorAll('.tabs__item');
const tabsContent = document.querySelectorAll('.tabs__block');

if (tabsTitle.length > 0 || tabsContent.length > 0) {
	tabsTitle.forEach(item => item.addEventListener("click", event => {

		const tabsTitleTarget = event.target.getAttribute('data-tab');

		tabsTitle.forEach(element => element.classList.remove('active-tab'));

		tabsContent.forEach(element => element.classList.add('hidden-tab-content'));

		item.classList.add('active-tab');

		document.getElementById(tabsTitleTarget).classList.remove('hidden-tab-content');
		
	}));

	document.querySelector('[data-tab="tab-1"]').classList.add('active-tab');
	document.querySelector('#tab-1').classList.remove('hidden-tab-content');
}
/*Tabs script end*/



/*licenses-slider*/
new Swiper('.licenses-slider', {
  // navigation: {
  //   prevEl: '.gratitude-slider__arrow_prev',
	// 	nextEl: '.gratitude-slider__arrow_next',
	// },

  spaceBetween: 20,

  // Колличество слайдов для показа
  slidesPerView: 4,

  // Колличество пролистываемых слайдов
	slidesPerGroup: 1,

  grabCursor: true,

  breakpoints: {
		320: {
			slidesPerView: 1,
		},
		480: {
			slidesPerView: 2,
		},
    767: {
			slidesPerView: 3,
		},
		992: {
			slidesPerView: 4,
		},
	},
});



// Spollers 
//Получаем коллекцию всех объектов у которых есть атрибут data-spollers
const spollersArray = document.querySelectorAll('[data-spollers]');
//Проверяем их наличие
if (spollersArray.length > 0) {
	//В рамках JS нам нужно разделить всю коллекцию на 2 массива. Один будет с простыми споллерами, а другой с теми которые работают по определённому брейкпоинту
	const spollersRegular = Array.from(spollersArray).filter(function (item, index, self) {
		//Проверяем отсутствие параметров у атрибута data-spollers
		return !item.dataset.spollers.split(",")[0];
	});
	//Проверяем есть ли они
	if (spollersRegular.length > 0) {
		initSpollers(spollersRegular);
	}

	//Получаем объекты с параметрами и которые будут работать в зависимости от ширины экрана
	const spollersMedia = Array.from(spollersArray).filter(function (item, index, self) {
		//Проверяем наличие параметров у атрибута data-spollers
		return item.dataset.spollers.split(",")[0];
	});
	
	//Далее нам нужно инициализировать споллеры с медиа запросом +
	if (spollersMedia.length > 0) {
		const breakpointsArray = [];
		spollersMedia.forEach(item => {
			const params = item.dataset.spollers;
			const breakpoint = {};
			const paramsArray = params.split(",");
			breakpoint.value = paramsArray[0];
			breakpoint.type = paramsArray[1] ? paramsArray[1].trim() : "max";
			breakpoint.item = item;
			breakpointsArray.push(breakpoint);
		});

		//Получаем уникальные брейкпоинты +
		let mediaQueries = breakpointsArray.map(function (item) {
			return '(' + item.type + "-width: " + item.value + "px)," + item.value + ',' + item.type;
		});
		mediaQueries = mediaQueries.filter(function (item, index, self) {
			return self.indexOf(item) === index;
		});

		//Работаем с каждым брейкпоинтом +
			mediaQueries.forEach(breakpoint => {
			const paramsArray = breakpoint.split(",");
			const mediaBreakpoint = paramsArray[1];
			const mediaType = paramsArray[2];
			const matchMedia = window.matchMedia(paramsArray[0]);

			//Обекты с нужными условиями +
			const spollersArray = breakpointsArray.filter(function (item) {
				if (item.value === mediaBreakpoint && item.type === mediaType) {
					return true;
				}
			});

			//Событие +
			matchMedia.addListener(function () {
				initSpollers(spollersArray, matchMedia);
			});
			initSpollers(spollersArray, matchMedia);
		});
	}
	//Инициализация
	function initSpollers(spollersArray, matchMedia = false) {
		spollersArray.forEach(spollersBlock => {
			spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;
			if (matchMedia.matches || !matchMedia) {
				spollersBlock.classList.add('_init');
				initSpollerBody(spollersBlock);
				spollersBlock.addEventListener("click", setSpollerAction);
			} else {
				spollersBlock.classList.remove('_init');
				initSpollerBody(spollersBlock, false);
				spollersBlock.removeEventListener("click", setSpollerAction);
			}
		});
	}
	//Работа с контентом +
	function initSpollerBody(spollersBlock, hideSpollerBody = true) {
		const spollerTitles = spollersBlock.querySelectorAll('[data-spoller]');
		if (spollerTitles.length > 0) {
			spollerTitles.forEach(spollerTitle => {
				if (hideSpollerBody) {
					spollerTitle.removeAttribute('tabindex');
					if (!spollerTitle.classList.contains('_active')) {
						spollerTitle.nextElementSibling.hidden = true;
					}
				} else {
					spollerTitle.setAttribute('tabindex', '-1');
					spollerTitle.nextElementSibling.hidden = false;
				}
			});
		}
	}

	function setSpollerAction(e) {
		const el = e.target;
		if (el.hasAttribute('data-spoller') || el.closest('[data-spoller]')) {
			const spollerTitle = el.hasAttribute('data-spoller') ? el : el.closest('[data-spoller]');
			const spollersBlock = spollerTitle.closest('[data-spollers]');
			const oneSpoller = spollersBlock.hasAttribute('data-one-spoller') ? true : false;
			if (!spollersBlock.querySelectorAll('._slide').length) {
				if (oneSpoller && !spollerTitle.classList.contains('_active')) {
					hideSpollersBody(spollersBlock);
				}
				spollerTitle.classList.toggle('_active');
				_slideToggle(spollerTitle.nextElementSibling, 500);
			}
			e.preventDefault();
		}
	}
	function hideSpollersBody(spollersBlock) {
		const spollerActiveTitle = spollersBlock.querySelector('[data-spoller]._active');
		if (spollerActiveTitle) {
			spollerActiveTitle.classList.remove('_active');
			_slideUp(spollerActiveTitle.nextElementSibling, 500);
		}
	}
}


//====================================================================================================================
//SlideToggle +
let _slideUp = (target, duration = 500) => {
	if (!target.classList.contains('_slide')) {
		target.classList.add('_slide');
		target.style.transitionProperty = 'height, margin, padding';
		target.style.transitionDuration = duration + 'ms';
		target.style.height = target.offsetHeight + 'px';
		target.offsetHeight;
		target.style.overflow = 'hidden';
		target.style.height = 0;
		target.style.paddingTop = 0;
		target.style.paddingBottom = 0;
		target.style.marginTop = 0;
		target.style.marginBottom = 0;


		window.setTimeout(() => {
			target.hidden = true;
			target.style.removeProperty('height');
			target.style.removeProperty('padding-top');
			target.style.removeProperty('padding-bottom');
			target.style.removeProperty('margin-top');
			target.style.removeProperty('margin-bottom');
			target.style.removeProperty('overflow');
			target.style.removeProperty('transition-duration');
			target.style.removeProperty('transition-property');
			target.classList.remove('_slide');			
		}, duration);
	}
}
let _slideDown = (target, duration = 500) => {
	if (!target.classList.contains('_slide')) {
		target.classList.add('_slide');
		if (target.hidden) {
			target.hidden = false;
		}
		let height = target.offsetHeight;
		target.style.overflow = 'hidden';
		target.style.height = 0;
		target.style.paddingTop = 0;
		target.style.paddingBottom = 0;
		target.style.marginTop = 0;
		target.style.marginBottom = 0;
		target.offsetHeight;
		target.style.transitionProperty = 'height, margin, padding';
		target.style.transitionDuration = duration + 'ms';
		target.style.height = height + 'px';
		
		window.setTimeout(() => {
			target.style.removeProperty('padding-top');
			target.style.removeProperty('padding-bottom');
			target.style.removeProperty('margin-top');
			target.style.removeProperty('margin-bottom');

			target.style.removeProperty('height');
			target.style.removeProperty('overflow');
			target.style.removeProperty('transition-duration');
			target.style.removeProperty('transition-property');
			target.classList.remove('_slide');
		}, duration);
	}
}

let _slideToggle = (target, duration = 500) => {
	if (target.hidden) {
		return _slideDown(target, duration);
	} else {
		return _slideUp(target, duration);
	}
}



/*header on scroll*/
const header = document.querySelector('.header');
const headerMenu = document.querySelector('.header__menu');
const headerBottom = document.querySelector('.header__bottom');
const headerMain = document.querySelector('.header__main');
window.addEventListener("scroll", function (e) {
	const lastKnownScrollPosition = window.scrollY;
	
	if ( lastKnownScrollPosition > 200 ) {
		header.classList.add('_active');

		if (!headerMenu.classList.contains('done')) {
			headerMain.insertBefore(headerMenu, headerMain.children[1]);
			headerMenu.classList.add('done');
		}
	} else {
		header.classList.remove('_active');

		if (headerMenu.classList.contains('done')) {
			headerBottom.insertBefore(headerMenu, headerBottom.children[0]);
			headerMenu.classList.remove('done');
		}
	}
});