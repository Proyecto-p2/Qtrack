export default function CellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 border rounded-md">
      <h2>Célula</h2>
      {children}
    </div>
  );
}
