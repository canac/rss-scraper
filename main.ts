import { load } from "https://esm.sh/cheerio@1.0.0-rc.12";

const isNotNull = <I>(i: I | null): i is NonNullable<I> => i !== null;

type Item = {
  title: string;
  link: string;
};

type Selectors = {
  items: string;
  title: string;
};

async function extractItems(
  url: string,
  selectors: Selectors,
): Promise<Item[]> {
  const res = await fetch(url);
  const text = await res.text();
  const $ = load(text);
  return $(selectors.items).map((_, item) => {
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
}
