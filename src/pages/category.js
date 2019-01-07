import { FaTag } from "react-icons/fa/";
import PropTypes from "prop-types";
import React from "react";
import { graphql, Link } from "gatsby";
import { ThemeContext } from "../layouts";
import Article from "../components/Article/";
import Headline from "../components/Article/Headline";
import List from "../components/List";
import Seo from "../components/Seo";

const CategoryPage = props => {
  const {
    data: {
      content: { edges: nodes },
      site: {
        siteMetadata: { facebook }
      }
    }
  } = props;

  // Create category list
  const categories = {};
  const tagCount = {};
  nodes.forEach(edge => {
    const {
      node: {
        frontmatter: { category, tags }
      }
    } = edge;

    if (category && category != null) {
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(edge);
    }
    if (tags) {
      tags.forEach(t => {
        if (tagCount[t]) {
          tagCount[t]++;
        } else {
          tagCount[t] = 1;
        }
      });
    }
  });

  const categoryList = [];
  const tagList = Object.keys(tagCount)
    .filter(t => tagCount[t] > 1)
    .sort() // by name
    .sort((t1, t2) => tagCount[t2] - tagCount[t1]);

  for (var key in categories) {
    categoryList.push([key, categories[key]]);
  }

  return (
    <React.Fragment>
      <ThemeContext.Consumer>
        {theme => (
          <Article theme={theme}>
            <header>
              <Headline title="Posts by categories and tags" theme={theme} />
            </header>
            <h2>Tags</h2>
            <p>
              {tagList.map((tag, idx) => (
                <span key={tag}>
                  <Link
                    to={`/tag/${tag
                      .toLowerCase()
                      .split(" ")
                      .join("-")}`}>
                    {tag}
                  </Link>
                  <sub>{tagCount[tag]}</sub>
                  {(idx + 1 === tagList.length) ? "" : ", "}
                </span>))}
              </p>
            <h2>Post by categories</h2>
            {categoryList.map(item => (
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

CategoryPage.propTypes = {
  data: PropTypes.object.isRequired
};

export default CategoryPage;

//eslint-disable-next-line no-undef
export const query = graphql`
  query ContentQuery {
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
#            cover { # FIXME - re-enable after re-adding remakr plugins
#              children {
#                ... on ImageSharp {
#                  fluid(maxWidth: 800, maxHeight: 360) {
#                    ...GatsbyImageSharpFluid_withWebp
#                  }
#                }
#              }
#            }
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
