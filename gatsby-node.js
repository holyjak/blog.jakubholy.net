//const webpack = require("webpack");
const _ = require("lodash");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const path = require("path");
const Promise = require("bluebird");

const { paginate, createPagePerItem } = require("gatsby-awesome-pagination");

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;

  return new Promise((resolve, reject) => {
    const postTemplate = path.resolve("./src/templates/PostTemplate.js");
    const postIndexTemplate = path.resolve("./src/templates/PostIndexTemplate.js");
    const pageTemplate = path.resolve("./src/templates/PageTemplate.js");
    const categoryTemplate = path.resolve("./src/templates/CategoryTemplate.js");
    const tagTemplate = path.resolve("./src/templates/TagTemplate.js");
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
                    tags
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

        // Create tag list
        const tagsSet = new Set();
        items.forEach(edge => {
          const {
            node: {
              frontmatter: { tags }
            }
          } = edge;

          if (tags && tags.length > 0) {
            tags.forEach(t => tagsSet.add(t));
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

        // Create tags pages
        const tagsList = Array.from(tagsSet);
        tagsList.forEach(tag => {
          createPage({
            path: `/tag/${_.kebabCase(tag)}/`,
            component: tagTemplate,
            context: {
              tag
            }
          });
        });

        // Posts
        const posts = items.filter(item => item.node.contentType === "post");
        // Paginated post list
        paginate({
          createPage,
          items: posts,
          itemsPerPage: 15,
          pathPrefix: "/", // Creates pages like `/`, `/2`, etc
          component: postIndexTemplate
        });
        // Individual post pages
        createPagePerItem({
          createPage,
          items: posts,
          component: postTemplate,
          itemToPath: "node.slug",
          itemToId: "node.id"
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
