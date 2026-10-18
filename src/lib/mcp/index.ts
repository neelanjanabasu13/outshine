import { defineMcp } from "@lovable.dev/mcp-js";
import searchBusinesses from "./tools/search-businesses";
import getBusinessReport from "./tools/get-business-report";

export default defineMcp({
  name: "outshine",
  title: "Outshine",
  version: "0.1.0",
  instructions: "Free online presence audits for UK cleaning, plumbing, electrical, landscaping and hair and beauty businesses. Search for a business, then fetch its report for a letter grade, top improvement areas and nearby rival grades. Grades use only publicly visible evidence.",
  tools: [searchBusinesses, getBusinessReport],
});
