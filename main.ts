const fontUrl = "https://github.com/googlefonts/RobotoMono/raw/main/fonts/ttf/RobotoMono-Regular.ttf";
const fontFileName = fontUrl.split('/').pop()!;
const font = await ensureFontFile();
const indexPage = Deno.readFileSync("index.html");
const indexScript = Deno.readFileSync("static/scripts/index.js");
const indexStyle = Deno.readFileSync("static/styles/index.css");
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
  const path = "static/fonts/" + fontFileName;

  try {
    return Deno.readFileSync(path);
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) throw err;
  }

  const res = await fetch(fontUrl);
  const buf = (await res.arrayBuffer()) as Uint8Array;

  Deno.writeFileSync(path, buf);

  return buf;
}

function methodNotAllowed(): Response {
  return new Response("", {
    status: 405,
  });
}

function handleRequest(req: Request): Response {
  const url = new URL(req.url);

  switch (url.pathname) {
    case "/":
      if (req.method !== "GET")
        return methodNotAllowed();

      return new Response(indexPage, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    case `/static/fonts/${fontFileName}`:
      if (req.method !== "GET")
        return methodNotAllowed();

      return new Response(font, {
        headers: {
          "Content-Type": "font/ttf",
        },
      });
    case "/static/scripts/index.js":
      if (req.method !== "GET")
        return methodNotAllowed();

      return new Response(indexScript, {
        headers: {
          "Content-Type": "application/javascript; charset=utf-8",
        },
      });
    case "/static/styles/index.css":
      if (req.method !== "GET")
        return methodNotAllowed();

      return new Response(indexStyle, {
        headers: {
          "Content-Type": "text/css; charset=utf-8",
        },
      });
    default:
      return new Response("nope", {
        status: 404,
      });
  }
}
