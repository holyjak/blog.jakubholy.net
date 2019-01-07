//const webpack = require("webpack");
const _ = require("lodash");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const path = require("path");
const Promise = require("bluebird");
const crypto = require("crypto");

const { createFilePath } = require(`gatsby-source-filesystem`);

exports.onCreateNode = async ({ node, getNode, actions }) => {
  const { createNode, createNodeField } = actions;
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
    const { id, internal, frontmatter, fields } = node;
    const contentType =
      {
        posts: "post",
        pages: "page",
        parts: "part",
        wp: "page" // FIXME ensure source = page or wp-page not just wp
      }[fields.source] || `unknown:${fields.source}`;
    const draft = !fields.prefix && fields.source !== "wp";
    createNode({
      id: `cp-${id}`,
      parentType: "MarkdownRemark",
      parent: id,
      internal: {
        //mediaType: "text/html", // FIXME plaintext here, html for Json
        type: "ContentPage",
        content: internal.content,
        contentDigest: internal.contentDigest
      },
      stylesheets: [],
      frontmatter: {
        menuTitle: "",
        tags: [],
        ...frontmatter
      },
      ...fields,
      contentType,
      published: fields.prefix,
      draft,
      publicContent: !draft && contentType !== "part",
      timeToRead: 0 // TODO via resolver
      // tableOfContents, wordCount  // TODO via resolver
    });
  } else if (node.internal.type === `PostsJson` && !skip(node) /*|| node.internal.type === `PagesJson`*/) {
    const {
      id,
      title,
      published,
      postType,
      slug,
      status,
      tags,
      categories,
      content,
      excerpt
    } = node;
    const fields = { slug };
    const draft = status !== "publish";
    const { html, stylesheets } = await fixWordpressFormatting(content);
    createNode({
      id: `cp-${id}`,
      parentType: "Json",
      parent: id,
      internal: {
        mediaType: "text/html",
        type: "ContentPage",
        content: html,
        contentDigest: crypto
          .createHash(`md5`)
          .update(html)
          .digest(`hex`)
      },
      stylesheets: stylesheets || [],
      frontmatter: {
        title,
        category: categories[0], // TODO Support multiple categories??
        tags,
        author: null,
        menuTitle: null
      },
      ...fields,
      contentType: postType,
      published,
      draft,
      publicContent: !draft,
      excerpt,
      timeToRead: 0 // FIXME seems not yet being set at this point
      // tableOfContents, wordCount
    });
  }
};

function skip(node) {
  return node.slug === "/2011/09/07/practical-intr%e2%80%a6and-java-proxy/";
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

function excerptWpPost(content, { moreOnly = false } = {}) {
  const moreIdx = content.indexOf("<!--more-->");
  if (moreIdx > 0) {
    return content.substring(0, moreIdx).replace(/(<br>)+$/, "");
  }
  if (moreOnly) return null;
  const paraIdx = content.indexOf("<br><br>");
  if (paraIdx > 0) {
    return content.substring(0, paraIdx);
  }
  return content.substring(0, 500).replace(/(<([^>]+)>)/gi, "");
}

const remarkSetFieldsOnGraphQLNodeType = require("gatsby-transformer-remark/gatsby-node")
  .setFieldsOnGraphQLNodeType;
const graphqlLib = require(`gatsby/graphql`);
exports.setFieldsOnGraphQLNodeType = (args, pluginOptions) => {
  const { type, getNode } = args;
  if (type.name !== `ContentPage`) {
    return {};
  }
  const fakeRemarkPluginOptions = { plugins: [] }; // FIXME Load from gatsby-config.js
  // See https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-transformer-remark/src/extend-node-type.js
  return remarkSetFieldsOnGraphQLNodeType(
    { ...args, type: { name: `MarkdownRemark` } },
    fakeRemarkPluginOptions
  ).then(({ html, excerpt, headings, timeToRead, tableOfContents, wordCount }) => {
    // const ContentTypes = new graphql.GraphQLEnumType({
    //   name: `ContentTypes`,
    //   values: {
    //     PAGE: { value: `page` },
    //     POST: { value: `post` },
    //     PART: { value: `part` }
    //   }
    // });
    /// Just reusing the excerpt.args.format fails with "Error: Schema must contain unique named types ..."
    const ExcerptFormats = new graphqlLib.GraphQLEnumType({
      name: `ExcerptFormatsCopy`,
      values: {
        PLAIN: { value: `plain` },
        HTML: { value: `html` }
      }
    });

    return {
      // +- Copied from MarkdownRemark:
      html: {
        type: html.type,
        resolve(contentPageNode) {
          if (contentPageNode.parentType === "Json") {
            return contentPageNode.internal.content;
          }
          const markdownNode = getNode(contentPageNode.parent);
          return html.resolve(markdownNode);
        }
      },
      excerpt: {
        type: excerpt.type,
        args: {
          pruneLength: excerpt.args.pruneLength,
          truncate: excerpt.args.truncate,
          format: {
            type: ExcerptFormats,
            defaultValue: `plain`
          }
        },
        resolve(contentPageNode, myArgs) {
          if (contentPageNode.parentType === "Json") {
            return excerptWpPost(contentPageNode.internal.content);
          }
          const markdownNode = getNode(contentPageNode.parent);
          // TODO excerptWpPost(html???, { moreOnly: true });
          return excerpt.resolve(markdownNode, myArgs);
        }
      }
    };
  });
};

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;

  return new Promise((resolve, reject) => {
    const postTemplate = path.resolve("./src/templates/PostTemplate.js");
    const pageTemplate = path.resolve("./src/templates/PageTemplate.js");
    const categoryTemplate = path.resolve("./src/templates/CategoryTemplate.js");
    resolve(
      graphql(
        `
          {
            allContentPage(
              filter: { publicContent: { eq: true } }
              sort: { fields: [published], order: DESC }
              limit: 1000
            ) {
              edges {
                node {
                  id
                  slug
                  contentType
                  frontmatter {
                    title
                    category
                  }
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          console.log(result.errors);
          reject(result.errors);
        }

        const items = result.data.allContentPage.edges;

        // Create category list
        const categorySet = new Set();
        items.forEach(edge => {
          const {
            node: {
              frontmatter: { category }
            }
          } = edge;

          if (category && category !== null) {
            categorySet.add(category);
          }
        });

        // Create category pages
        const categoryList = Array.from(categorySet);
        categoryList.forEach(category => {
          createPage({
            path: `/category/${_.kebabCase(category)}/`,
            component: categoryTemplate,
            context: {
              category
            }
          });
        });

        // Create posts
        const posts = items.filter(item => item.node.contentType === "post");
        posts.forEach(({ node }, index) => {
          const slug = node.slug;
          const next = index === 0 ? undefined : posts[index - 1].node;
          const prev = index === posts.length - 1 ? undefined : posts[index + 1].node;

          createPage({
            path: slug,
            component: postTemplate,
            context: {
              slug,
              prev,
              next
            }
          });
        });

        // and pages.
        const pages = items.filter(item => item.node.contentType === "page");
        pages.forEach(({ node }) => {
          const slug = node.slug;

          createPage({
            path: slug,
            component: pageTemplate,
            context: {
              slug
            }
          });
        });
      })
    );
  });
};

exports.onCreateWebpackConfig = ({ stage, actions }, options) => {
  switch (stage) {
    case `build-javascript`:
      actions.setWebpackConfig({
        plugins: [
          new BundleAnalyzerPlugin({
            analyzerMode: "static",
            reportFilename: "./report/treemap.html",
            openAnalyzer: true,
            logLevel: "error",
            defaultSizes: "gzip"
          })
        ]
      });
  }
};
