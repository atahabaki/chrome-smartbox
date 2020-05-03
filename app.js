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
        "name":"dvand",
        "desc": "Android Devs",
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
        "name":"sszlk",
        "desc":"SesliSözlük",
        "url":"https://seslisozluk.net/{%query%}"
    },
    {
        "name":"yaho",
        "desc":"Yahoo",
        "url":"https://search.yahoo.com/?q={%query%}"
    },
    {
        "name":"trryn",
        "desc":"Torrent Oyun İndir",
        "url":"https://www.torrentoyunindir.com/?s={%query%}"
    },
    {
        "name":"ydex",
        "desc":"Yandex",
        "url":"https://yandex.com/search/?text={%query%}"
    },
    {
        "name":"itebx",
        "desc":"All IT e-Books",
        "url":"http://allitebooks.org/?s={%query%}"
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
        "name":"trrmfy",
        "desc":"TorrentMafya",
        "url":"https://www.torrentmafya.net/?s={%query%}"
    },
    {
        "name":"gthb",
        "desc":"GitHub",
        "url":"https://github.com/search?q={%query%}"
    }
];


function save() {
    chrome.storage.local.set({"ssearch_sites":sites}, () => {
        console.log("Saved!",sites);
        sites = sites;
    });
}

function load() {
    chrome.storage.local.get('ssearch_sites', (res) => {
        console.log("Got!",res.ssearch_sites);
        sites = res.ssearch_sites;
    });
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

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
    disposition = "currentTab";
    var arr, site, query;
    arr = text.split(' ');
    let operation = arr[0];
    console.log(sites);
    if (operation === "+" ) {
        let url = arr[arr.length - 1];
        arr.pop();
        arr.shift();
        let name = arr.join(' ');
        sites.push(
            {
                "name":`${operation.substring(1)}`,
                "desc":name,
                "url":url
            }
        );
        save();
        load();
    }
    else if (operation === "-") {
        for (var i = 0; i < sites.length; i++) {
            if ( sites[i].name == operation.substring(1) ) {
                sites.splice(i,1);
            }
        }
        save();
        load();
    }
    else if (operation === "<=" ) {
        let temp = text.substring(text.indexOf("["));
        let temp_sites = JSON.parse(temp);
        sites = temp_sites;
        save();
        load();
    }
    else if (operation === "+<=" ) {
        let temp = text.substring(text.indexOf("["));
        let temp_sites = JSON.parse(temp);
        for (var i = 0; i < temp_sites.length; i++) {
            sites.push(temp_sites[i]);
        }
        save();
        load();
    }
    else {
        if ( arr.length > 1 ) {
            site = arr[0].toLowerCase().trim();
            arr.shift();
            query = arr.join(" ").trim();
            var createdurl = createURL(site,query);
            chrome.tabs.update({
                url: createdurl
            });
        }
    }
});

function rawSuggest(site, query) {
    return [
        { content: `${site}/${query}`, description: `Search on ${site} for ${query}` },
        { content: `${site}.com/${query}`, description: `Search on ${site}.com/ for ${query}` },
        { content: `${site}.net/${query}`, description: `Search on ${site}.net/ for ${query}` },
        { content: `${site}.org/${query}`, description: `Search on ${site}.org/ for ${query}` },
    ];
}

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
    text = text.trim();
    if ( text == "." ) {
        let suggestions = [];
        sites.forEach(e => {
            let temp = {
                content: `${e.url}`, description: `Search on ${e.name} (${e.desc})`
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
                    content: JSON.stringify(sites), description: "Export to JSON"
                }
            ]
        );
    }
    else {
        var arr, site, query;
        arr = text.split(' ');
        if ( arr.length > 1) {
            site = arr[0].toLowerCase().trim();
            arr.shift();
            query = arr.join(" ").trim();

            let suggestions = [];

            sites.forEach(e => {
                let temp = {
                    content: "",
                    description: ""
                };
                if (e.name === site || e.name.includes(site)) {
                    temp.content = `${e.url}${query}`;
                    temp.description = `Search for ${query} on ${e.desc}`;
                    suggestions.push(temp);
                }
                else {
                    rawSuggest(site,query).forEach(e=>suggestions.push(e));
                }
            });
            suggest(suggestions);
        }
    }
});