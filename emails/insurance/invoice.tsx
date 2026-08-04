import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "react-email";

export default function InsuranceInvoiceEmail({
  claimNumber,
  customerFirstName,
  customerLastName,
  customerCompanyName,
  customerAddress,
  customerPostalCode,
  customerCity,
  invoiceNumber,
  invoiceDate,
  amount,
  insuranceName,
  vehicle,
  registration,
  clientType,
}: {
  claimNumber: string;
  customerFirstName: string;
  customerLastName: string;
  customerCompanyName?: string;
  customerAddress: string;
  customerPostalCode: string;
  customerCity: string;
  invoiceNumber: string;
  invoiceDate: string;
  amount: string;
  insuranceName?: string;
  vehicle?: string;
  registration?: string;
  clientType: "individual" | "company";
}) {
  const individual = clientType === "individual";
  return (
    <Html>
      <Head />

      <Preview>
        Facture n° {invoiceNumber} - Dossier sinistre {claimNumber}
      </Preview>

      <Body
        style={{
          backgroundColor: "#f4f4f5",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, &apos;Segoe UI&apos;, Roboto, Helvetica, Arial, sans-serif",
          padding: "40px 20px",
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          }}
        >
          {/* Header */}
          <Section
            style={{
              background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
              padding: "40px",
              textAlign: "center",
            }}
          >
            <Heading
              style={{
                color: "#ffffff",
                fontSize: "30px",
                margin: 0,
              }}
            >
              Swiss Car Consulting SA
            </Heading>

            <Text
              style={{
                color: "#d1d5db",
                fontSize: "16px",
                marginTop: "12px",
              }}
            >
              Transmission de facture - Dossier sinistre
            </Text>
          </Section>

          {/* Content */}
          <Section style={{ padding: "40px" }}>
            <Heading
              as="h2"
              style={{
                fontSize: "24px",
                color: "#111827",
                marginTop: 0,
              }}
            >
              Madame, Monsieur,
            </Heading>

            <Text
              style={{
                color: "#4b5563",
                fontSize: "16px",
                lineHeight: "26px",
              }}
            >
              Veuillez trouver en pièce jointe la facture relative au dossier de
              sinistre mentionné ci-dessous.
            </Text>

            <Text
              style={{
                color: "#4b5563",
                fontSize: "16px",
                lineHeight: "26px",
              }}
            >
              Nous vous remercions de bien vouloir procéder au traitement de
              cette facture conformément aux éléments du dossier.
            </Text>

            {/* Informations sinistre */}
            <Section
              style={{
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "20px",
                margin: "30px 0",
              }}
            >
              <Text
                style={{
                  margin: 0,
                  color: "#111827",
                  fontSize: "16px",
                  lineHeight: "28px",
                }}
              >
                📄 <strong>Informations du dossier</strong>
              </Text>

              <Text
                style={{
                  marginTop: "14px",
                  color: "#4b5563",
                  lineHeight: "28px",
                }}
              >
                <strong>Numéro de sinistre :</strong> {claimNumber}
                <br />
                <strong>Numéro de facture :</strong> {invoiceNumber}
                <br />
                <strong>Date de facture :</strong> {invoiceDate}
                <br />
                <strong>Montant total :</strong> {amount}&nbsp;CHF
              </Text>
            </Section>

            {/* Client */}
            <Section
              style={{
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "20px",
                margin: "30px 0",
              }}
            >
              <Text
                style={{
                  margin: 0,
                  color: "#111827",
                  fontSize: "16px",
                  lineHeight: "28px",
                }}
              >
                👤 <strong>Informations assuré</strong>
              </Text>

              {individual ? (
                <Text
                  style={{
                    marginTop: "14px",
                    color: "#4b5563",
                    lineHeight: "28px",
                  }}
                >
                  <strong>Nom :</strong> {customerFirstName} {customerLastName}
                  <br />
                  <strong>Adresse :</strong>
                  <br />
                  {customerAddress}
                  <br />
                  {customerPostalCode} {customerCity}
                </Text>
              ) : (
                <Text
                  style={{
                    marginTop: "14px",
                    color: "#4b5563",
                    lineHeight: "28px",
                  }}
                >
                  <strong>Nom de l&apos;entreprise :</strong>{" "}
                  {customerCompanyName}
                  <br />
                  <strong>Nom du contact de l&apos;entreprise :</strong>{" "}
                  {customerFirstName} {customerLastName}
                  <br />
                  <strong>Adresse :</strong>
                  <br />
                  {customerAddress}
                  <br />
                  {customerPostalCode} {customerCity}
                </Text>
              )}
            </Section>

            {/* Véhicule */}
            {(vehicle || registration || insuranceName) && (
              <Section
                style={{
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "20px",
                  margin: "30px 0",
                }}
              >
                <Text
                  style={{
                    margin: 0,
                    color: "#111827",
                    fontSize: "16px",
                    lineHeight: "28px",
                  }}
                >
                  🚗 <strong>Informations véhicule</strong>
                </Text>

                <Text
                  style={{
                    marginTop: "14px",
                    color: "#4b5563",
                    lineHeight: "28px",
                  }}
                >
                  {insuranceName && (
                    <>
                      <strong>Assurance :</strong> {insuranceName}
                      <br />
                    </>
                  )}

                  {vehicle && (
                    <>
                      <strong>Véhicule :</strong> {vehicle}
                      <br />
                    </>
                  )}

                  {registration && (
                    <>
                      <strong>Immatriculation :</strong> {registration}
                    </>
                  )}
                </Text>
              </Section>
            )}

            <Text
              style={{
                color: "#4b5563",
                fontSize: "16px",
                lineHeight: "26px",
              }}
            >
              Si des documents complémentaires sont nécessaires au règlement du
              dossier, nous restons volontiers à votre disposition afin de vous
              les transmettre.
            </Text>

            <Hr
              style={{
                borderColor: "#e5e7eb",
                margin: "32px 0",
              }}
            />

            <Text
              style={{
                color: "#6b7280",
                fontSize: "14px",
                lineHeight: "24px",
              }}
            >
              Nous vous remercions pour votre collaboration et restons à votre
              disposition pour toute question relative à cette facture.
            </Text>

            <Text
              style={{
                color: "#111827",
                fontSize: "15px",
                fontWeight: 600,
                marginTop: "30px",
              }}
            >
              L&apos;équipe Swiss Car Consulting SA
            </Text>
          </Section>
        </Container>

        <Text
          style={{
            textAlign: "center",
            color: "#9ca3af",
            fontSize: "12px",
            marginTop: "20px",
          }}
        >
          © {new Date().getFullYear()} Swiss Car Consulting SA — Tous droits
          réservés.
        </Text>
      </Body>
    </Html>
  );
}
