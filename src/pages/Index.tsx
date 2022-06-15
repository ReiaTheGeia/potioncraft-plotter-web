import React from "react";

import { useDIDependency } from "@/container";
import { History } from "@/services/history/History";

const IndexPage = () => {
  const history = useDIDependency(History);
  React.useEffect(() => {
    // HashBrowser keeps its own search inside the hash.  The outer hash may remain and confuse things.
    // Grab whatever hash we can, and normalize into our history.
    const hLoc = history.location;
    const wLoc = window.location;
    const search = hLoc.search.length > 0 ? hLoc.search : wLoc.search;

    // Clear out the root search query.
    // Use replaceState to avoid refreshing the page
    if (window.location.search != "") {
      const url = new URL(window.location.href);
      url.search = "";
      window.history.replaceState({}, "", url.toString());
    }
    history.replace({ pathname: "/plotter", search });
  }, []);

  return null;
};

export default IndexPage;
