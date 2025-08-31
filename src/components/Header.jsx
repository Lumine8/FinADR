import React from "react";

export default function Header() {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-indigo-600">FinADR</h1>
      <nav className="space-x-4">
        <button className="px-3 py-1 rounded-md hover:bg-indigo-50">Home</button>
        <button className="px-3 py-1 rounded-md hover:bg-indigo-50">Reports</button>
        <button className="px-3 py-1 rounded-md hover:bg-indigo-50">Settings</button>
      </nav>
    </header>
  );
}
