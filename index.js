const curl = fetch;
const backend = "http://127.0.0.1:3000";

const icon = async () => new Response(
	await Bun.file("./mimasu.svg").text(),
	{
		status: 200,
		statusText: "OK",
		headers: {
			"Content-Type": "image/svg"
		}
	}
);

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
			html += `<li><a href="/watch?v=${o.videoId}">${o.title}</a> by <a href="/channel/${o.authorId}">${o.author}</a></li>\n`;
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
		html += `\n<div>by <a href="/channel/${json.authorId}">${json.author}</a></div>\n`;
		html += "\n<div>\n" + render.search(json.recommendedVideos) + "\n</div>\n";
		return html;
	},
	channel: (json) => {
		if (!json)
			return "";
		let html = `<h1>${json.author}</h1>\n`;
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
</head>
<body>
	<a href="/">
		<svg width="48" height="48" viewBox="0 0 12.7 12.7" version="1.1" id="svg1">
			<path style="fill:#000000;fill-opacity:0;stroke:#000000;stroke-width:1" d="M 0.63926685,1.1731561 C 6.3177573,1.8255192 8.0424061,4.0028653 8.0424061,4.0028653 L 3.1202532,10.958268 C 0.15853276,9.1127667 2.147511,8.4467492 3.6236697,8.5979212 6.2385036,8.8657042 11.814129,11.710128 11.814129,11.710128" id="path2" />
			<path style="fill:#000000;fill-opacity:0;stroke:#000000;stroke-width:1" d="M 10.886871,9.0109114 8.7013206,12.477339" id="path3" />
		</svg>
	</a>
	<form action="/search" method="get">
		<input name=q type="text" placeholder="Search" />
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
