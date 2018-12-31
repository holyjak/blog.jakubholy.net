import React from "react";
import SplitPane from "react-split-pane";
import Iframe from "@trendmicro/react-iframe";
import { graphql } from "gatsby";

const DiffPage = props => {
  let slug = "";
  if (typeof document !== "undefined") {
    slug = document.location.search.substr(3);
  }
  return (
    <React.Fragment>
      <div id="diff">
        <SplitPane defaultSize="40%" step={20}>
          <Iframe src={slug} />
          <Iframe src={"https://blog.jakubholy.net" + slug} />
        </SplitPane>
      </div>

      <style jsx global>{`
        #diff {
          margin-top: 80px;
          height: 20em;
        }
        iframe {
          width: 100%;
        }
        .Resizer.vertical {
          width: 11px;
          margin: 0 -5px;
          border-left: 5px solid rgba(255, 255, 255, 0);
          border-right: 5px solid rgba(255, 255, 255, 0);
          cursor: col-resize;
        }
      `}</style>
    </React.Fragment>
  );
};

export default DiffPage;

export const query = graphql`
  query DiffQuery {
    site {
      siteMetadata {
        facebook {
          appId
        }
      }
    }
  }
`;
