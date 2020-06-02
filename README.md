![SmartBox](images/logo-design.svg)
# chrome-smartbox

`smartbox v4.1`

Searching would not be much simpler. Just type "@" in URL bar. Then type the search engine you wanna search e.g. 'ytb', 'ggl', 'bng' etc. Then type the search string.

Use it well...

## Available Search Engines & Keywords

| Platform     | Keyword   |
|--------------|-----------|
| YouTube      | ytb       |
| Google       | ggl       |
| Android Docs | dvand     |
| Bing         | bng       |
| DuckDuckGo   | dckgo     |
| SesliSozluk  | sszlk     |
| Yahoo        | yaho      |
| Torrent O... | trryn     |
| Yandex       | ydex      |
| All IT e-b...| itebx     |
| Iconfinder   | iconf     |
| Reddit       | rddt      |
| TorrentMafya | trrmf     |
| GitHub       | gthb      |

## Screenshot

![Searching on YouTube about chrome-smartbox](media/chrome-smartbox-search-focused.png)
![Listing all search engines by comma seperated list](media/chrome-smartbox-listing-comma-focused.png)
![Listing all search engines one by one](media/chrome-smartbox-listing-focused.png)

## Usage

### JSON data...

```json
[
    {
        "name": "xmpl",
        "desc": "example",
        "url": "https://example.com/search/?q={%query%}",
    }
]
```

### Searching

Simple to search on whatever you want.

```
@ <keyword> <search_query>
```

keyword: is the short version of the web site's name.
search_query: search query, nothing special. Just I need to mention here it'll be encoded.

### Adding a search engine

Adding search engine to smartbox is simple. Please just type:

```
@ +<keyword> <site_name> <url>
```

keyword: is the short-name of the web site
site_name: is the name of the web site
url: can be similar to this one: "https://example.com/search?q="

### Removing a search engine

Removing a search engine from database as simple as adding one. Please just type:

```
@ -<keyword>
```

keyword: is the short-name of the web site.

### Listing all available search engines

There're 2 options you can try to list all of them. The first one is:

```
@ .
```

You can list just specific amount of them by typing "?".

The other one is my favorite. You can quickly review what's available in comma seperated form. Try:

```
@ ...
```

Which one is better?

### Importing, Exporting and Adding sites

Importing, easily pasting prepared JSON array of search engines...
```
@ <= <json_array>
```

Exporting, easly while on omnibox. :D
```
@ >=
```

Adding array of search engines, it's now easier. :D
```
@ +<= <json_array>

## ChangeLog

* Storing changes locally. (Finally)
* Importing, Exporting and Adding sites (Experimental, but yes :D)
* General improvements and fixes.
