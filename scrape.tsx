import { xml } from "./xml.ts";
import { load } from "https://esm.sh/v111/cheerio@1.0.0-rc.12";
import { ElementType } from "https://esm.sh/v111/domelementtype@2.3.0";

export type Selectors = {
  items: string;
  title: string;
};

// Generate a list of feed items from a URL
// selectors.items should select elements that each contain an item
// selectors.title should select an element within that item containing the text of the feed
// The item element should also contain a single <a> tag with an href attribute that is the link of the item
export async function feedFromUrl(
  url: string,
  selectors: Selectors,
): Promise<Response> {
  const res = await fetch(url);
  if (!res.ok) {
    return new Response(res.statusText, { status: res.status });
  }

  const text = await res.text();
  const $ = load(text);
  const items = $(selectors.items).map((_, item) => {
    const $item = $(item);
    const title = $item.find(selectors.title).text();
    if (!title) {
      console.error("Couldn't find the title element");
      return null;
    }

    // Allow the item itself to be the link
    const $link = item.type === ElementType.Tag && item.tagName === "a"
      ? $item
      : $item.find("a");
    const link = $link.attr("href");
    if (!link) {
      console.error("Couldn't find the link element");
      return null;
    }

    return {
      title: title.trim(),
      // Resolve the potentially relative URL into an absolute URL
      link: new URL(link, url).toString(),
    };
  }).toArray().filter(Boolean);

  if (items.length === 0) {
    return new Response("No items found", {
      status: 404,
    });
  }

  const xmlStr = '<?xml version="1.0" encoding="UTF-8" ?>' + xml`
<rss version="2.0">
  <channel>
    <title>${$("head > title").text()}</title>
    <description>Scraped RSS feed for ${url}</description>
    <link>${url}</link>
    ${
    items.map((item) =>
      xml`<item>
  <title>${item.title}</title>
  <link>${item.link}</link>
  <guid>${item.link}</guid>
</item>`
    )
  }
  </channel>
</rss>
`;
  return new Response(xmlStr, {
    headers: { "content-type": "application/xml;charset=utf-8" },
  });
}
