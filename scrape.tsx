/** @jsx h */
import { h, renderToString } from "./xml-jsx.ts";
import { load } from "https://esm.sh/cheerio@1.0.0-rc.12";

const isNotNull = <I,>(i: I | null): i is NonNullable<I> => i !== null;

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
  const text = await res.text();
  const $ = load(text);
  const items = $(selectors.items).map((_, item) => {
    const $item = $(item);
    const title = $item.find(selectors.title).text();
    if (!title) {
      console.error("Couldn't find the title element");
      return null;
    }

    const link = $item.find("a").attr("href");
    if (!link) {
      console.error("Couldn't find the link element");
      return null;
    }

    return {
      title: title.trim(),
      // Resolve the potentially relative URL into an absolute URL
      link: new URL(link, url).toString(),
    };
  }).toArray().filter(isNotNull);

  const xml = '<?xml version="1.0" encoding="UTF-8" ?>' +
    await renderToString(
      <rss version="2.0">
        <channel>
          <title>{$("title").text()}</title>
          <link>{url}</link>
          {items.map((item) => (
            <item>
              <title>{item.title}</title>
              <link>{item.link}</link>
              <guid>{item.link}</guid>
            </item>
          ))}
        </channel>
      </rss>,
    );
  return new Response(xml, {
    headers: { "content-type": "application/xml;charset=utf-8" },
  });
}
