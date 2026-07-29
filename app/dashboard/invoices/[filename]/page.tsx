// application/app/factures/[filename]/page.tsx
export default async function FacturePage({
  params,
}: {
  params: Promise<{ filename: string }>;
}) {
  const { filename } = await params;

  return (
    <main
      style={{
        padding: 24,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h1 style={{ marginBottom: 16 }}>Facture</h1>

      <iframe
        src={`/api/invoices/${filename}`}
        title={`Facture ${filename}`}
        style={{
          flex: 1,
          width: "100%",
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
      />

      <div style={{ marginTop: 12 }}>
        <a href={`/api/invoices/${filename}`} download={filename}>
          Télécharger la facture
        </a>
      </div>
    </main>
  );
}
