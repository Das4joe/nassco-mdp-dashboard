import React from "react";
import { NasspGisMap, type NasspGisMapProps } from "./NasspGisMap";

export const DrilldownMap: React.FC<NasspGisMapProps> = (props) => {
  return <NasspGisMap {...props} />;
};

export default DrilldownMap;
