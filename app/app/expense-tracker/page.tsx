import { redirect } from "next/navigation";

export default function ExpenseTrackerRedirect() {
  redirect("/app/expense-tracker/overview");
}
