import PropTypes from "prop-types";
import React from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa/";
import { Link } from "gatsby";

import Item from "./Item";

const TumblrFeed = props => (
  <React.Fragment>
    <li key="tumblr">
      <aside>
        <h1>Recommended links feed</h1>
        At <a href="https://holyjak.tumblr.com/">holyjak.tumblr.com</a> you get a feed of the most
        interesting articles, libraries, and other links I have found lately.
      </aside>
    </li>
    <style jsx>{`
      li {
        border: 1px solid transparent;
        background-color: #dddbda;
        padding: 10px;
        box-shadow: 3px 3px 3px 3px #969492;
        margin-top: 2em;
      }
    `}</style>
  </React.Fragment>
);

const Blog = props => {
  const { posts, theme, pagination } = props;
  const { previousPagePath, nextPagePath, pageNumber, numberOfPages } = pagination;
  const numberOfNextPages = numberOfPages - pageNumber;
  const numberOfPreviousPages = pageNumber - 1;
  const firstPage = pageNumber === 1;

  const items = posts.map(post => {
    const {
      node,
      node: { slug }
    } = post;
    return <Item key={slug} post={node} theme={theme} />;
  });

  if (firstPage) {
    const elm = <TumblrFeed key="tumblr" />;
    const pos = items.length > 0 ? 1 : 0;
    items.splice(pos, 0, elm);
  }

  return (
    <React.Fragment>
      <main className="main">
        <ul>
          {items}
          <li>
            {previousPagePath ? (
              <Link id="link-prev-page" to={previousPagePath}>
                <FaArrowLeft /> Previous ({numberOfPreviousPages})
              </Link>
            ) : null}
            {nextPagePath ? (
              <Link id="link-next-page" to={nextPagePath}>
                Next ({numberOfNextPages}) <FaArrowRight />
              </Link>
            ) : null}
          </li>
        </ul>
      </main>

      {/* --- STYLES --- */}
      <style jsx>{`
        .main {
          padding: 0 ${theme.space.inset.default};
        }

        :global(#link-next-page) {
          float: right;
        }

        ul {
          list-style: none;
          margin: 0 auto;
          padding: ${`calc(${theme.space.default} * 1.5) 0 calc(${theme.space.default} * 0.5)`};
        }

        @above tablet {
          .main {
            padding: 0 ${`0 calc(${theme.space.default} * 1.5)`};
          }
          ul {
            max-width: ${theme.text.maxWidth.tablet};
          }
        }
        @above desktop {
          ul {
            max-width: ${theme.text.maxWidth.desktop};
          }
        }
      `}</style>
    </React.Fragment>
  );
};

Blog.propTypes = {
  posts: PropTypes.array.isRequired,
  theme: PropTypes.object.isRequired,
  pagination: PropTypes.shape({
    previousPagePath: PropTypes.string,
    nextPagePath: PropTypes.string,
    pageNumber: PropTypes.number.isRequired,
    numberOfPages: PropTypes.number.isRequired
  }).isRequired
};

export default Blog;
