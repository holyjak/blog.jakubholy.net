import PropTypes from "prop-types";
import React from "react";
import { ThemeContext } from "../../layouts";
import Hero from "../Hero";
import { Link } from "gatsby";

class ContentList extends React.Component {
  separator = React.createRef();

  scrollToContent = e => {
    this.separator.current.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  render() {
    return (
      <React.Fragment>
        <ThemeContext.Consumer>
          {theme => (
            <Hero
              scrollToContent={this.scrollToContent}
              backgrounds={this.props.backgrounds}
              theme={theme}
            />
          )}
        </ThemeContext.Consumer>

        <hr ref={this.separator} />

        <ThemeContext.Consumer>{theme => <PageList {...this.props} />}</ThemeContext.Consumer>

        <style jsx>{`
          :global(li h4) {
            display: inline;
          }
          hr {
            margin: 0;
            border: 0;
          }
        `}</style>
      </React.Fragment>
    );
  }
}

ContentList.propTypes = {
  contentPages: PropTypes.array.isRequired,
  backgrounds: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired
};

const PageList = ({ contentPages, type }) => (
  <main className="main">
    <h1>All {type}s</h1>
    <ol className="pagelist" style={{ marginLeft: "30px" }}>
      {contentPages.map(page => {
        const {
          node: {
            slug,
            frontmatter: { title }
          }
        } = page;
        return (
          <li key={slug}>
            <Link to={"/diff?s=" + slug} key={slug} className="link">
              <h4>{title}</h4>
            </Link>
          </li>
        );
      })}
    </ol>
  </main>
);

PageList.propTypes = {
  contentPages: PropTypes.array.isRequired,
  type: PropTypes.string.isRequired
};

export default ContentList;
