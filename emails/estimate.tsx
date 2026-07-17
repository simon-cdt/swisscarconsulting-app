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

export default function QuoteReadyEmail() {
  return (
    <Html>
      <Head />
      <Preview>Votre devis SwissCarConsulting est prêt.</Preview>

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
              SwissCarConsulting SA
            </Heading>

            <Text
              style={{
                color: "#d1d5db",
                fontSize: "16px",
                marginTop: "12px",
              }}
            >
              Votre devis est prêt.
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
              Bonjour,
            </Heading>

            <Text
              style={{
                color: "#4b5563",
                fontSize: "16px",
                lineHeight: "26px",
              }}
            >
              Nous avons le plaisir de vous informer que votre devis est
              désormais disponible.
            </Text>

            <Text
              style={{
                color: "#4b5563",
                fontSize: "16px",
                lineHeight: "26px",
              }}
            >
              Vous le trouverez en <strong>pièce jointe</strong> à cet email.
              Nous vous invitons à en prendre connaissance et à nous faire
              parvenir votre réponse.
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
                ✅ Merci de répondre à cet email en indiquant :
              </Text>

              <Text
                style={{
                  marginTop: "14px",
                  color: "#4b5563",
                  lineHeight: "28px",
                }}
              >
                • <strong>Oui</strong> si vous acceptez le devis.
                <br />• <strong>Non</strong> si vous le refusez.
                <br />• Si votre réponse est <strong>non</strong>, nous vous
                serions reconnaissants de nous préciser brièvement la raison
                afin de pouvoir améliorer notre service ou vous proposer une
                solution adaptée.
              </Text>
            </Section>

            <Text
              style={{
                color: "#4b5563",
                fontSize: "16px",
                lineHeight: "26px",
              }}
            >
              Votre retour est essentiel afin que nous puissions poursuivre le
              traitement de votre demande.
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
                Répondre à cet email
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
              Nous vous remercions de votre confiance et restons à votre
              disposition pour toute question concernant votre devis.
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
