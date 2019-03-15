const { createFilePath } = require(`gatsby-source-filesystem`);

// module.exports = async function onCreateNode(
//   { node, actions, loadNodeContent, createNodeId, createContentDigest },
//   pluginOptions
// ) {
//   // only log for nodes of mediaType `text/yaml`
//   if (node.internal.mediaType !== `text/yaml`) {
//     return
//   }
//
//   const { createNode, createParentChildLink } = actions
//
//   function transformObject(obj, id, type) {
//     const yamlNode = {
//       ...obj,
//       id,
//       children: [],
//       parent: node.id,
//       internal: {
//         contentDigest: createContentDigest(obj),
//         type,
//       },
//     }
//     createNode(yamlNode)
//     createParentChildLink({ parent: node, child: yamlNode })
//   }
//
//   // const fileContent = await loadNodeContent(node)
//   // const parsedContent = jsYaml.load(content)
// }

module.exports = async function onCreateNode(
  { node, getNode, actions, loadNodeContent, createNodeId, createContentDigest },
  pluginOptions
) {
  const { createNode, createParentChildLink, createNodeField } = actions;

  function transformObject(obj, parentType) {
    const contentPageNode = {
      ...obj,
      id: createNodeId(`cp-${node.id}`),
      parentType,
      children: [],
      parent: node.id,
      internal: {
        //mediaType: "text/html", // FIXME plaintext here, html for Json
        type: "ContentPage",
        ...obj.internal
      },
      stylesheets: obj.stylesheets || [],
      frontmatter: {
        author: null,
        menuTitle: "",
        tags: [],
        ...obj.frontmatter
      },
      timeToRead: 0 // TODO via resolver
      // tableOfContents, wordCount  // TODO via resolver
    };
    createNode(contentPageNode);
    createParentChildLink({ parent: node, child: contentPageNode });
  }

  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode });
    const fileNode = getNode(node.parent);
    const source = fileNode.sourceInstanceName;
    const separtorIndex = ~slug.indexOf("--") ? slug.indexOf("--") : 0;
    const shortSlugStart = separtorIndex ? separtorIndex + 2 : 0;

    if (source !== "parts") {
      const safeSlug = slug.substring(shortSlugStart)
        .replace(/%\w+/g, "") // rm html entities
        .replace(/[^\x20-\x7E]/g, ""); // strip non-ASCII chars
      createNodeField({
        node,
        name: `slug`,
        value: `${separtorIndex ? "/" : ""}${safeSlug}`
      });
    }
    createNodeField({
      node,
      name: `prefix`,
      value: separtorIndex ? slug.substring(1, separtorIndex) : ""
    });
    createNodeField({
      node,
      name: `source`,
      value: source
    });
    const { internal, frontmatter, fields } = node;
    const contentType =
      {
        posts: "post",
        pages: "page",
        parts: "part",
        wp: "page" // FIXME ensure source = page or wp-page not just wp
      }[fields.source] || `unknown:${fields.source}`;
    const draft = !fields.prefix && fields.source !== "wp";
    if (source !== "parts") {
      const contentPageNode = {
        internal: {
          content: internal.content,
          contentDigest: internal.contentDigest
        },
        frontmatter,
        ...fields,
        contentType,
        published: fields.prefix,
        draft,
        publicContent: !draft && contentType !== "part"
      };
      transformObject(contentPageNode, "MarkdownRemark");
    }
  } else if (
    node.internal.type === `PostsJson` &&
    !skip(node) /*|| node.internal.type === `PagesJson`*/
  ) {
    const { title, published, postType, slug, status, tags, categories, content, excerpt } = node;
    // OR: const content = await loadNodeContent(node);
    const publishedDateOnly = published.replace(/(\d{4}-\d\d-\d\d).+/, "$1");
    const fields = { slug };
    const draft = status !== "publish";
    const { html, stylesheets } = await fixWordpressFormatting(content);
    const contentPageNode = {
      internal: {
        content: html,
        contentDigest: createContentDigest(html)
      },
      stylesheets: stylesheets || [],
      frontmatter: {
        title,
        category: categories[0], // TODO Support multiple categories??
        tags
      },
      ...fields,
      contentType: postType,
      published: publishedDateOnly,
      draft,
      publicContent: !draft,
      excerpt
    };
    transformObject(contentPageNode, "Json");
  }
};

function skip(node) {
  return node.slug === "/2011/09/07/practical-intr%e2%80%a6and-java-proxy/";
}

async function fixWordpressFormatting(html) {
  // <script src="https://gist.github.com/holyjak/c57c6e31d515259ed05f5a520571bb2c.js"></script>
  // FIXME Use something that can strip comments (gists in comments => huge files)

  // Replace gists
  const gistRE = /(?:<div class="wp-block-embed__wrapper">|\n|<br><br>)\s*(https:\/\/gist\.github\.com\/(?:\/|\w)*)/g;
  const replacements = {};
  let match;
  let gistStylesheet; // same for all gists
  while ((match = gistRE.exec(html)) !== null) {
    const gistUrl = match[1];
    const gist = await fetchGist(gistUrl);
    if (gist) {
      // TODO Support highlights? See https://github.com/weirdpattern/gatsby-remark-embed-gist/blob/master/src/index.js#L133
      replacements[gistUrl] = gist.html;
      gistStylesheet = gist.stylesheet;
    }
  }

  const fixedHtml = html.replace(gistRE, (_match, gistUrl) => replacements[gistUrl] || gistUrl);
  return { html: fixedHtml, stylesheets: gistStylesheet ? [gistStylesheet] : [] };
}

const fetch = require("node-fetch");
function fetchGist(url) {
  return fetch(`${url}.json`)
    .then(g => g.json())
    .then(j => ({ html: j.div, stylesheet: j.stylesheet }))
    .catch(err => {
      console.error("Failed fetching gist", url, err);
      return null;
    });
}
