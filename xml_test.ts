import { expect } from "jsr:@std/expect@1";
import { describe, it } from "jsr:@std/testing@1/bdd";
import { xml } from "./xml.ts";

describe("render to string", () => {
  it("handles simple tag", () => {
    expect(xml`<tag></tag>`.toString()).toBe("<tag></tag>");
  });

  it("handles attributes", () => {
    expect(
      xml`<tag a="${1}" b="${"2"}" c="${true}" d="${false}" e="${null}" f="${undefined}"></tag>`
        .toString(),
    )
      .toBe(
        '<tag a="1" b="2" c="true" d="false" e="" f=""></tag>',
      );
  });

  it("escapes attribute values", () => {
    expect(
      xml`<tag a="${`<tag>"&"</tag>`}"></tag>`.toString(),
    )
      .toBe(
        '<tag a="&lt;tag&gt;&quot;&amp;&quot;&lt;/tag&gt;"></tag>',
      );
  });

  it("escapes contents", () => {
    expect(
      xml`<tag>${`<tag>"&"</tag>`}</tag>`
        .toString(),
    )
      .toBe(
        "<tag>&lt;tag&gt;&quot;&amp;&quot;&lt;/tag&gt;</tag>",
      );
  });

  it("handles nested xml tags", () => {
    expect(
      xml`<outer>${xml`<inner></inner>`}</outer>`
        .toString(),
    )
      .toBe(
        "<outer><inner></inner></outer>",
      );
  });

  it("handles arrays", () => {
    expect(
      xml`<outer>${
        [1, 2, 3].map((value) => xml`<inner>${value}</inner>`)
      }</outer>`
        .toString(),
    )
      .toBe(
        "<outer><inner>1</inner><inner>2</inner><inner>3</inner></outer>",
      );
  });

  it("throws for invalid values", () => {
    expect(() => xml`<tag>${{}}</outer>`)
      .toThrow();
  });
});
