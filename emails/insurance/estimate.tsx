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

export default function EstimateInsuranceEmail({
  claimNumber,
  customerFirstName,
  customerLastName,
  customerCompanyName,
  customerAddress,
  customerPostalCode,
  customerCity,
  quoteNumber,
  quoteAmount,
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
  quoteNumber: string;
  quoteAmount: string;
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
        Devis n° {quoteNumber} - Dossier sinistre {claimNumber}
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
              Transmission de devis - Dossier sinistre
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
              Veuillez trouver en pièce jointe notre devis relatif au dossier de
              sinistre mentionné ci-dessous.
            </Text>

            <Text
              style={{
                color: "#4b5563",
                fontSize: "16px",
                lineHeight: "26px",
              }}
            >
              Nous vous remercions de bien vouloir prendre connaissance de cette
              proposition et de nous confirmer sa prise en charge afin de
              pouvoir organiser la suite des opérations.
            </Text>

            {/* Dossier */}
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
                <strong>Référence devis :</strong> {quoteNumber}
                <br />
                <strong>Montant du devis :</strong> {quoteAmount}
                <br />
                {insuranceName && (
                  <>
                    <strong>Assurance :</strong> {insuranceName}
                    <br />
                  </>
                )}
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
            {(vehicle || registration) && (
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
              Nous restons bien entendu à votre disposition pour toute
              information complémentaire ou document nécessaire au traitement du
              dossier.
            </Text>

            <Section
              style={{
                backgroundColor: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "12px",
                padding: "20px",
                margin: "36px 0",
              }}
            >
              <Text
                style={{
                  margin: 0,
                  color: "#1e3a8a",
                  fontSize: "16px",
                  lineHeight: "28px",
                  textAlign: "center",
                }}
              >
                📩 <strong>Merci de répondre directement à cet email</strong>{" "}
                afin de confirmer la prise en charge du devis ou de nous
                transmettre vos éventuelles remarques.
              </Text>
            </Section>

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
              disposition pour toute question relative à ce dossier.
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
