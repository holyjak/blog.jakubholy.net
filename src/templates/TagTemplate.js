import { FaTag } from "react-icons/fa/";
import PropTypes from "prop-types";
import React from "react";
import { graphql } from "gatsby";
import Seo from "../components/Seo";
import { ThemeContext } from "../layouts";
import Article from "../components/Article";
import Headline from "../components/Article/Headline";
import List from "../components/List";

const TagTemplate = props => {
  const {
    pageContext: { tag },
    data: {
      allContentPage: { totalCount, edges },
      site: {
        siteMetadata: { facebook }
      }
    }
  } = props;

  return (
    <React.Fragment>
      <ThemeContext.Consumer>
        {theme => (
          <Article theme={theme}>
            <header>
              <Headline theme={theme}>
                <span>Posts with the tag</span> <FaTag />
                {tag}
              </Headline>
              <p className="meta">
                There {totalCount > 1 ? "are" : "is"} <strong>{totalCount}</strong>
                {" "}matching post{totalCount > 1 ? "s" : ""}:
              </p>
              <List edges={edges} theme={theme} />
            </header>
          </Article>
        )}
      </ThemeContext.Consumer>

      <Seo facebook={facebook} />
    </React.Fragment>
  );
};

TagTemplate.propTypes = {
  data: PropTypes.object.isRequired,
  pageContext: PropTypes.object.isRequired
};

export default TagTemplate;

// eslint-disable-next-line no-undef
export const tagQuery = graphql`
  query PostsByTag($tag: String) {
    allContentPage(
      limit: 1000
      sort: { fields: [published], order: DESC }
      filter: { frontmatter: { tags: { glob: $tag } } }
    ) {
      totalCount
      edges {
        node {
          slug
          excerpt
          timeToRead
          frontmatter {
            title
            tags
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
