FIXME
=====

The Ring-injected auto-reload script breaks page encoding, as it is put before the encoding meta, pushing it out of the first 1024B where it needs to be.

TODO
====

✅ Dark mode: Leverage `(prefers-color-scheme: dark)` media query & add CSS for that.

Convert .png to also .webp and .avif and modify the rendered html to serve all formats, whichever the browser prefers
