/** @jsx h */
import html, { h } from "https://deno.land/x/htm@0.2.3/mod.ts";
import UnoCSS from "https://deno.land/x/htm@0.2.3/plugins/unocss.ts";
import { Index } from "./pages/index.tsx";
import { feedFromUrl } from "./scrape.tsx";

// Read a parameter from URLSearchParams, throwing an exception if it is missing or empty
function readSearchParam(searchParams: URLSearchParams, name: string): string {
  const value = searchParams.get(name);
  if (!value) {
    throw new Error(`Missing "${name}" search parameter`);
  }
  return value;
}

// Enable UnoCSS
html.use(UnoCSS());

const port = parseInt(Deno.env.get("PORT") ?? "", 10);
Deno.serve({ port: Number.isNaN(port) ? undefined : port }, (req) => {
  try {
    const url = new URL(req.url);

    if (req.method === "GET" && url.pathname === "/") {
      return html({
        body: <Index />,
        title: "RSS Scraper",
      });
    }

    if (req.method === "GET" && url.pathname === "/feed.xml") {
      return feedFromUrl(readSearchParam(url.searchParams, "url"), {
        items: readSearchParam(url.searchParams, "itemSelector"),
        title: readSearchParam(url.searchParams, "titleSelector"),
      });
    }

    return new Response("Not Found", { status: 404 });
  } catch (err) {
    const message = err instanceof Error
      ? err.message
      : "Internal Server Error";
    return new Response(message, { status: 500 });
  }
});
