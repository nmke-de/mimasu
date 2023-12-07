const curl = fetch;
const backend = "http://127.0.0.1:3000";

// Fetch functions (nl = NewLeaf)
const nl = {
	search: async (query) => {
		if (!query)
			return new Response({});
		return await curl(backend + "/api/v1/search?q=" + query)
		.then(res => res.json());
	}
};

// Render functions
const render = {
	search: (json) => {
		if (!json)
			return "";
		let html = "";
		for (let o of json) {
			console.log(o.title);
			html += 
`<a href="/watch?v=${o.videoId}">${o.title}</a>
`;
		return html;
		}
	}
};

Bun.serve({
	port: 11102,
	fetch: async (req) => {
		// console.log(await curl(backend));
		const url = new URL(req.url);
		const json = await nl.search(url.searchParams.get("q"));
		console.log(json);
		return new Response(
`<!doctype html>
<html>
<body>
	<form action="/search" method="get">
		<input name=q type="text" placeholder="Seach" />
		<button>Search</button>
	</form>
	<code><pre>
${render.search(json)}
	</pre></code>
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
