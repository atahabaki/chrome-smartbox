const is_object = data => typeof data === "object";

class Box {
	constructor(name, description, url) {
		this.name = name;
		this.desc = description;
		this.url = url;
	}

	#check_properties(data) {
		return data.hasOwnProperty("name") && data.hasOwnProperty("desc") && data.hasOwnProperty("url");
	}

	#name_regex = /^([\w\d]+)$/

	#validate_name(name) {
		let _res = name.match(this.#name_regex);
		return _res.length == 2
	}

	#validate_url = (url) => url.includes("{%query%}");

	validate(data) {
		if (is_object(data)) {
			if (this.#check_properties(data)) {
				return this.#validate_name(data.name) && this.#validate_url(data.url);
			}
		}
		else return false;
	}

	fromJSON(data) {
		if (this.validate(data)) {
			console.log("Valid, good!");
		}
		return this;
	}

	toJSON() {
		return {
			"name": this.name,
			"desc": this.desc,
			"url": this.url
		};
	}
}

class BoxManager {
	constructor(list, default1, is_sync_enabled) {
		this.#assign_all(list, default1, is_sync_enabled);
	}

	change_default1(name) {
		let _res = this.list.filter(e=>e.name===name);
		if (_res.length >= 0) this.default1 = _res[0];
		else console.log(`We could not find any corresponding Box 4 ${name}!..`);
	}

	toggle_sync() {
		console.log(`Current sync: ${this.is_sync_enabled ? 'Sync' : 'Local'}`)
		this.is_sync_enabled =! this.is_sync_enabled
		console.log(`Current sync: ${this.is_sync_enabled ? 'Sync' : 'Local'}`)
	}

	#assign_all(list, default1, is_sync_enabled) {
		this.list = list;
		this.default1 = default1;
		this.is_sync_enabled = is_sync_enabled; // Sync is enabled if it is set to true
	}

	#data() {
		return {
			"smartbox_sites": this.list,
			"smartbox_default": this.default1,
			"smartbox_is_sync_enabled": this.is_sync_enabled
		};
	}

	#saveLocal() {
		chrome.storage.local.set(this.#data(), () => {
			console.log("Saved locally!...", this.list, this.default1, this.is_sync_enabled); // Print what data saved & how...
		});
	}

	#loadLocal() {
		chrome.storage.local.get(['smartbox_sites', 'smartbox_default', 'smartbox_is_sync_enabled'], (res) => {
			console.log("I got locally", res.smartbox_sites, res.smartbox_default, res.smartbox_is_sync_enabled);
			this.#assign_all(res.smartbox_sites, res.smartbox_default, res.smartbox_is_sync_enabled);
		});
	}

	#saveSync() {
		chrome.storage.sync.set(this.#data(), () => {
			console.log("Saved into sync chain!..");
		});
	}

	#loadSync() {
		chrome.storage.sync.get(['smartbox_sites', 'smartbox_default', 'smartbox_is_sync_enabled'], (res) => {
			console.log("I got locally", res.smartbox_sites, res.smartbox_default, res.smartbox_is_sync_enabled);
			this.#assign_all(res.smartbox_sites, res.smartbox_default, res.smartbox_is_sync_enabled);
		});
	}

	save() {
		if (this.is_sync_enabled) this.#saveSync();
		else this.#saveLocal();
	}

	load() {
		if (this.is_sync_enabled) this.#loadSync();
		else this.#loadLocal();
	}

	add_entry(box) {
		console.log("box",box);
		this.list.push(box);
	}

	add_entryJSON(data) {
		this.list.push(new Box().fromJSON(data))
	}

	remove_entry(name) {
		let _res = this.list.filter(e => e.name === name);
		console.log("remove",name,_res)
		if (_res.length >= 0) this.list = this.list.filter(e => e.name != name);
		else console.log(`Could not find any corresponding Box 4 ${name}!..`);
	}

	filter(name) {
		let _res = this.list.filter(e => e.name === name);
		if (_res.length >= 1) return _res[0];
		else {
			console.log(`Could not find any corresponding Box 4 ${name}!..`);
			return 404;
		}
	}
}

class App {
	constructor(name) {
		this.name = name;
	}

	#boxman

	/***  RegEx Patterns ***/
	#add_regex = /^(\+<=)[\s\t\v]*(\[.*\])/;
	#imp_regex = /^(<=)[\s\t\v]*(\[.*\])/;
	#exp_regex = /^(=>)/;
	#single_add_regex = /^(\+)([\w\d]+)[\s\t\v]+["']?([\w\d\s]+)["']?[\s\t\v]+(.*)/;
	#single_rm_regex = /^(\-)([\w\d]+)/;
	#default1_regex = /^(\!)([\w\d]+)/;
	#search_regex = /^([\w\.\d]+)[\s\t\v]+(.*)/;
	#toggle_sync_regex = /^\!\@sync$/;

	#first_install() {
		console.log("First Install");
		this.#boxman.save();
		this.#boxman.load();
		//save the sites to chrome local/sync storage
	}

	#on_install() {
		chrome.runtime.onInstalled.addListener((details) => {
			if (details.reason === "install") {
				this.#first_install();
			}
		});
	}

	#createURL(site,query){
		let _res = this.#boxman.filter(site);
		console.log(_res);
		return _res.url.replace("{%query%}",query);
	}

	#add_entries(text) {
		let _res = text.match(this.#add_regex);
		if ( _res.length == 3 ) {
			let _sites = JSON.parse(_res[2]);
			_sites.forEach(e => this.#boxman.add_entryJSON(e));
		}
	}

	#add_entry(text) {
		let _res = text.match(this.#single_add_regex);
		console.log("add",_res);
		if ( _res.length == 5 ) {
			let box = new Box(_res[2],_res[3],_res[4]);
			this.#boxman.add_entry(box);
		}
	}

	#remove_entry(text) {
		let _res = text.match(this.#single_rm_regex);
		console.log("remove",_res)
		if (_res.length == 3) {
			this.#boxman.remove_entry(_res[2]);
		}
	}

	#import_entries(text) {
		let _res = text.match(this.#imp_regex);
		if ( _res.length == 3 ) {
			let sites = JSON.parse(_res[2]);
			let list = [];
			if (sites.length >= 0) {
				sites.forEach(e => list.push(new Box(e.name,e.desc,e.url)));
			}
		}
	}

	#export_entries() {
		return this.#boxman.list
	}

	#set_default1(text) {
		let _res = text.match(this.#default1_regex);
		if (_res.length == 3) this.#boxman.change_default1(_res[2]);
	}

	#navigate(url) {
		chrome.tabs.query({active: true, currentWindow: true}, tabs => {
			chrome.tabs.update(tabs[0].id, {url:url});
		});
	}

	#splitIntoParts(text) {
		let _res = text.match(this.#search_regex)
		if (_res != null) {
			if (_res.length  == 3) {
				let site = _res[1]
				let query = _res[2]
				return {
					"site": site,
					"query": query,
				}
			}
		}
		else return {
			"site": text,
			"query": "",
		}
	}

	#search(text) {
		let _res = text.match(this.#search_regex)
		let filter_res = this.#boxman.filter(_res[1])
		if (_res.length == 3) {
			console.log(typeof(filter_res))
			if (filter_res instanceof Box || filter_res instanceof Object) {
				let site = _res[1]
				let query = _res[2]
				let _url = this.#createURL(site,query);
				this.#navigate(_url)
			}
			else this.#searchOnDefaultEngine(text);
		}
	}

	#searchOnDefaultEngine(text) {
		this.#navigate(this.#boxman.default1.url.replace("{%query%}",text));
	}

	#onInputEntered() {
		chrome.omnibox.onInputEntered.addListener((text)=>{
			text=text.trim();
			console.log(text);
			if (this.#toggle_sync_regex.test(text)) {
				console.log("It's !@sync")
				this.#boxman.toggle_sync();
				return this.#boxman.save();
			}
			if (this.#add_regex.test(text)) {
				console.log("It's +<=...")
				this.#add_entries(text);
			}
			else if (this.#imp_regex.test(text)) {
				console.log("It's <=...")
				this.#import_entries(text);
			}
			else if (this.#exp_regex.test(text)) {
				console.log("It's =>...")
				console.log(this.#export_entries());
			}
			else if (this.#single_add_regex.test(text)) {
				console.log("It's +...")
				this.#add_entry(text);
			}
			else if (this.#single_rm_regex.test(text)) {
				console.log("It's -...")
				this.#remove_entry(text);
			}
			else if (this.#default1_regex.test(text)) {
				console.log("It's !...")
				this.#set_default1(text);
			}
			else if (this.#search_regex.test(text)) {
				console.log("It's search...")
				this.#search(text);
			}
			else this.#searchOnDefaultEngine(text);
			this.#boxman.save();
		});
	}

	#getStrChange = (site, query) => chrome.i18n.getMessage("search").replace("%site", site).replace("%query", query.includes(" ") ? `\"${query}\"` : query);

	#rawSuggestionWithPostfix(site,query,postfix) {
		return {
			"content": `${site}.${postfix}/${query}`,
			"description": this.#getStrChange(`${site}.${postfix}`,query)
		}
	}

	#rawSuggestions = (site,query) => [
		{content: `${site}/${query}`, description: this.#getStrChange(site,query)},
		this.#rawSuggestionWithPostfix(site,query,"com"),
		this.#rawSuggestionWithPostfix(site,query,"net"),
		this.#rawSuggestionWithPostfix(site,query,"org")
	]

	#rawSuggest(text,suggest) {
		let _res = this.#splitIntoParts(text)
		let suggestions = this.#rawSuggestions(_res.site,_res.query)
		if (text.includes(".")) {
			suggest(suggestions.slice(0,1))
		}
		else suggest(suggestions.slice(1))
	}

	#onInputChanged() {
		chrome.omnibox.onInputChanged.addListener((text, suggest) => {
			text=text.trim();
			console.log(text)

			// Sets default suggestion, and suggest RAW suggestions...
			const default_suggests = () => {
				let desc = chrome.i18n.getMessage("search").replace("%site", this.#boxman.default1["desc"]).replace("%query", text.includes(" ") ? `\"${text}\"` : text)
				chrome.omnibox.setDefaultSuggestion({"description": desc})
				this.#rawSuggest(text, suggest);
			}
			default_suggests()

			let search_suggestion = (content, name, query) => {
				return {
					"content": content,
					"description": chrome.i18n.getMessage("search").replace("%site", name).replace("%query", query.includes(" ") ? `\"${query}\"` : query)
				}
			}

			let toggle_sync_suggestion = {
				"content": " !@sync",
				"description": chrome.i18n.getMessage("set_sync").replace("%sync",
						this.#boxman.is_sync_enabled ? chrome.i18n.getMessage("sync_off") : chrome.i18n.getMessage("sync_on")),
			}

			let toggle_sync_suggest = () => {
				chrome.omnibox.setDefaultSuggestion({"description": toggle_sync_suggestion.description})
			}

			let single_rm_suggestion = (content, entry) => {
				return {
					"content": content,
					"description": chrome.i18n.getMessage("rmentry").replace("%entry", entry)
				}
			}

			let single_rm_suggest = (content, entry) => {
				chrome.omnibox.setDefaultSuggestion({"description": single_rm_suggestion(content, entry).description})
			}

			if (this.#toggle_sync_regex.test(text)) {
				//ToggleSymc suggestion (write the current status or what will it be
				console.log(`Current sync: ${this.#boxman.is_sync_enabled ? 'Sync' : 'Local'}`)
				toggle_sync_suggest()
			}
			else if (this.#single_rm_regex.test(text)) {
				//Single rm suggestion
				let _res = text.match(this.#single_rm_regex);
				console.log("remove",_res)
				if (_res.length == 3) {
					let filter_res = this.#boxman.filter(_res[2])
					if (_res.length == 3) {
						console.log(typeof(filter_res))
						if (filter_res instanceof Box || filter_res instanceof Object) {
							single_rm_suggest(text, filter_res["desc"])
						}
					}
				}
			}
			else if (this.#single_add_regex.test(text)) {
				//Single add suggestion
			}
			else if (this.#add_regex.test(text)) {
				//Add suggestion
			}
			else if (this.#imp_regex.test(text)) {
				//Import suggestion
			}
			else if (this.#exp_regex.test(text)) {
				//Export suggestion
			}
			else if (this.#default1_regex.test(text)) {
				//Default1 suggestion
			}
			else if (this.#search_regex.test(text)) {
				//Search suggestion
				let _res = text.match(this.#search_regex)
				console.log(_res)
				let filter_res = this.#boxman.filter(_res[1])
				if (_res.length == 3) {
					console.log(typeof(filter_res))
					if (filter_res instanceof Box || filter_res instanceof Object) {
						let site = _res[1]
						let query = _res[2]
						let _url = this.#createURL(site,query);
						let suggestion = search_suggestion(_url, filter_res["desc"], query)
						chrome.omnibox.setDefaultSuggestion({"description": suggestion["description"]})
					}
				}
			}
			else {
				//Suggest search engine
				//look names,urls,descs
				if (text.startsWith("!@s")) {
					toggle_sync_suggest()
					if (text != "!@sync")
						default_suggests()
				}
			}
			//Search...
			//remove entry
			//add entry / single add
			//toggle sync
			//change default1
			//import/export
		})
	}

	initialize(sites, default1, is_sync_enabled = false) {
		this.#boxman = new BoxManager(sites, default1, is_sync_enabled);
		this.#on_install();
		this.#onInputEntered();
		this.#onInputChanged();
		this.#boxman.load();
	}
}

//TODO Export Import
//TODO Toggle Sync - Writed helper function - now time to implement it. ("!@sync")
//TODO Change Default Engine
//TODO List all
//TODO List some of them
//TODO onInputChanged and Started... suggestions...

const app_name = "smartbox";
var app = new App(app_name);
var sites = [
	new Box("ytb", "YouTube", "https://www.youtube.com/results?search_query={%query%}"),
	new Box("ggl", "Google", "https://www.google.com/search?q={%query%}"),
	new Box("bng", "Bing", "https://www.bing.com/search?q={%query%}"),
	new Box("yaho", "Yahoo", "https://search.yahoo.com/?q={%query%}"),
	new Box("dckg", "DuckDuckGo", "https://duckduckgo.com/?q={%query%}"),
	new Box("iconf", "IconFinder", "https://www.iconfinder.com/search/?q={%query%}"),
	new Box("rddt", "Reddit", "https://www.reddit.com/search/?q={%query%}"),
	new Box("gthb", "GitHub", "https://github.com/search?q={%query%}"),
	new Box("adox", "Android Developers", "https://developer.android.com/s/results?q={%query%}"),
];
var default1 = sites[0];
app.initialize(sites, default1);

