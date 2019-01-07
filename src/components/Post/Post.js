import React from "react";
import PropTypes from "prop-types";
import "prismjs/themes/prism-solarizedlight.css";

import { Link } from "gatsby";
import asyncComponent from "../AsyncComponent";
import Headline from "../Article/Headline";
import Bodytext from "../Article/Bodytext";
import Meta from "./Meta";
import Author from "./Author";
import Comments from "./Comments";
import NextPrev from "./NextPrev";

const Share = asyncComponent(() =>
  import("./Share")
    .then(module => {
      return module.default;
    })
    .catch(error => {})
);

const Tag = ({ tag, last }) => (
  <span>
    <Link
      to={`/tag/${tag
        .toLowerCase()
        .split(" ")
        .join("-")}`}
    >
      {tag}
    </Link>
    {last ? "" : ", "}
  </span>
);

const Tags = ({ tags }) =>
  tags && tags.length > 0 ?
    <React.Fragment>
      <p className="tags">
        Tagged:{" "}
        {tags.map((t, idx) => (
          <Tag key={t} tag={t} last={idx + 1 === tags.length} />
        ))}
      </p>
      <style jsx>{`
        .tags {
          margin-top: 1em;
          padding-top: 0.5em;
          border-top: 1px dashed black;
        }
      `}</style>
    </React.Fragment>
  : null;

const Post = props => {
  const {
    post,
    post: {
      html,
      published,
      slug,
      frontmatter: { title, author, category, tags }
    },
    authornote,
    facebook,
    next: nextPost,
    prev: prevPost,
    theme
  } = props;

  return (
    <React.Fragment>
      <header>
        <Headline title={title} theme={theme} />
        <Meta published={published} author={author} category={category} theme={theme} />
      </header>
      <Bodytext html={html} theme={theme} />
      <footer>
        <Tags tags={tags} />
        <Share post={post} theme={theme} />
        <Author note={authornote} theme={theme} />
        <NextPrev next={nextPost} prev={prevPost} theme={theme} />
        <Comments slug={slug} facebook={facebook} theme={theme} />
      </footer>
    </React.Fragment>
  );
};

Post.propTypes = {
  post: PropTypes.object.isRequired,
  authornote: PropTypes.string.isRequired,
  facebook: PropTypes.object.isRequired,
  next: PropTypes.object,
  prev: PropTypes.object,
  theme: PropTypes.object.isRequired
};

export default Post;
