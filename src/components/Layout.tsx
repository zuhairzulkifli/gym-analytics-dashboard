import type { ReactNode } from "react";
import TabBar from "./TabBar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full pb-20">
      <main className="mx-auto max-w-md px-4 pt-4">{children}</main>
      <TabBar />
    </div>
  );
}
