#!/usr/bin/env -S bun run

const curl = fetch;
const backend = "http://127.0.0.1:3000";

const date = (json) => {
	if (!json)
		return "";
	else if (json.publishedText)
		return json.publishedText;
	else if (json.published) {
		const dt = new Date(json.published * 1000);
		return `since ${dt.toISOString()}`;
	} else
		return "";
};

// Fetch functions (nl = NewLeaf)
const nl = {
	search: async (query) => {
		if (!query)
			return new Response({});
		return await curl(backend + "/api/v1/search?q=" + query)
		.then(res => res.json());
	},
	video: async (id) => {
		if (!id)
			return new Response({});
		return await curl(backend + "/api/v1/videos/" + id)
		.then(res => res.json());
	},
	channel: async (ucid) => {
		if (!ucid)
			return new Response({});
		return await curl(backend + "/api/v1/channels/" + ucid)
		.then(res => res.json());
	}
};

// Render functions
const render = {
	search: (json) => {
		if (!json)
			return "";
		let html = "<ul>\n";
		for (let i = 0; i < json.length; i++) {
			const o = json[i];
			html += `<li>${o.second__lengthText} <a href="/watch?v=${o.videoId}">${o.title}</a> by <a href="/channel/${o.authorId}">${o.author}</a> ${date(o)}</li>\n`;
		}
		html += "</ul>\n";
		return html;
	},
	video: (json) => {
		if (!json)
			return "";
		let html = `<h1>${json.title}</h1>\n`;
		html += "<video controls>";
		for (let i = 0; i < json.formatStreams.length; i++) {
			const o = json.formatStreams[i];
			html += `\n\t<source src="${o.url}" type="${o.second__mime}" />`;
		}
		html += "\n</video>";
		html += `\n<div>by <a href="/channel/${json.authorId}">${json.author}</a>`;
		html += ` ${date(json)}</div>\n`;
		html += `\n<div>${json.descriptionHtml}</div>\n`;
		html += "\n<div>\n" + render.search(json.recommendedVideos) + "\n</div>\n";
		return html;
	},
	channel: (json) => {
		if (!json)
			return "";
		let html = `<h1>${json.author}</h1>\n`;
		html += `\n<div>${json.descriptionHtml}</div>\n`;
		html += "<div>\n" + render.search(json.latestVideos) + "\n</div>\n";
		return html;
	}
};

Bun.serve({
	port: 11102,
	fetch: async (req) => {
		// console.log(await curl(backend));
		const url = new URL(req.url);
		let mread = nl.search;
		let mwrite = render.search;
		let mparams = undefined;
		switch (url.pathname) {
			case "/":
				mread = () => null;
				mwrite = () => "";
				mparams = "Startpage";
				break;
			case "/mimasu.svg":
				return new Response(Bun.file("./mimasu.svg"));
			case "/mimasu.css":
				return new Response(Bun.file("./mimasu.css"));
			case "/search":
				mread = nl.search;
				mwrite = render.search;
				mparams = url.searchParams.get("q");
				break;
			case "/watch":
				mread = nl.video;
				mwrite = render.video;
				mparams = url.searchParams.get("v");
				break;
			default:
				mread = nl.channel;
				mwrite = render.channel;
				mparams = url.pathname.split("/")[2];
		}
		const json = await mread(mparams);
		return new Response(
`<!doctype html>
<html>
<head>
	<title>Mimasu – ${mparams}</title>
	<meta charset=utf-8 />
	<link rel="shortcut icon" type="image/svg" href="/mimasu.svg" />
	<link rel="stylesheet" type="text/css" href="/mimasu.css" />
</head>
<body>
	<a id=icon class="fixbar" href="/">
		<img src="/mimasu.svg" alt="MIMASU" />
	</a>
	<form id=searchbar class="fixbar" action="/search" method="get">
		<input name=q type="text" placeholder="Search" />
		<button>Search</button>
	</form>
	<div id=content>
${mwrite(json)}
	</div>
</body>
</html>
`
		, {
			status: 200,
			statusText: "OK",
			headers: {
				"Content-Type": "text/html"
			}
		});
	}
});
