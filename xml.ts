class Xml {
  #xml: string;

  constructor(safeXml: string) {
    this.#xml = safeXml;
  }

  toString(): string {
    return this.#xml;
  }

  static escape(input: unknown): string {
    if (input instanceof Xml) {
      return input.#xml;
    } else if (input instanceof Array) {
      return input.map((str) => Xml.escape(str)).join("");
    } else if (
      typeof input === "boolean" || typeof input === "number" ||
      typeof input === "string"
    ) {
      return input.toString().replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
    } else if (input === null || typeof input === "undefined") {
      return "";
    } else {
      throw new Error("Invalid input value");
    }
  }
}

export const xml = (
  strings: TemplateStringsArray,
  ...values: unknown[]
): Xml => {
  const trustedXml = new Xml(values.reduce<string>(
    (result, value, index) => result + Xml.escape(value) + strings[index + 1],
    strings[0],
  ));
  return trustedXml;
};
