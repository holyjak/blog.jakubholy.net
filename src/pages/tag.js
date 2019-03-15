import { FaTag } from "react-icons/fa/";
import PropTypes from "prop-types";
import React from "react";
import { graphql } from "gatsby";
import { ThemeContext } from "../layouts";
import Article from "../components/Article/";
import Headline from "../components/Article/Headline";
import List from "../components/List";
import Seo from "../components/Seo";

const TagPage = props => {
  const {
    data: {
      content: { edges: nodes },
      site: {
        siteMetadata: { facebook }
      }
    }
  } = props;

  // Create tags list
  const tagMap = {};
  nodes.forEach(edge => {
    const {
      node: {
        frontmatter: { tags }
      }
    } = edge;

    if (tags && tags.length > 0) {
      tags.forEach(t => {
        if (!tagMap[t]) {
          tagMap[t] = [];
        }
        tagMap[t].push(edge);
      });
    }
  });

  const tagsList = Object.keys(tagMap)
    .sort()
    .map(t => [t, tagMap[t]]);

  return (
    <React.Fragment>
      <ThemeContext.Consumer>
        {theme => (
          <Article theme={theme}>
            <header>
              <Headline title="Posts by tags" theme={theme} />
            </header>
            {tagsList.map(item => (
              <section key={item[0]}>
                <h2>
                  <FaTag /> {item[0]}
                </h2>
                <List edges={item[1]} theme={theme} />
              </section>
            ))}
            {/* --- STYLES --- */}
            <style jsx>{`
              h2 {
                margin: 0 0 0.5em;
              }
              h2 :global(svg) {
                height: 0.8em;
                fill: ${theme.color.brand.primary};
              }
            `}</style>
          </Article>
        )}
      </ThemeContext.Consumer>

      <Seo facebook={facebook} />
    </React.Fragment>
  );
};

TagPage.propTypes = {
  data: PropTypes.object.isRequired
};

export default TagPage;

//eslint-disable-next-line no-undef
export const query = graphql`
  query TaggedContentQuery {
    content: allContentPage(
      filter: { publicContent: { eq: true }, contentType: { in: ["post", "page"] } }
      sort: { fields: [published], order: DESC }
    ) {
      edges {
        node {
          excerpt
          slug
          published
          frontmatter {
            title
            category
            tags
            author
            cover {
              children {
                ... on ImageSharp {
                  fluid(maxWidth: 800, maxHeight: 360) {
                    ...GatsbyImageSharpFluid_withWebp
                  }
                }
              }
            }
          }
        }
      }
    }
    site {
      siteMetadata {
        facebook {
          appId
        }
      }
    }
  }
`;
