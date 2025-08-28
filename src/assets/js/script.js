
import './scripts/init.js';
import './scripts/components.js';
import { wrap } from './scripts/core/helpers.js';


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
	let projectSlider

	projectSlider = new Swiper('.project-container', {
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
	let cardSlider = new Swiper('.card-container', {
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
	modalInfo.value = cardItemCheckbox.querySelector('input:checked').value
}
