const x = {
    "ytb": "https://www.youtube.com/results?search_query=",
    "ggl": "https://www.google.com/search?q=",
    "bng": "https://www.bing.com/search?q=",
    "dckgo": "https://duckduckgo.com/?q=",
    "sszlk": "https://www.seslisozluk.net/",
    "yaho": "https://search.yahoo.com/?q=",
    "trryn": "https://www.torrentoyunindir.com/?s=",
    "ydex": "https://yandex.com.tr/search/?text=",
    "itebooks": "http://www.allitebooks.org/?s=",
    "iconf":"https://www.iconfinder.com/search/?q=",
    "rddt":"https://www.reddit.com/search/?q="
}
function createURL(text, query) {
    if (x[text] != undefined) {
        return `${x[text]}${query}`;
    }
    else {
        return `${text}${query}`;
    }
}
chrome.omnibox.onInputEntered.addListener((text, disposition) => {
    disposition = "currentTab";
    var arr, site, query;
    arr = text.split(' ');
    if (arr.length > 1) {
        site = arr[0].toLowerCase().trim();
        arr.shift();
        query = arr.join(" ").trim();
        chrome.tabs.update({
            url: createURL(site, query)
        });
    }
});
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
    var arr, site, query;
    arr = text.split(' ');
    if (arr.length > 1) {
        site = arr[0].toLowerCase().trim();
        arr.shift();
        query = arr.join(" ").trim();

        if (x[site] != undefined) {
            suggest([
                { content: `${x[site]}${query}`, description: `Search on ${site} for ${query}` }
            ]);
        }
        else if (text.length == 0) {

        }
        else {
            suggest([
                { content: `http://${site} ${query}`, description: `Search on ${site} for ${query}` },
                { content: `http://${site}.com/ ${query}`, description: `Search on ${site}.com/ for ${query}` },
                { content: `http://${site}.net/ ${query}`, description: `Search on ${site}.net/ for ${query}` },
                { content: `http://${site}.org/ ${query}`, description: `Search on ${site}.org/ for ${query}` },
            ]);
        }
    }
});