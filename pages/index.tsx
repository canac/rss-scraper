/** @jsx h */
import { h } from "https://deno.land/x/htm@0.0.10/mod.tsx";

export function Index() {
  return (
    <main class="flex min-h-screen flex-col bg-slate-200 py-8 px-8 font-sans md:px-24">
      <h1 class="pb-3 text-center text-3xl">RSS Scraper</h1>
      <p class="pb-6 text-center font-bold">
        Generate an RSS feed for publications that don't provide one by scraping
        a page for the article links and titles.
      </p>
      <form
        class="flex flex-col gap-8 rounded-xl p-4 bg-slate-300"
        action="/feed"
      >
        <label>
          <p class="text-xl font-bold">Page URL</p>
          <p>
            What is the URL of the publication that contains the item links?
          </p>
          <input
            class="my-2 w-full rounded-xl p-2 md:w-[40rem]"
            name="url"
            placeholder="https://example.com/blog"
            required
          />
        </label>
        <label>
          <p class="text-xl font-bold">Item selector</p>
          <p>
            What CSS selector will select a list of article elements, each
            containing exactly one article title and link?
          </p>
          <input
            class="my-2 w-full rounded-xl p-2 font-mono md:w-96"
            name="itemSelector"
            placeholder="div.article"
            required
          />
        </label>
        <label>
          <p class="text-xl font-bold">Title selector</p>
          <p>
            What CSS selector will select the title element inside of an article
            element?
          </p>
          <input
            class="my-2 w-full rounded-xl p-2 font-mono md:w-96"
            name="titleSelector"
            placeholder="h3.title"
            required
          />
        </label>

        <button
          type="submit"
          class="w-24 self-center rounded-xl bg-blue-500 px-4 py-2 hover:bg-blue-400 active:bg-blue-300"
        >
          Scrape!
        </button>
      </form>
    </main>
  );
}
