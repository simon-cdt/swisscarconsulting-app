import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "react-email";

export default function InvoiceEmail() {
  return (
    <Html>
      <Head />
      <Preview>Votre facture SwissCarConsulting est disponible.</Preview>

      <Body
        style={{
          backgroundColor: "#f4f4f5",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
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
              Votre facture est disponible.
            </Text>
          </Section>

          <Section style={{ padding: "40px" }}>
            <Heading
              as="h2"
              style={{
                fontSize: "24px",
                color: "#111827",
                marginTop: 0,
              }}
            >
              Bonjour,
            </Heading>

            <Text
              style={{
                color: "#4b5563",
                fontSize: "16px",
                lineHeight: "26px",
              }}
            >
              Nous vous informons que votre facture est désormais disponible.
            </Text>

            <Text
              style={{
                color: "#4b5563",
                fontSize: "16px",
                lineHeight: "26px",
              }}
            >
              Vous la trouverez en <strong>pièce jointe</strong> à cet email.
            </Text>

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
                📅 <strong>Délai de paiement : 15 jours</strong>
              </Text>

              <Text
                style={{
                  marginTop: "14px",
                  marginBottom: 0,
                  color: "#4b5563",
                  lineHeight: "28px",
                }}
              >
                Nous vous remercions de bien vouloir procéder au règlement dans
                un délai de 15 jours à compter de la date d’émission de la
                facture.
              </Text>
            </Section>

            <Text
              style={{
                color: "#4b5563",
                fontSize: "16px",
                lineHeight: "26px",
              }}
            >
              Pour toute question concernant cette facture, notre équipe reste
              volontiers à votre disposition.
            </Text>

            <Section
              style={{
                textAlign: "center",
                margin: "36px 0",
              }}
            >
              <Button
                href="mailto:contact@swisscarconsulting.ch"
                style={{
                  backgroundColor: "#111827",
                  color: "#ffffff",
                  padding: "14px 26px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Nous contacter
              </Button>
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
              Nous vous remercions de votre confiance.
            </Text>

            <Text
              style={{
                color: "#111827",
                fontSize: "15px",
                fontWeight: 600,
                marginTop: "30px",
              }}
            >
              L&apos;équipe SwissCarConsulting
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
          © {new Date().getFullYear()} SwissCarConsulting — Tous droits
          réservés.
        </Text>
      </Body>
    </Html>
  );
}
