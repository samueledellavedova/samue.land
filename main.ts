const decoder = new TextDecoder("utf-8");
const listener = Deno.listenTls({
  port: 443,
  cert: decoder.decode(Deno.readFileSync("cert.pem")),
  key: decoder.decode(Deno.readFileSync("key.pem")),
});

console.info("listening");

for await (const conn of listener) {
  (async () => {
    for await (const evt of Deno.serveHttp(conn)) {
      evt
        .respondWith(handleRequest(evt.request))
        .catch(() => void 0);
    }
  })();
}

function handleRequest(req: Request) {
  const url = new URL(req.url);

  switch (url.pathname) {
    case "/":
      if (req.method !== "GET")
        return new Response("", {
          status: 405,
        });
      return new Response("hi");
    default:
      return new Response("nope", {
        status: 404,
      });
  }
}