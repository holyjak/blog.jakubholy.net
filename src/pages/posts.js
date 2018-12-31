import PropTypes from "prop-types";
import React from "react";
import { graphql } from "gatsby";
import ContentList from "../components/ContentList";

class PostsIndexPage extends React.Component {
  separator = React.createRef();

  scrollToContent = e => {
    this.separator.current.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  render() {
    const {
      data: {
        posts: { edges: contentPages = [] },
        bgDesktop: {
          resize: { src: desktop }
        },
        bgTablet: {
          resize: { src: tablet }
        },
        bgMobile: {
          resize: { src: mobile }
        },
        site: {
          siteMetadata: { facebook }
        }
      }
    } = this.props;

    const backgrounds = {
      desktop,
      tablet,
      mobile
    };

    return <ContentList contentPages={contentPages} backgrounds={backgrounds} type="post" />;
  }
}

PostsIndexPage.propTypes = {
  data: PropTypes.object.isRequired
};

export default PostsIndexPage;

//eslint-disable-next-line no-undef
export const query = graphql`
  query PostsIndexQuery {
    posts: allContentPage(
      filter: { contentType: { eq: "post" }, draft: { eq: false } }
      sort: { fields: [slug], order: DESC }
    ) {
      edges {
        node {
          excerpt
          slug
          published
          frontmatter {
            title
            category
            author
#            cover { # FIXME re-enable when remark plugins re-added
#              children {
#                ... on ImageSharp {
#                  fluid(maxWidth: 800, maxHeight: 360) {
#                    ...GatsbyImageSharpFluid_withWebp
#                  }
#                }
#              }
#           }
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
    bgDesktop: imageSharp(fluid: { originalName: { regex: "/hero-background/" } }) {
      resize(width: 1200, quality: 90, cropFocus: CENTER) {
        src
      }
    }
    bgTablet: imageSharp(fluid: { originalName: { regex: "/hero-background/" } }) {
      resize(width: 800, height: 1100, quality: 90, cropFocus: CENTER) {
        src
      }
    }
    bgMobile: imageSharp(fluid: { originalName: { regex: "/hero-background/" } }) {
      resize(width: 450, height: 850, quality: 90, cropFocus: CENTER) {
        src
      }
    }
  }
`;

//hero-background
