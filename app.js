const info = msg => console.log(msg);
const error = msg => console.error(msg);
const is_object = data => typeof data === "object";

class Box {
	constructor(name,description,url) {
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

	#validate_url(url) {
		return url.includes("{%query%}");
	}

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
			info("Valid, good!");
		}
		return this;
	}

	toJSON() {
		return {
			"name":this.name,
			"desc":this.desc,
			"url":this.url
		};
	}
}

class BoxManager {
	constructor(list,default1,is_sync_enabled) {
		this.#assign_all(list,default1,is_sync_enabled);
	}

	#assign_all(list,default1,is_sync_enabled) {
		this.list = list;
		this.default1 = default1;
		this.is_sync_enabled = is_sync_enabled; // Sync is enabled if it is set to true
	}

	#data() {
		return {
			"smartbox_sites":this.list,
			"smartbox_default":this.default1,
			"smartbox_is_sync_enabled":this.is_sync_enabled
		};
	} 

	#saveLocal() {
		chrome.storage.local.set(this.#data(), () => {
			info("Saved locally!...",this.list,this.default1,this.is_sync_enabled); // Print what data saved & how...
		});
	}

	#loadLocal() {
		chrome.storage.local.get(['smartbox_sites','smartbox_default','smartbox_is_sync_enabled'], (res) => {
			info("I got locally",res.smartbox_sites,res.smartbox_default,res.smartbox_is_sync_enabled);
			this.#assign_all(res.smartbox_sites,res.smartbox_default,res.smartbox_is_sync_enabled);
		});
	}

	#saveSync() {
		chrome.storage.sync.set(this.#data(), () => {
			info("Saved into sync chain!..");
		});
	}

	#loadSync() {
		chrome.storage.sync.get(['smartbox_sites','smartbox_default','smartbox_is_sync_enabled'], (res) => {
			info("I got locally",res.smartbox_sites,res.smartbox_default,res.smartbox_is_sync_enabled);
			this.#assign_all(res.smartbox_sites,res.smartbox_default,res.smartbox_is_sync_enabled);
		});
	}

	save() {
		info(this.is_sync_enabled);
		if (this.is_sync_enabled) {
			this.#saveSync();
		}
		else this.#saveLocal();
	}

	load() {
		if (this.is_sync_enabled) {
			this.#loadSync();
		}
		else this.#loadLocal();
	}
}

class App {
	constructor(name) {
		this.name=name;
	}

	#boxman

	#first_install() {
		info("First Install");
		this.#boxman.save(sites);
		//save the sites to chrome local/sync storage
	}

	initialize(sites,default1,is_sync_enabled=false) {
		this.#boxman = new BoxManager(sites,default1,is_sync_enabled);
		info(chrome.i18n.getUILanguage());
		chrome.runtime.onInstalled.addListener((details)=>{
			if (details.reason === "install") {
				this.#first_install();
			}
		});
	}
}

const app_name = "smartbox";
var app = new App(app_name);
var sites = [
	new Box("ytb","YouTube","https://www.youtube.com/results?search_query={%query%}"),
	new Box("ggl","Google","https://www.google.com/search?q={%query%}"),
	new Box("bng","Bing","https://www.bing.com/search?q={%query%}"),
	new Box("yaho","Yahoo","https://search.yahoo.com/?q={%query%}"),
	new Box("dckg","DuckDuckGo","https://duckduckgo.com/?q={%query%}"),
	new Box("iconf","IconFinder","https://www.iconfinder.com/search/?q={%query%}"),
	new Box("rddt","Reddit","https://www.reddit.com/search/?q={%query%}"),
	new Box("gthb","GitHub","https://github.com/search?q={%query%}"),
	new Box("adox","Android Developers","https://developer.android.com/s/results?q={%query%}"),
];
var default1=new Box("ggl","Google","https://www.google.com/search?q={%query%}");
app.initialize(sites, default1);
