const curl = fetch;
const backend = "http://127.0.0.1:3000";

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
			html += `<li><a href="/watch?v=${o.videoId}">${o.title}</a></li>\n`;
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
		html += "\n<div>\n" + render.search(json.recommendedVideos) + "\n</div>\n";
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
			case "/search":
				mread = nl.search;
				mwrite = render.search;
				mparams = url.searchParams.get("q");
				break;
			case "/watch":
				mread = nl.video;
				mwrite = render.video;
				mparams = url.searchParams.get("v");
		}
		const json = await mread(mparams);
		return new Response(
`<!doctype html>
<html>
<head>
	<title>Mimasu – ${mparams}</title>
	<meta charset=utf-8 />
</head>
<body>
	<form action="/search" method="get">
		<input name=q type="text" placeholder="Seach" />
		<button>Search</button>
	</form>
	<div>
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
