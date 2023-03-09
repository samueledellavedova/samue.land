const fontUrl = "https://github.com/googlefonts/RobotoMono/raw/main/fonts/ttf/RobotoMono-Regular.ttf";
const fontFileName = fontUrl.split('/').pop()!;
const font = await ensureFontFile();
const indexPage = Deno.readFileSync("index.html");
const listener = Deno.listenTls({
  port: 443,
  cert: Deno.readTextFileSync("cert.pem"),
  key: Deno.readTextFileSync("key.pem"),
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

async function ensureFontFile(): Promise<Uint8Array> {
  try {
    return Deno.readFileSync(fontFileName);
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) throw err;
  }

  const res = await fetch(fontUrl);
  const buf = (await res.arrayBuffer()) as Uint8Array;

  Deno.writeFileSync(fontFileName, buf);

  return buf;
}

function handleRequest(req: Request): Response {
  const url = new URL(req.url);

  switch (url.pathname) {
    case "/":
      if (req.method !== "GET")
        return new Response("", {
          status: 405,
        });
      return new Response(indexPage, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    case `/static/fonts/${fontFileName}`:
      if (req.method !== "GET")
        return new Response("", {
          status: 405,
        });
      return new Response(font, {
        headers: {
          "Content-Type": "font/ttf",
        },
      });
    default:
      return new Response("nope", {
        status: 404,
      });
  }
}
