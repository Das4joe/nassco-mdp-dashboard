import React from "react";
import {
  GlobalOverview,
  type GlobalOverviewProps,
} from "../components/domains/GlobalOverview";

export const Overview: React.FC<GlobalOverviewProps> = (props) => {
  return <GlobalOverview {...props} />;
};

export default Overview;
