import { FC } from "react";
import SummaryContext, { initialSummaryState } from "../contexts/summary-context";
import Provider from "./provider";

const SummaryProvider: FC = ({ children }) => (
  <Provider
    initialState={initialSummaryState}
    ContextComponent={SummaryContext}
  >
    {children}
  </Provider>
);

export default SummaryProvider;