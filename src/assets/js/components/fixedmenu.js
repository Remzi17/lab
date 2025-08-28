import { fixedElements } from "../scripts/core/variables";
import { headerTop, headerTopFixed } from "../scripts/core/variables";
import { isDesktop } from "../scripts/other/checks";
/* 
	================================================
	  
	Фиксированное меню
	
	================================================
*/

export function fixedMenu() {
	const fixedElementsArray = Array.from(fixedElements);

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
