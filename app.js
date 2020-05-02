var sites = [];

function loadSites() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            console.log("It's ready!..");
            sites = JSON.parse(xhr.response);
            console.log(sites);
        }
    }
    xhr.open("GET",chrome.extension.getURL("/sites.json"));
    xhr.send();
}

loadSites();

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
    if (operation.startsWith("+")) {
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
    }
    else if (operation.startsWith("-")) {
        for (var i = 0; i < sites.length; i++) {
            if ( sites[i].name == operation.substring(1) ) {
                sites.splice(i,1);
            }
        }
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
    else if ( text == "?" ) {
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