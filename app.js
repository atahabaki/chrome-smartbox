var sites = [
	{
		"name":"ytb",
		"desc":"YouTube",
		"url":"https://www.youtube.com/results?search_query={%query%}"
	},
	{
		"name":"ggl",
		"desc":"Google",
		"url":"https://www.google.com/search?q={%query%}"
	},
	{
		"name":"adox",
		"desc": "Android Developers",
		"url": "https://developer.android.com/s/results?q={%query%}"
	},
	{
		"name":"bng",
		"desc":"Bing",
		"url":"https://www.bing.com/search?q={%query%}"
	},
	{
		"name":"dckgo",
		"desc":"DuckDuckGo",
		"url":"https://duckduckgo.com/?q={%query%}"
	},
	{
		"name":"yaho",
		"desc":"Yahoo",
		"url":"https://search.yahoo.com/?q={%query%}"
	},
	{
		"name":"iconf",
		"desc":"IconFinder",
		"url":"https://www.iconfinder.com/search/?q={%query%}"
	},
	{
		"name":"rddt",
		"desc":"Reddit",
		"url":"https://www.reddit.com/search/?q={%query%}"
	},
	{
		"name":"gthb",
		"desc":"GitHub",
		"url":"https://github.com/search?q={%query%}"
	}
];
var default_one = sites.filter(e => e.name == "ggl")[0];

function save() {
	chrome.storage.local.set({"ssearch_sites":sites, "default_one": default_one}, () => {
		console.log("Saved!",sites,default_one);
	});
}

function load() {
	console.log(chrome.i18n.getUILanguage())
	chrome.storage.local.get(['ssearch_sites','default_one'], (res) => {
		console.log("Got!",res.ssearch_sites, res.default_one);
		sites = res.ssearch_sites;
		default_one = res.default_one;
	});
}

function changeDef(site) {
	let _default_one = sites.filter(e => e.name == site)[0];
	if (_default_one != undefined) {
		default_one = _default_one;
		save();
	}
	else return
}

chrome.runtime.onInstalled.addListener((details) => {
	if (details.reason == "install") {
		console.log("First install");
		save();
		load();
	}
});

load();

function createURL(site,query) {
	for (var i = 0; i < sites.length; i++) {
		if ( sites[i].name == site ) {
			return `${sites[i].url.replace("{%query%}",query)}`
		}
	}
}

function navigate(url) {
	chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
		chrome.tabs.update(tabs[0].id, {url: url});
	});
}

function searchOnDefaultEngine(text) {
	let _url = createURL(default_one.name, text);
	console.log(_url);
	navigate(_url);
}

let add = /^(\+<=)[\s\t\v]*(\[.*\])/;
let imp = /^(<=)[\s\t\v]*(\[.*\])/;
let sng_add = /^(\+)([\w\d]+)[\s\t\v]+["']?([\w\d\s]+)["']?[\s\t\v]+(.*)/
let sng_rm = /^(\-)([\w\s\d]+)/;
let def_one = /^(\!)([\w\s\d]+)/;
let search = /^([\w\d]+)[\s\t\v]+(.*)/;

function add_entries(text) {
	let _res = text.match(add);
	if ( _res.length == 3 ) {
		let _sites = JSON.parse(_res[2]);
		_sites.forEach(e => sites.push(e));
		save();
	}
}

function add_entry(text) {
	let site = {
		name: null,
		desc: null,
		url: null
	};
	let _res = text.match(sng_add);
	if ( _res.length == 5 ) {
		site.name = _res[2];
		site.desc = _res[3];
		site.url = _res[4];
		sites.push(site);
		save();
	}
}

function remove_entry(text) {
	let _res = text.match(sng_rm);
	if (_res.length == 3) {
		let site = _res[2];
		sites = sites.filter(e => e.name != site);
		save();
	}
}

function import_entries(text) {
	let _res = text.match(imp);
	if ( _res.length == 3 ) {
		sites = JSON.parse(_res[2]);
		save();
	}
}

function set_default(text) {
	let _res = text.match(def_one);
	if (_res.length == 3) {
		let site = _res[2];
		changeDef(site);
	}
}

function search(text) {
	let _res = text.match(search);
	if (_res.length == 3) {
		let site = _res[1];
		let query = _res[2];
		let url = createURL(site, query);
		if (url != undefined) {
			navigate(url);
			suggest(suggestions);
		}
		else searchOnDefaultEngine(text);
	}
}

chrome.omnibox.onInputEntered.addListener((text) => {
	text = text.trim();
	console.log(sites);

	if (add.test(text)) {
		console.log(`It is +<=`);
		add_entries(text);
	}
	else if (imp.test(text)) {
		console.log(`It is <=`);
		import_entries(text);
	}
	else if (sng_add.test(text)) {
		console.log(`It is +`);
		add_entry();
	}
	else if (sng_rm.test(text)) {
		console.log(`It is -`);
		remove_entry(text);
	}
	else if (def_one.test(text)) {
		console.log(`It is !`);
		set_default(text);
	}
	else if (search.test(text)) {
		search(text);
	}
	else searchOnDefaultEngine(text);
});

const getStrChange = (site, query) =>	 chrome.i18n.getMessage("search").replace("%site", site).replace("%query", query);


function rawSuggest(site, query) {
	return [
		{ content: `${site}/${query}`, description: getStrChange(site,query) },
		{ content: `${site}.com/${query}`, description: getStrChange(`${site}.com`,query) },
		{ content: `${site}.net/${query}`, description: getStrChange(`${site}.net`,query) },
		{ content: `${site}.org/${query}`, description: getStrChange(`${site}.org`,query) },
	];
}

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
	console.log(sites);
	text=text.trim();

	if (add.test(text)) {
		console.log(`It is +<=`);
		let _sites = [];
		let _res = text.match(add);
		if ( _res.length == 3 ) {
			_sites = _res[2]
		}
		suggest([
			{
				content: _sites, description: chrome.i18n.getMessage("add_more")
			}
		]);
	}
	else if (imp.test(text)) {
		console.log(`It is <=`);
		let _sites = [];
		let _res = text.match(imp);
		if ( _res.length == 3 ) {
			_sites = _res[2]
			suggest([
				{
					content: _sites, description: chrome.i18n.getMessage("import")
				}
			]);
		}
	}
	else if (sng_add.test(text)) {
		console.log(`It is +`);
		let site = {
			name: null,
			desc: null,
			url: null
		};
		let _res = text.match(sng_add);
		if ( _res.length == 5 ) {
			site.name = _res[2];
			site.desc = _res[3];
			site.url = _res[4];
			suggest([
				{
					content: _res.length === 5 ? JSON.stringify(site) : undefined,
					description: chrome.i18n.getMessage("add_one").replace("%name",site.name)
					.replace("%desc",site.desc)
					.replace("%url",site.url)
				}
			]);
		}
	}
	else if (sng_rm.test(text)) {
		console.log(`It is -`);
		let _res = text.match(sng_rm);
		if (_res.length == 3) {
			let site = _res[2];
			let rm_sites = sites.filter(e => e.name != site); //Removed state
			let entry = sites.filter(e => e.name == site)[0]; //Get Result
			suggest([
				{
					content: rm_sites.length != 0 ? JSON.stringify(rm_sites) : undefined,
					description: chrome.i18n.getMessage("rmentry").replace("%entry", `${entry.name} (${entry.desc})`)
				}
			]);
		}
	}
	else if (def_one.test(text)) {
		console.log(`It is !`);
		let _res = text.match(def_one);
		if (_res.length == 3) {
			let site = _res[2];
			_def_one = sites.filter(e => e.name == site);
			_def_one.length == 1 && suggest([
				{
					content: JSON.stringify(_def_one),
					description: chrome.i18n.getMessage("setdef").replace("%entry", `${_def_one[0].name} (${_def_one[0].desc})`)
				}
			]);
		}
	}
	else if ( text == "." ) {
		let suggestions = [];
		sites.forEach(e => {
			let temp = {
				content: `${e.url}`, description: chrome.i18n.getMessage("list_engines")
				.replace("%s",e.name)
				.replace("%n",e.desc)
			};
			suggestions.push(temp);
		});
		suggest(suggestions);
	}
	else if ( text == "..." ) {
		let content = "";
		for (let i=0; i < sites.length; i++) {
			if ( i == sites.length - 1) {
				content += sites[i].name;
			}
			else content += `${sites[i].name}, `;
		}
		suggest(
			[
				{
					content: content, description: content
				}
			]
		);
	}
	else if ( text == "=>" ) {
		load();
		console.log(sites);
		suggest(
			[
				{
					content: JSON.stringify(sites), description: chrome.i18n.getMessage("export_json")
				}
			]
		);
	}
	else if (search.test(text)) {
		let suggestions = [];
		let _res = text.match(search);
		if (_res.length == 3) {
			let site = _res[1];
			let query = _res[2];
			sites.forEach(e => {
				let _temp = {
					content: '',
					description: ''
				};
				if (e.name == site || e.name.includes(site)) {
					_temp.content = `${e.url.replace('{%query%}',query)}`;
					_temp.description = chrome.i18n.getMessage('search')
						.replace("%site", e.desc)
						.replace("%query", query)
					suggestions.push(_temp);
				}
				else {
					rawSuggest(site, query).forEach(e=>suggestions.push(e));
				}
			});
		}
		suggestions.length != 0 && suggest(suggestions);
	}
});
