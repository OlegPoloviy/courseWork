import React from "react";

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header>
        <div>
          <h1>Search</h1>
          <div>
            {/* Add search filters or additional header content here */}
          </div>
        </div>
      </header>

      <main>
        <div>{children}</div>
      </main>

      <footer>
        <p>© 2024 Your Company</p>
      </footer>
    </div>
  );
}
