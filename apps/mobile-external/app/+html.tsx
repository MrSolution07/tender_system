import { ScrollViewStyleReset } from "expo-router/html";
import type { ReactNode } from "react";

export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const css = `
body {
  background-color: #F4F7F8;
}
::selection {
  background: #E6F3F4;
  color: #122027;
}
a,
[role="button"] {
  cursor: pointer;
}
a:focus-visible,
[role="button"]:focus-visible,
input:focus-visible,
textarea:focus-visible {
  outline: 2px solid #006E78;
  outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  * {
    scroll-behavior: auto !important;
  }
}
`;
