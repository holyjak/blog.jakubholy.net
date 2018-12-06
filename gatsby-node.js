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
    const {
      id,
      internal,
      frontmatter,
      fields
    } = node;
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
      ...fields,
      frontmatter,
      excerpt: "TODO via resolver",
      timeToRead: 0 // TODO via resolver
      // tableOfContents, wordCount  // TODO via resolver
    });
  } else if (node.internal.type === `PostsJson`) {
    // FIXME The trouble: The Remark node doesn't have just data but
    // many extra fields with resolvers def in `gatsby-transformer-remark/src/extend-node-type.js`
    // No idea how to wrap these. I could copy-paste ...
    // E.g. html is computed on-demand, not a static field :(
    // WHAT I NEED: A way to re-use custom plugin fields (graphql resolvers)
    // from a child node / child node field resolver
    // const {
    //   id,
    //   title,
    //   published,
    //   postType,
    //   slug,
    //   status,
    //   tags,
    //   categories,
    //   content,
    //   excerpt,
    //   internal
    // } = node;
    // createNode({
    //   id: `cp-${id}`,
    //   parentType: "Json",
    //   parent: id,
    //   internal: {
    //     mediaType: "text/html",
    //     type: "ContentPage",
    //     content,
    //     contentDigest: internal.contentDigest
    //   },
    //   frontmatter: {
    //     title,
    //     category: categories[0],
    //     author: "me",
    //     menuTitle: null
    //   },
    //   excerpt,
    //   timeToRead: 0 // FIXME seems not yet being set at this point
    //   // tableOfContents, wordCount
    // });
  }
};

const remarkSetFieldsOnGraphQLNodeType = require("gatsby-transformer-remark/gatsby-node")
  .setFieldsOnGraphQLNodeType;
exports.setFieldsOnGraphQLNodeType = (args, pluginOptions) => {
  const { type, getNode } = args;
  if (type.name !== `ContentPage`) {
    return {};
  }
  console.log(">>> pluginOptions", pluginOptions);
  const fakeRemarkPluginOptions = { plugins: []}; // FIXME Load from gatsby-config.js
  // See https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-transformer-remark/src/extend-node-type.js
  return remarkSetFieldsOnGraphQLNodeType({ ...args, type: { name: `MarkdownRemark` }}, fakeRemarkPluginOptions)
   .then(({ html, excerpt, headings, timeToRead, tableOfContents, wordCount }) => {
     return {
       html: {
          type: html.type,
          resolve(contentPageNode) {
            if (contentPageNode.parentType === "Json") return contentPageNode.content;
            const markdownNode = getNode(contentPageNode.parent);
            return html.resolve(markdownNode);
          }
        }
      };
   })
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
            allMarkdownRemark(
              filter: { fields: { slug: { ne: null } } }
              sort: { fields: [fields___prefix], order: DESC }
              limit: 1000
            ) {
              edges {
                node {
                  id
                  fields {
                    slug
                    prefix
                    source
                  }
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

        const items = result.data.allMarkdownRemark.edges;

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
        const posts = items.filter(item => item.node.fields.source === "posts");
        posts.forEach(({ node }, index) => {
          const slug = node.fields.slug;
          const next = index === 0 ? undefined : posts[index - 1].node;
          const prev = index === posts.length - 1 ? undefined : posts[index + 1].node;
          const source = node.fields.source;

          createPage({
            path: slug,
            component: postTemplate,
            context: {
              slug,
              prev,
              next,
              source
            }
          });
        });

        // and pages.
        const pages = items.filter(item => item.node.fields.source === "pages");
        pages.forEach(({ node }) => {
          const slug = node.fields.slug;
          const source = node.fields.source;

          createPage({
            path: slug,
            component: pageTemplate,
            context: {
              slug,
              source
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
