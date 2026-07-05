import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from "react-email";

const EstimateEmail = () => {
  return (
    <Html>
      <Head />
      <Preview>Devis envoyé - réponse obligatoire</Preview>
      <Tailwind>
        <Body className="bg-[#f6f3ee] font-sans text-slate-800">
          <Container className="mx-auto max-w-[640px] px-4 py-10">
            <Section className="overflow-hidden rounded-[28px] border border-[#f1c4c4] bg-white shadow-[0_18px_60px_rgba(57,45,35,0.08)]">
              <Section className="bg-gradient-to-r from-[#8b1e1e] via-[#b32626] to-[#dc2626] px-8 py-10 text-white">
                <Text className="mb-3 text-xs font-semibold tracking-[0.24em] text-[#ffe3e3] uppercase">
                  Swiss Car Consulting
                </Text>
                <Heading className="m-0 text-3xl leading-tight font-semibold text-white">
                  Votre devis est prêt
                </Heading>
                <Text className="mt-4 max-w-[500px] text-base leading-7 text-[#fff1f1]">
                  Suite à votre passage au garage, voici votre devis.
                </Text>
              </Section>

              <Section className="px-8 py-8">
                <Text className="text-lg font-semibold text-slate-900">
                  Bonjour,
                </Text>
                <Text className="mt-4 text-[15px] leading-7 text-slate-600">
                  Merci de nous répondre pour nous dire si vous acceptez le
                  devis.
                </Text>

                <Section className="my-8 rounded-2xl border border-[#f5c2c2] bg-[#fff5f5] px-6 py-6">
                  <Text className="m-0 text-sm font-semibold tracking-[0.2em] text-[#b91c1c] uppercase">
                    Devis n°12345
                  </Text>
                  <Text className="mt-3 text-[15px] leading-7 text-slate-700">
                    Merci de répondre obligatoirement à ce message.
                  </Text>
                </Section>

                <Section className="rounded-2xl border border-[#dc2626] bg-[#fff1f1] px-6 py-5">
                  <Text className="m-0 text-[15px] font-semibold text-[#b91c1c]">
                    Réponse obligatoire
                  </Text>
                  <Text className="mt-2 text-[15px] leading-7 text-slate-700">
                    Vous pouvez accepter le devis.
                  </Text>
                  <Text className="mt-3 text-[15px] leading-7 text-slate-700">
                    Si vous le refusez, merci d&apos;indiquer pourquoi afin que
                    nous puissions faire la rectification nécessaire.
                  </Text>
                  <Text className="mt-4 text-[15px] leading-7 font-semibold text-[#b91c1c]">
                    Une réponse est nécessaire.
                  </Text>
                </Section>

                <Text className="mt-8 text-[15px] font-medium text-slate-900">
                  Cordialement,
                  <br />
                  L&apos;équipe Swiss Car Consulting
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default EstimateEmail;
