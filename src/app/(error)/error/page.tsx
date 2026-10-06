import ErrorClient from "./ErrorClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Error",
  description: "An error occurred",
};

export default function ErrorPage() {
  return <ErrorClient />;
}
