"use strict";

const quickURL = 'https://svc-5024.birweb.1prime.ru/v2/QuickSearch?term='

function companySelected(id, selPane) {
	selPane.innerHTML = '';
	selPane.style.opacity = 0;
	const resBrief = document.getElementById('company-brief-names');
	resBrief.innerHTML = '<div class="spinner"></div>';
	const resOkved = document.getElementById('company-okveds');
	resOkved.innerHTML = '<div class="spinner"></div>';
	const resCompSize = document.getElementById('company-size');
	resCompSize.innerHTML = '';
	const resCompRanged = document.getElementById('company-ranged');
	resCompRanged.innerHTML = '';
	const resCompCredit = document.getElementById('company-creditscore');
	resCompCredit.innerHTML = '';

	// let url = 'https://api.codetabs.com/v1/proxy/?quest=' + encodeURIComponent('https://site.birweb.1prime.ru/company-brief/' + id);
	let url = 'https://api-ensi.dev.igit.spb.ru/company-brief/' + id;
	console.log('fetching ' + url);
	fetch(url).then(function (response) {
		return response.text();
	}).then(function (html) {

		// Convert the HTML string into a document object
		var parser = new DOMParser();
		var doc = parser.parseFromString(html, 'text/html');

		// Get the image file
		// var img = doc.querySelector('img');
		// console.log(img);

		var bir = {};

		var dsec = doc.querySelector('bir-company-brief div.brief-layout__header > bir-company-header');
		bir['Наименование'] = dsec.querySelector('h1.company-header__info__name__caption').textContent;
		dsec = dsec.querySelector('div.company-header__info__codes');
		dsec.querySelectorAll('div.company-header__info__codes__code').forEach((el) => {
			let arr = el.getElementsByTagName('span');
			bir[arr[0].textContent.slice(0, -1)] = arr[1].textContent;
		});

		dsec = doc.querySelector('bir-company-overview div.company-overview-status__registration-date meta');
		bir['Зарегистрирована'] = dsec.content;
		dsec = doc.querySelector('bir-company-overview div.overview-layout__content__main');
		// Полное наименование, наименовение на латинице, орг. форма и т.д.
		dsec.querySelectorAll('noindex div.company-main__names__name__title').forEach((el) => {
			let n = el.textContent.slice(0, -1);
			let val = el.parentNode.nextElementSibling.textContent;
			bir[n] = val;
		})

		bir['Благонадежность'] = doc.querySelector('div.ranged-card__content__value').textContent;
		// var score_desc = doc.querySelector('div.ranged-card__content__value-description__legend__value').textContent;
		bir['Кредитоспособность'] = doc.querySelector('bir-widget-ranged-card.company-overview__credit').querySelector('div.ranged-card__content__value').textContent;
		
		dsec = doc.querySelector('bir-company-size div.company-size > div.company-size__content');
		// bir['Размер компании'] = dsec.querySelector('a.company-size__content__value').textContent
		// bir['Тип компании'] = dsec.ownerDocument.evaluate("//span[preceding::div[text()='Тип компании']]", dsec, null, XPathResult.ANY_TYPE, null ).iterateNext().textContent;
		// bir['Численность сотрудников'] = dsec.ownerDocument.evaluate("//span[preceding::div[text()='Численность сотрудников']]", dsec, null, XPathResult.ANY_TYPE, null ).iterateNext().textContent;
		dsec.querySelectorAll('div.company-size__content__title').forEach( (el) => {
			bir[el.textContent] = el.nextElementSibling.textContent;
		})

		dsec = doc.querySelector('bir-company-authorized-capital > div.company-card-widget');
		bir['Уставный капитал'] = dsec.querySelector('div.company-card-widget__value').textContent.trim();

		dsec = doc.querySelector('bir-company-tax-mode.company-overview__tax > div.company-card-widget');
		bir['Режим налогообложения'] = dsec.querySelector('div.company-card-widget__value').textContent.trim();

		// dsec = doc.querySelector('bir-company-chiefs div.company-main__controlling-persons');
		dsec = doc.querySelector('bir-widget-okveds.company-overview__okveds');
		let okved = {'Основной':[], 'Дополнительные':[]};
		let okved_main = dsec.ownerDocument.evaluate("//header[text()='Основной']", dsec, null, XPathResult.ANY_TYPE, null ).iterateNext();
		if (okved_main) {
			okved['Основной'] = [okved_main.nextElementSibling.textContent, okved_main.nextElementSibling.nextElementSibling.textContent]
		}
		let okved_dop = dsec.ownerDocument.evaluate("//header[text()='Дополнительные']", dsec, null, XPathResult.ANY_TYPE, null ).iterateNext();
		if (okved_dop) {
			let el = okved_dop;
			while (el = el.nextElementSibling) {
				let a1= el.textContent;
				el = el.nextElementSibling;
				let a2 = el.textContent;
				okved['Дополнительные'].push([a1,a2]);
			}
		}
		bir['ОКВЭД'] = okved;

		console.log(bir);

		function fill_card(keys) {
			let out = '';
			keys.forEach( (inkey) => {
				let key = Array.isArray(inkey) ? inkey[0] : inkey;
				let style = Array.isArray(inkey) ? ` class="${inkey[1]}"` : '';
				if (bir[key] !== undefined) {
					let val = bir[key];
					out += `<dt${style}>${key}</dt><dd${style}>${val}</dd>`;
				}
			});
			return '<dl>' + out + '</dl>\n';
		}
		resBrief.innerHTML = fill_card(['Полное наименование', 'Сокращенное наименование', 'Наименование на латинице', 'Организационно-правовая форма', 'Зарегистрирована', ['ИНН','oneline'], ['ОГРН','oneline'], ['ОКПО','oneline']]);
		resOkved.innerHTML = '<h4>Основной</h4><div class="okved-record"><b>' + bir['ОКВЭД']['Основной'][0] + '</b>&nbsp;' + bir['ОКВЭД']['Основной'][1] + '</div><h4>Дополнительные</h4>';
		if (bir['ОКВЭД']['Дополнительные'].length)
			resOkved.innerHTML += bir['ОКВЭД']['Дополнительные'].map(function(e, i){return '<div class="okved-record"><b>'+ e[0] + '</b>&nbsp;' + e[1] + '</div>'}).join('\n');
		resCompSize.innerHTML = fill_card(['Размер компании', 'Тип компании', 'Численность сотрудников', 'Уставный капитал']);
		
		if (!isNaN(parseInt(bir['Благонадежность']))) {
			let compRange = bir['Благонадежность'] < 13 ? 1 : (bir['Благонадежность'] < 25 ? 2 : 3);
			resCompRanged.innerHTML = '<div class="bir-company-range-' + compRange + '" title="Благонадежность">' + bir['Благонадежность'] + '</div>';
			resCompRanged.innerHTML += '<div class="bir-company-range-desc-cnt">\
			 <div class="bir-company-range-desc" title="Организация неблагонадёжна">0-12<br />Низкая</div>\
			 <div class="bir-company-range-desc" title="Требуется дополнительный анализ">13-24<br />Средняя</div>\
			 <div class="bir-company-range-desc" title="Организация благонадёжна">25-33<br />Высокая</div>\
			  </div>';
		}
		else {
			resCompRanged.innerHTML = '<div class="bir-company-range-none"><div><div class="bir-company-range-desc-cnt">Нет данных</div>';
		}
		if (!isNaN(parseInt(bir['Кредитоспособность']))) {
			let compRange = bir['Кредитоспособность'] < 1.8 ? 1 : (bir['Кредитоспособность'] < 2.8 ? 2 : 3);
			resCompCredit.innerHTML = '<div class="bir-company-range-' + compRange + '" title="Кредитоспособность">' + bir['Кредитоспособность'] + '</div>';
			resCompCredit.innerHTML += '<div class="bir-company-range-desc-cnt">\
			 <div class="bir-company-range-desc" title="Неустойчивое финансовое положение ">< 1.8<br />Низкая</div>\
			 <div class="bir-company-range-desc" title="Требуется дополнительный анализ">1.8-2.7<br />Средняя</div>\
			 <div class="bir-company-range-desc" title="Устойчивое финансовое положение">≥ 2.8<br />Высокая</div>\
			  </div>';
		}
		else {
			resCompCredit.innerHTML = '<div class="bir-company-range-none"><div><div class="bir-company-range-desc-cnt">Нет данных</div>';
		}

	}).catch(function (err) {
		// There was an error
		console.warn('Something went wrong.', err);
		respane.innerHTML = "<span>Ошибка получения данных</span>";
	});

}


function birsearchinput(e, respane) {
    e.stopPropagation();
    e.preventDefault();
    let srchValue = e.target.value.trim().toLowerCase();
    if (!srchValue.length || 2>srchValue.length ) {
    	respane.innerHTML = '';
    	respane.style.opacity = 0;
    	return
    }

    function sresponse(data) {
    	data.forEach((rec) => {
    		let id = rec['id'];
    		const newDiv = document.createElement("div");
    		newDiv.className = 'item';
    		newDiv.innerHTML = '<span>' + rec['shortName'] + '</span>'
	    		+ '<div class="details">ИНН:<span>' + rec['inn'] + '</span> ОГРН:<span>' + rec['ogrn'] + '</span></div>'
	    	newDiv.onclick = function () {
	    		// window.location.href = 'https://site.birweb.1prime.ru/company-brief/' + id;
	    		companySelected(id, respane);
	    	}.bind(id, respane);
	    	respane.appendChild(newDiv);
    	});
    	if (respane.innerHTML == '')
    		respane.innerHTML = '<span class="item-none">ничего не найдено</span>';

		respane.style.opacity = 1;
    }
    function serror(err) {
    	respane.innerHTML = '';
    	respane.style.opacity = 0;
    }

	respane.innerHTML = '';
	respane.style.opacity = 0;
    const fetchPromise = fetch(quickURL + encodeURIComponent(srchValue));
    fetchPromise
	    .then((response) => response.json(), serror.bind(this))
	    .then(sresponse.bind(this));
}


window.addEventListener('load', function () {
	const birsearch = document.getElementById("birsearch");
	const birsearchres = document.getElementById("birsearchres");

	birsearch.addEventListener("input", (e) => {
		birsearchinput(e, birsearchres);
	});
});