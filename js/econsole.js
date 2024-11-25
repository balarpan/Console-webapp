window.addEventListener('load', function () {
	if (document.getElementById("menu-v-pane")) {
		document.getElementById("menu-v-pane").innerHTML = `
		<nav>
		<ul class="menu-v-pane">
			<li><a class="menu-btn-home" href="index.html"></a></li>
			<li><div class="menu-btn-calend">
				<ul class="submenu">
					<li><a href="birsearch.html">Проверка контрагентов</a></li>
					<li><a href="bir-nmc.html">Контроль НМЦ в ГКПЗ</a></li>
					<li><a href="#">Фин устойчивость</a></li>
					<li><a href="bpmn.html">БП закупочной процедуры</a></li>
				</ul>
			</div></li>
			<li><a class="menu-btn-users" href="#"></a></li>
			<li><div class="menu-btn-notes">
				<ul class="submenu">
					<li><a href="ui-dummy.html?i=2">Доля внеплановых закупок</a></li>
					<li><a href="ui-dummy.html?i=1">Закупки по категориям</a></li>
					<li><a href="ui-dummy.html?i=3">Контроль сроков закупочных процедур</a></li>
					<li><a href="ui-dummy.html?i=4">Контроль за ходом исполнения ГКПЗ</a></li>
					<li><a href="ui-dummy.html?i=5">Мониторинг ключевых точек закупочного процесса</a></li>
				</ul>
			</div></li>
			<li><a class="menu-btn-doc" href="#"></a></li>
			<li><div class="menu-btn-bi">
				<ul class="submenu">
					<li><a href="osvoenie-budgeta.html">Освоение бюджета</a></li>
					<li><a href="gkpz_category.html">Исполнение ГКПЗ по категориям</a></li>
					<li><a href="ui-dummy.html?i=6">Объем закупок</a></li>
					<li><a href="ui-dummy.html?i=8">Соблюдение сроков</a></li>
				</ul>
			</div></li>
			<li class="separator"></li>
			<li><div class="menu-btn-stngs">
				<ul class="submenu">
					<li class="checkbox-cnt"><input type="checkbox" id="stngs-toggle1" checked>Настройка 1</li>
					<li class="checkbox-cnt"><input type="checkbox" id="stngs-toggle2">Настройка 2</li>
				</ul>
			</div></li>
			<li><div class="menu-btn-about">
			</div>
			</li>
		</ul>
		</nav>
		`
	}
});

class GKPZ {
	constructor() {
		this.gkpz_csv_url = './data/gkpz.csv';
		this._gkpz_header = undefined;
		this._gkpz_data = undefined;
		this._data_promise = this._loadGKPZ();
	}

	isDataReady() { return undefined !== this._gkpz_header && undefined !== this._gkpz_data;}
	getHeader() { return this._gkpz_header; }
	getData(headerList) {
		if (!headerList)
			return this._gkpz_data;
		let colsRet = [];
		this._gkpz_header.forEach( (el, ind) => {
			if (headerList.includes(el))
				colsRet.push(ind);
		});

		return this._gkpz_data.map( r => colsRet.map(i => r[i]))
	}
	getColumn(name) { return this.getData([name]).map( r => r[0] );}

	getHeaderPromise() {
		var self = this;
		return this._data_promise.then((e) => {return self.getHeader();});
	}
  
	getDataPromise() {
		let self = this;
		return this._data_promise.then((e) => {return self.getData();});
	}

	whenDataReady(callBack, errCallBack=undefined) {
		const self = this;
		this._data_promise.then( () => callBack(self), errCallBack );
	}

	async _addScript(src) {
		return  new Promise((resolve, reject) => {
	    const el = document.createElement('script');
	    el.src = src;
	    el.addEventListener('load', resolve);
	    el.addEventListener('error', reject);
	    document.body.append(el);
		});
	}

	async _loadGKPZ() {
		let self = this;
		let csvResolve, csvReject;
		const prom = new Promise( (resolve, reject) => { csvResolve = resolve; csvReject = reject; });
		try {
		  await this._addScript('./js/papaparse.min.js');
		  Papa.parse(this.gkpz_csv_url, {
		  	download: true,
		  	header: false, skipEmptyLines: true,
		  	dynamicTyping: true,
		  	complete: function(answer) {
		  		self._gkpz_header = answer.data[0];
		  		self._gkpz_data = answer.data.slice(1);
		  		csvResolve();
		  	},
		  	error: function(err) {csvReject(err);},
		  });
		} catch (e) {
		  console.log('Ошибка загрузки скрипта сведений ГКПЗ',e);
		}

		return prom;
	}
}


function nextValidSibling(in_tag, incText=false) {
	//incText - do we detect Text Nodes too
	let acpType = incText ? [1,3] : [1];
	let tag = in_tag.nextSibling;
	while (tag) {
		if (acpType.indexOf(tag.nodeType) >= 0)
			return tag;
		tag = tag.nextSibling;
	}
	return;
}

function bir_company_id(id) {
	// let url = 'https://api.codetabs.com/v1/proxy/?quest=' + encodeURIComponent('https://site.birweb.1prime.ru/company-brief/' + id);
	let url = 'https://api-ensi.dev.igit.spb.ru/company-brief/' + id;
	console.log('fetching ' + url);
	return fetch(url).then(function (response) {
		return response.text();
	}).then(function (html) {
		// Convert the HTML string into a document object
		let parser = new DOMParser();
		let doc = parser.parseFromString(html, 'text/html');
		let dsec;

		let bir = {};

		let parseStngs = {
			'Наименование': "//bir-company-brief//bir-brief-layout//bir-company-header//bir-brief-layout-header//h1",
			'ИНН': "//bir-company-brief//bir-brief-layout//bir-company-header//bir-brief-layout-header//div[contains(@class, 'brief-layout-header__info__codes')]//span[text()='ИНН:']/following-sibling::span",
			'ОГРН': "//bir-company-brief//bir-brief-layout//bir-company-header//bir-brief-layout-header//div[contains(@class, 'brief-layout-header__info__codes')]//span[text()='ОГРН:']/following-sibling::span",
			'ОКПО': "//bir-company-brief//bir-brief-layout//bir-company-header//bir-brief-layout-header//div[contains(@class, 'brief-layout-header__info__codes')]//span[text()='ОКПО:']/following-sibling::span",
			'Статус': "//bir-company-overview//bir-overview-layout//bir-company-status//div[contains(@class, 'company-overview-status__state')]//span"
		};
		for (const [recType, xp] of Object.entries(parseStngs)) {
			let dxp = doc.evaluate(xp, doc, null, XPathResult.ANY_TYPE, null );
			let a;
			if (dxp && (a = dxp.iterateNext()))
				bir[recType] = a.textContent;
		}
		bir['Статус_bool'] = bir['Статус'] && bir['Статус'].startsWith('Действующая')

		dsec = doc.querySelector('bir-company-overview div.company-overview-status__registration-date meta');
		bir['Зарегистрирована'] = dsec.content;
		dsec = doc.querySelector('div.company-main__contacts div.company-main__contacts__address a');
		bir['Адрес'] = '';
		if (dsec) {
			bir['Адрес'] = String(dsec.textContent + nextValidSibling(dsec, true).textContent).trim();
		}
		dsec = doc.querySelector('div.company-main__contacts');
		let contactDetails = {
			'email': "//bir-icon-text[@itemprop='email']//a",
			'тел': "//bir-icon-text[@itemprop='telephone']//a",
			'сайт': "//bir-icon-text[@itemprop='url']//a",
			'Адрес недостоверен': "//bir-warnings-list//div[contains(@class, 'container__warning')]"
		};
		for (const [recType, xp] of Object.entries(contactDetails)) {
			let dxp = dsec.ownerDocument.evaluate(xp, dsec, null, XPathResult.ANY_TYPE, null );
			let a;
			if (dxp && (a = dxp.iterateNext()))
				bir[recType] = a.textContent;
		}

		// let dxp = dsec.ownerDocument.evaluate("//bir-icon-text[@itemprop='email']", dsec, null, XPathResult.ANY_TYPE, null );
		// if (dxp) {
		// 	bir['email'] = dxp.iterateNext().querySelector('a').textContent;
		// }

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

		return bir;
	}).catch(function (err) {
		console.warn('BIR by ID. Something went wrong.', err);
	});

}


