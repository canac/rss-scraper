// This file is essentially copied from https://github.com/dyedgreen/deno-jsx/blob/main/mod.ts
// It removes the logic that disallows certain HTML tags from having content, therefore making it suitable for XML.

declare global {
  namespace JSX {
    // deno-lint-ignore no-explicit-any
    type Element = any;
    interface IntrinsicElements {
      [elemName: string]: unknown;
    }
    interface ElementChildrenAttribute {
      children: Record<never, never>;
    }
  }
}

type literal = string | number;
type NodeSet =
  | Node
  | literal
  | null
  | false
  | (Node | literal | null | false)[];

export interface Component<P = unknown> {
  (props: P): NodeSet | Promise<NodeSet>;
}

interface Children {
  children?: (Node | literal | null | false)[];
}

// deno-lint-ignore no-explicit-any
export interface Node<P = any> {
  type: Component<P> | string;
  props: P & Children;
}

export function h(
  type: Component | string,
  props?: { [prop: string]: unknown },
  ...children: (Node | literal | null | false)[]
): JSX.Element {
  return { type, props: { ...props, children } };
}

export function Fragment({ children }: Children) {
  return children;
}

function escapeHTML(text: string): string {
  const entities: { [char: string]: string } = {
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&#39;",
    '"': "&#34;",
  };
  return text.replaceAll(/[&<>"']/g, (char) => {
    return entities[char];
  });
}

async function renderNodeSetToString(nodes: NodeSet): Promise<string> {
  if (nodes == null || nodes === false) {
    return "";
  } else if (typeof nodes !== "object") {
    return escapeHTML(`${nodes}`);
  } else if (Array.isArray(nodes)) {
    return (await Promise.all(
      nodes.map((child: NodeSet): Promise<string> =>
        renderNodeSetToString(child)
      ),
    )).join("");
  } else {
    return await renderToString(nodes);
  }
}

/**
 * Renders a given JSX node to a string.
 */
export async function renderToString(jsx: Node): Promise<string> {
  if (typeof jsx.type === "function") {
    return await renderNodeSetToString(await jsx.type(jsx.props));
  } else {
    // render props
    const props = Object.entries(jsx.props).map((
      [prop, value]: [string, unknown],
    ): string => {
      switch (prop) {
        case "dangerouslySetInnerHTML":
        case "children":
          return "";
        default:
          return ` ${prop}="${
            "".concat(value as string).replace(/\"/g, '\\"')
          }"`;
      }
    }).join("");

    // render inner HTML
    const children = jsx.props?.children ?? [];
    let innerHTML = "";
    if (jsx.props.dangerouslySetInnerHTML != null) {
      innerHTML = jsx.props.dangerouslySetInnerHTML?.__html ?? "";
    } else {
      innerHTML = await renderNodeSetToString(children);
    }

    // render HTML tag
    return `<${jsx.type}${props}>${innerHTML}</${jsx.type}>`;
  }
}
