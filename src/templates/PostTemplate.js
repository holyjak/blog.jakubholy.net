import PropTypes from "prop-types";
import React from "react";
import Helmet from "react-helmet";
import { graphql } from "gatsby";
import "prismjs/themes/prism-solarizedlight.css";

import Seo from "../components/Seo";
import Article from "../components/Article";
import Post from "../components/Post";
import { ThemeContext } from "../layouts";

const PostTemplate = props => {
  const {
    data: {
      post,
      authornote: { html: authorNote },
      site: {
        siteMetadata: { facebook }
      }
    },
    pageContext: { next, prev }
  } = props;

  return (
    <React.Fragment>
      <Helmet>
        {post.stylesheets.map(url => (
          <link key={url} rel="stylesheet" href={url} />
        ))}
      </Helmet>
      <ThemeContext.Consumer>
        {theme => (
          <Article theme={theme}>
            <Post
              post={post}
              next={next}
              prev={prev}
              authornote={authorNote}
              facebook={facebook}
              theme={theme}
            />
          </Article>
        )}
      </ThemeContext.Consumer>

      <Seo data={post} facebook={facebook} />
    </React.Fragment>
  );
};

PostTemplate.propTypes = {
  data: PropTypes.object.isRequired,
  pageContext: PropTypes.object.isRequired
};

export default PostTemplate;

//eslint-disable-next-line no-undef
export const postQuery = graphql`
  query PostBySlug($slug: String!) {
    post: contentPage(slug: { eq: $slug }) {
      id
      html
      stylesheets
      slug
      published
      description
      frontmatter {
        title
        author
        category
        tags
        cover {
          childImageSharp {
            resize(width: 300) {
              src
            }
          }
        }
      }
    }
    authornote: markdownRemark(fileAbsolutePath: { regex: "/author/" }) {
      id
      html
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
