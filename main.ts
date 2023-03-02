const decoder = new TextDecoder("utf-8");
const listener = Deno.listenTls({
  port: 443,
  cert: decoder.decode(Deno.readFileSync("cert.pem")),
  key: decoder.decode(Deno.readFileSync("key.pem"))
});

console.info("listening");

for await (const conn of listener) {
  (async () => {
    for await (const req of Deno.serveHttp(conn)) {
      req.respondWith(new Response("hi"));
    }
  })();
}