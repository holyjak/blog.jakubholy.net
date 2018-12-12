//const webpack = require("webpack");
const _ = require("lodash");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const path = require("path");
const Promise = require("bluebird");

const { createFilePath } = require(`gatsby-source-filesystem`);

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNode, createNodeField } = actions;
  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode });
    const fileNode = getNode(node.parent);
    const source = fileNode.sourceInstanceName;
    const separtorIndex = ~slug.indexOf("--") ? slug.indexOf("--") : 0;
    const shortSlugStart = separtorIndex ? separtorIndex + 2 : 0;

    if (source !== "parts") {
      createNodeField({
        node,
        name: `slug`,
        value: `${separtorIndex ? "/" : ""}${slug.substring(shortSlugStart)}`
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
    const contentType = {
        posts: "post",
        pages: "page",
        parts: "part"
      }[fields.source] || `unknown:${fields.source}`;
    const draft = !fields.prefix;
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
      frontmatter: {
        menuTitle: "",
        ...frontmatter
      },
      ...fields,
      contentType,
      published: fields.prefix,
      draft,
      publicContent: !draft && contentType !== "part",
      tags: [],
      contentTypeAndVisibility: `${contentType}_${draft ? "draft" : "public"}`,
      excerpt: "TODO via resolver - excerpt",
      timeToRead: 0 // TODO via resolver
      // tableOfContents, wordCount  // TODO via resolver
    });
  } else if (node.internal.type === `PostsJson` || node.internal.type === `PagesJson`) {
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
      excerpt,
      internal
    } = node;
    const fields = { slug };
    const draft = status !== "publish";
    if(false)createNode({
      id: `cp-${id}`,
      parentType: "Json",
      parent: id,
      internal: {
        mediaType: "text/html",
        type: "ContentPage",
        content,
        contentDigest: internal.contentDigest
      },
      frontmatter: {
        title,
        category: categories[0], // TODO Support multiple categories??
        author: "me",
        menuTitle: null
      },
      ...fields,
      contentType: postType,
      published,
      tags,
      draft,
      publicContent: !draft,
      contentTypeAndVisibility: `${postType}_${draft ? "draft" : "public"}`,
      excerpt,
      timeToRead: 0 // FIXME seems not yet being set at this point
      // tableOfContents, wordCount
    });
  }
};

const graphql = require(`gatsby/graphql`);
const remarkSetFieldsOnGraphQLNodeType = require("gatsby-transformer-remark/gatsby-node")
  .setFieldsOnGraphQLNodeType;
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
    const ContentTypes = new graphql.GraphQLEnumType({
      name: `ContentTypes`,
      values: {
        PAGE: { value: `page` },
        POST: { value: `post` },
        PART: { value: `part` }
      }
    });
    return {
      // Copied from MarkdownRemark:
      html: {
        type: html.type,
        resolve(contentPageNode) {
          if (contentPageNode.parentType === "Json") return contentPageNode.content;
          const markdownNode = getNode(contentPageNode.parent);
          return html.resolve(markdownNode);
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
                  prefix
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
