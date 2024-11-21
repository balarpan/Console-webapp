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
	const resCompContacts = document.getElementById('company-contacts');
	resCompContacts.innerHTML = '';
		
	bir_company_id(id).then(function(bir) {
		console.log(bir);
		function fill_card(keys, withEmpty = true) {
			let out = '';
			const validVal = ((val) => withEmpty ? true : String(val).trim().length > 0);
			keys.forEach( (inkey) => {
				let key = Array.isArray(inkey) ? inkey[0] : inkey;
				let style = Array.isArray(inkey) ? ` class="${inkey[1]}"` : '';
				if (bir[key] !== undefined && validVal(bir[key])) {
					let val = bir[key];
					out += `<dt${style}>${key}</dt><dd${style}>${val}</dd>`;
				}
			});
			return '<dl>' + out + '</dl>\n';
		}
		resBrief.innerHTML = fill_card(['Полное наименование', 'Сокращенное наименование', 'Наименование на латинице', 'Организационно-правовая форма', 'Зарегистрирована', ['ИНН','oneline'], ['ОГРН','oneline'], ['ОКПО','oneline'], 'Статус']);
		resCompContacts.innerHTML = fill_card([['Адрес','adress-brief'], ['Адрес недостоверен','adress-brief-warn'], ['email','oneline'], ['тел','oneline'], ['сайт','oneline']], false);
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

		document.title ='Консоль. ' + bir['Сокращенное наименование'];
	    if (window.history.replaceState) {
		    let urlParams = new URLSearchParams(window.location.search);
		    urlParams.set('companyid', id);
		    window.history.replaceState(null, document.title, location.protocol + '//' + location.host + location.pathname + '?' + urlParams.toString());
		}
	}).catch(function (err) {;
		console.warn('Something went wrong.', err);
		selPane.innerHTML = '<div class="item-none">Ошибка получения данных</span>';
		selPane.style.opacity = 1;
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
    if (window.history.replaceState) {
	    let urlParams = new URLSearchParams(window.location.search);
	    urlParams.set('srchname', srchValue);
	    window.history.replaceState(null, document.title, location.protocol + '//' + location.host + location.pathname + '?' + urlParams.toString());
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

	const params = new URLSearchParams(this.window.location.search);
	const initSearchName = params.get('srchname');
	const initCompID = params.get('companyid');
	if (initCompID) {
		companySelected(initCompID, birsearchres);
	}
	else if (initSearchName) {
		birsearch.value = initSearchName;
		birsearch.dispatchEvent(new Event('input', { bubbles: true }));		
	}
});