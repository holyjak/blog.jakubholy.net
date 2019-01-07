import React from "react";
import PropTypes from "prop-types";
import { Link } from "gatsby";

import { FaCalendar } from "react-icons/fa/";
import { FaUser } from "react-icons/fa/";
import { FaTag } from "react-icons/fa/";

const Meta = props => {
  const { published, category, theme } = props;

  return (
    <p className="meta">
      <span>
        <FaCalendar size={18} /> {published}
      </span>
      {category && (
        <span>
          <FaTag size={18} />
          <Link
            to={`/category/${category
              .toLowerCase()
              .split(" ")
              .join("-")}`}
          >
            {category}
          </Link>
        </span>
      )}

      {/* --- STYLES --- */}
      <style jsx>{`
        .meta {
          display: flex;
          flex-flow: row wrap;
          font-size: 0.8em;
          margin: ${theme.space.m} 0;
          background: transparent;

          :global(svg) {
            fill: ${theme.icon.color};
            margin: ${theme.space.inline.xs};
          }
          span {
            align-items: center;
            display: flex;
            text-transform: uppercase;
            margin: ${theme.space.xs} ${theme.space.s} ${theme.space.xs} 0;
          }
        }
        @from-width tablet {
          .meta {
            margin: ${`calc(${theme.space.m} * 1.5) 0 ${theme.space.m}`};
          }
        }
      `}</style>
    </p>
  );
};

Meta.propTypes = {
  published: PropTypes.string.isRequired,
  author: PropTypes.string,
  category: PropTypes.string,
  theme: PropTypes.object.isRequired
};

export default Meta;
