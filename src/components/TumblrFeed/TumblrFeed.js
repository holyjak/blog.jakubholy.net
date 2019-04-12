import React from "react";

const TumblrFeed = () => (
  // TODO Load content on client (and at build?) -
  // see https://www.gatsbyjs.org/docs/client-data-fetching/
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

export default TumblrFeed;
