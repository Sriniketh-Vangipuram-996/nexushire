import {type ReactNode, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 min-h-screen">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex-1 flex flex-col md:ml-64">
        <Navbar toggleSidebar={() => setIsOpen(!isOpen)} />

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}