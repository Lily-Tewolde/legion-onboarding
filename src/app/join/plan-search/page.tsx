import { PlanSearch } from "./PlanSearch";

// "I don't see my plan": the full plan list with a search, as its own screen
// (Claude Design's U10). Only if their plan still isn't there do they get
// self-pay or a person
export default function PlanSearchPage() {
  return <PlanSearch />;
}
