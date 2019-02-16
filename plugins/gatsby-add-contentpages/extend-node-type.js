const graphqlLib = require(`gatsby/graphql`);
const remarkSetFieldsOnGraphQLNodeType = require("gatsby-transformer-remark/gatsby-node")
  .setFieldsOnGraphQLNodeType;

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

function descriptionWpPost(content, len = 300) {
  return (
    content
      .substring(0, len + 200)
      .replace(/(<([^>]+)>)/gi, "")
      .replace(/\r?\n/g, " ")
      .substring(0, len) + "…"
  );
}

module.exports = (args, pluginOptions) => {
  const { type, getNode } = args;
  if (type.name !== `ContentPage`) {
    return {};
  }

  const remarkPluginOptions = pluginOptions.plugins.find(
    p => p.name === "gatsby-transformer-remark"
  ).pluginOptions;

  // See https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-transformer-remark/src/extend-node-type.js
  return remarkSetFieldsOnGraphQLNodeType(
    { ...args, type: { name: `MarkdownRemark` } },
    remarkPluginOptions
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
      description: {
        // Used for page meta and og:description tag
        type: graphqlLib.GraphQLString,
        resolve(contentPageNode) {
          if (contentPageNode.parentType === "Json") {
            return descriptionWpPost(contentPageNode.internal.content);
          }
          const markdownNode = getNode(contentPageNode.parent);
          return excerpt
            .resolve(markdownNode, { pruneLength: 300 })
            .then(e => e.replace(/\r?\n/g, " "));
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
