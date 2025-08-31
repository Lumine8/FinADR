import React from "react";

export default function Dashboard() {
  return (
    <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Example Card */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold text-gray-800">Total Balance</h2>
        <p className="text-3xl font-bold text-indigo-600 mt-2">$12,340</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold text-gray-800">Expenses</h2>
        <p className="text-3xl font-bold text-red-500 mt-2">$4,210</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold text-gray-800">Income</h2>
        <p className="text-3xl font-bold text-green-500 mt-2">$8,130</p>
      </div>
    </section>
  );
}
