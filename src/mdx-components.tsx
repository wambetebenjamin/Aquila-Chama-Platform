import type { MDXComponents } from "mdx/types";

/**
 * Required by @next/mdx. The loader aliases `next-mdx-import-source-file` to
 * this file first; without it Next falls back to `@mdx-js/react`, which calls
 * `React.createContext` at module scope and breaks inside the React Server
 * Component graph (the server build of React has no `createContext`).
 *
 * This implementation is deliberately context-free so the same map is used on
 * the server and the client.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components };
}
