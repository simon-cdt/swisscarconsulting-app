import { TypeEstimate } from "@/generated/prisma/enums";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

// Enregistrer les polices (vous pouvez utiliser des polices système ou hébergées)
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOkCnqEu92Fr1Mu52xPKTU1Kg.ttf",
      fontWeight: 400,
      fontStyle: "italic",
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf",
      fontWeight: 700,
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOjCnqEu92Fr1Mu51TzBic6CsQ.ttf",
      fontWeight: 700,
      fontStyle: "italic",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Roboto",
    fontSize: 10,
    color: "#000000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  logo: {
    width: 150,
  },
  headerRight: {
    width: "30%",
    fontSize: 9,
  },
  addresses: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  companyInfo: {
    fontSize: 9,
  },
  clientInfo: {
    width: "30%",
    fontSize: 9,
  },
  bold: {
    fontWeight: 700,
  },
  vehicleInfo: {
    flexDirection: "row",
    marginBottom: 16,
    fontSize: 9,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
  },
  table: {
    width: "100%",
    borderWidth: 0.5,
    borderColor: "#000000",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#60A5FA",
    borderBottomWidth: 0.5,
    borderBottomColor: "#000000",
  },
  tableHeaderGreen: {
    flexDirection: "row",
    backgroundColor: "#4ADE80",
    borderBottomWidth: 0.5,
    borderBottomColor: "#000000",
  },
  tableHeaderRed: {
    flexDirection: "row",
    backgroundColor: "#F87171",
    borderBottomWidth: 0.5,
    borderBottomColor: "#000000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#000000",
  },
  tableRowLast: {
    flexDirection: "row",
  },
  tableCell: {
    padding: 4,
    fontSize: 9,
    textAlign: "center",
    borderRightWidth: 0.5,
    borderRightColor: "#000000",
  },
  tableCellLast: {
    padding: 4,
    fontSize: 9,
    textAlign: "center",
  },
  tableCellLeft: {
    padding: 4,
    fontSize: 9,
    textAlign: "left",
    borderRightWidth: 0.5,
    borderRightColor: "#000000",
  },
  tableCellRight: {
    padding: 4,
    fontSize: 9,
    textAlign: "right",
    borderRightWidth: 0.5,
    borderRightColor: "#000000",
  },
  designation55: {
    width: "49%",
  },
  quantity15: {
    width: "16%",
  },
  price15: {
    width: "20%",
  },
  total15: {
    width: "15%",
  },
  description49: {
    width: "49%",
  },
  rate16: {
    width: "16%",
  },
  hours20: {
    width: "20%",
  },
  designationFull: {
    width: "100%",
  },
  footer: {
    marginTop: "auto",
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: "#000000",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  paymentInfo: {
    fontSize: 9,
  },
  totalInfo: {
    fontSize: 9,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 32,
  },
  totalRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: "#000000",
    gap: 32,
  },
  totalLabel: {
    fontSize: 10,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 700,
  },
  totalLabelFinal: {
    fontSize: 14,
    fontWeight: 700,
  },
  totalValueFinal: {
    fontSize: 14,
    fontWeight: 700,
  },
  itemDescription: {
    fontSize: 8,
    color: "#666666",
    marginTop: 2,
  },
  itemDesignationBold: {
    fontSize: 9,
    fontWeight: 700,
  },
  upcomingItem: {
    fontSize: 9,
    fontWeight: 700,
    color: "#DC2626",
    textTransform: "uppercase",
  },
  laborDescription: {
    fontSize: 9,
  },
  laborDesignation: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  discount: {
    fontSize: 8,
    color: "#DC2626",
  },
});

type ItemType = "PART" | "LABOR" | "UPCOMING";

type EstimateItem = {
  id: string;
  type: ItemType;
  designation: string;
  description: string | null;
  unitPrice: number;
  quantity: number | null;
  discount: number | null;
  position: number;
};

type EstimateData = {
  id: string;
  type: TypeEstimate;
  claimNumber: string | null;
  logoBase64: string;
  items: EstimateItem[];
  intervention: {
    vehicule: {
      brand: string;
      model: string;
      year: number;
      licensePlate: string;
      client: {
        id: string;
        typeClient: "individual" | "company";
        firstName?: string | null;
        name?: string | null;
        companyName?: string | null;
        address?: string | null;
        city?: string | null;
        postalCode?: string | null;
      };
    };
  };
};

// Fonction pour parser le HTML et le rendre en composants React PDF
const parseHtmlToText = (html: string): React.ReactNode => {
  if (!html) return null;

  // Nettoyer les entités HTML
  const cleanHtml = html
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');

  // Parser basique pour gérer <p>, <strong>, <em>, <u>
  const parts: React.ReactNode[] = [];
  let inStrong = false;
  let inEm = false;
  let inUnderline = false;

  // Remplacer les balises par des marqueurs
  const processed = cleanHtml
    .replace(/<p>/gi, "\n")
    .replace(/<\/p>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n");

  // Diviser en segments avec strong/em/u
  const segments = processed.split(
    /(<\/?strong>|<\/?em>|<\/?b>|<\/?i>|<\/?u>)/gi,
  );

  segments.forEach((segment, index) => {
    if (segment === "<strong>" || segment === "<b>") {
      inStrong = true;
    } else if (segment === "</strong>" || segment === "</b>") {
      inStrong = false;
    } else if (segment === "<em>" || segment === "<i>") {
      inEm = true;
    } else if (segment === "</em>" || segment === "</i>") {
      inEm = false;
    } else if (segment === "<u>") {
      inUnderline = true;
    } else if (segment === "</u>") {
      inUnderline = false;
    } else if (segment) {
      const cleanText = segment.replace(/<[^>]*>/g, "").trim();
      if (cleanText) {
        parts.push(
          <Text
            key={index}
            style={{
              fontWeight: inStrong ? 700 : 400,
              fontStyle: inEm ? "italic" : "normal",
              textDecoration: inUnderline ? "underline" : "none",
            }}
          >
            {cleanText}{" "}
          </Text>,
        );
      }
    }
  });

  return parts.length > 0 ? parts : cleanHtml.replace(/<[^>]*>/g, "").trim();
};

export const EstimatePDF = ({ data }: { data: EstimateData }) => {
  const calculateTotal = () => {
    return data.items.reduce((sum, item) => {
      let itemTotal: number;

      // Pour les items LABOR, quantity est en minutes, donc convertir en heures
      if (item.type === "LABOR") {
        const hoursDecimal = (item.quantity ?? 0) / 60;
        itemTotal = item.unitPrice * hoursDecimal;
      } else {
        itemTotal = item.unitPrice * (item.quantity ?? 0);
      }

      const discountAmount = item.discount
        ? (itemTotal * item.discount) / 100
        : 0;
      return sum + (itemTotal - discountAmount);
    }, 0);
  };

  const currentDate = new Date();
  const paymentDate = new Date();
  paymentDate.setMonth(paymentDate.getMonth() + 1);

  const parts = data.items.filter((item) => item.type === "PART");
  const labor = data.items.filter((item) => item.type === "LABOR");
  const upcoming = data.items.filter((item) => item.type === "UPCOMING");

  const client = data.intervention.vehicule.client;
  const clientName =
    client.typeClient === "individual"
      ? `${client.firstName} ${client.name}`
      : client.companyName;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image style={styles.logo} src={data.logoBase64} />
          <View style={styles.headerRight}>
            {data.type === "INSURANCE" && data.claimNumber && (
              <Text>
                Numéro de sinistre :{" "}
                <Text style={styles.bold}>{data.claimNumber}</Text>
              </Text>
            )}
            <Text>
              Numéro client : <Text style={styles.bold}>{client.id}</Text>
            </Text>
            <Text>
              Numéro devis : <Text style={styles.bold}>{data.id}</Text>
            </Text>
          </View>
        </View>

        {/* Addresses */}
        <View style={styles.addresses}>
          <View style={styles.companyInfo}>
            <Text style={styles.bold}>Swiss Car Consulting SA</Text>
            <Text>Route des Jeunes, 13</Text>
            <Text>1227, Carouge</Text>
            <Text>Tel: +41 79 123 45 67</Text>
            <Text>Mail: contact@swisscarconsulting.ch</Text>
          </View>
          <View style={styles.clientInfo}>
            <Text style={{ marginBottom: 8 }}>
              {currentDate.toLocaleDateString("fr-CH", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
            <Text style={styles.bold}>{clientName}</Text>
            {client.address && client.city && client.postalCode && (
              <>
                <Text>{client.address}</Text>
                <Text>
                  {client.postalCode}, {client.city}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Vehicle Info */}
        <View style={styles.vehicleInfo}>
          <Text>
            <Text style={styles.bold}>Véhicule : </Text>
            {data.intervention.vehicule.brand}{" "}
            {data.intervention.vehicule.model} (
            {data.intervention.vehicule.year})
          </Text>
          <Text>&nbsp;/&nbsp;</Text>
          <Text>
            <Text style={styles.bold}>Plaque: </Text>
            {data.intervention.vehicule.licensePlate}
          </Text>
        </View>

        {/* Parts Table */}
        {parts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pièces</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.designation55]}>
                  Désignation
                </Text>
                <Text style={[styles.tableCell, styles.price15]}>
                  Prix unitaire
                </Text>
                <Text style={[styles.tableCell, styles.quantity15]}>
                  Quantité
                </Text>
                <Text style={[styles.tableCellLast, styles.total15]}>
                  Total HT
                </Text>
              </View>
              {parts
                .sort((a, b) => a.position - b.position)
                .map((item, index) => (
                  <View
                    key={item.id}
                    style={
                      index === parts.length - 1
                        ? styles.tableRowLast
                        : styles.tableRow
                    }
                  >
                    <View style={[styles.tableCellLeft, styles.designation55]}>
                      <Text style={styles.itemDesignationBold}>
                        {parseHtmlToText(item.designation)}
                      </Text>
                      {item.description && (
                        <Text style={styles.itemDescription}>
                          {parseHtmlToText(item.description)}
                        </Text>
                      )}
                    </View>
                    <Text style={[styles.tableCellRight, styles.price15]}>
                      {item.unitPrice.toFixed(2)} CHF
                    </Text>
                    <Text style={[styles.tableCellRight, styles.quantity15]}>
                      {item.quantity ?? 0}
                    </Text>
                    <Text style={[styles.tableCellRight, styles.total15]}>
                      {(item.unitPrice * (item.quantity ?? 0)).toFixed(2)} CHF
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* Labor Table */}
        {labor.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Main d&apos;œuvre</Text>
            <View style={styles.table}>
              <View style={styles.tableHeaderGreen}>
                <Text style={[styles.tableCell, styles.description49]}>
                  Description
                </Text>
                <Text style={[styles.tableCell, styles.rate16]}>
                  Tarif / heure
                </Text>
                <Text style={[styles.tableCell, styles.hours20]}>Durée</Text>
                <Text style={[styles.tableCellLast, styles.total15]}>
                  Total HT
                </Text>
              </View>
              {labor
                .sort((a, b) => a.position - b.position)
                .map((item, index) => {
                  // Convertir les minutes en heures pour le calcul
                  const totalMinutes = item.quantity ?? 0;
                  const hoursDecimal = totalMinutes / 60;
                  const itemTotal = item.unitPrice * hoursDecimal;
                  const discountAmount = item.discount
                    ? (itemTotal * item.discount) / 100
                    : 0;
                  const total = itemTotal - discountAmount;

                  // Convertir les minutes en format heures et minutes pour l'affichage
                  const hours = Math.floor(totalMinutes / 60);
                  const minutes = totalMinutes % 60;
                  const durationText = `${hours}h${minutes > 0 ? ` ${minutes}min` : ""}`;

                  return (
                    <View
                      key={item.id}
                      style={
                        index === labor.length - 1
                          ? styles.tableRowLast
                          : styles.tableRow
                      }
                    >
                      <View
                        style={[styles.tableCellLeft, styles.description49]}
                      >
                        {item.description === "" || !item.description ? (
                          <Text style={styles.laborDescription}>
                            {"Main d'œuvre"}
                          </Text>
                        ) : (
                          <Text style={styles.laborDescription}>
                            {parseHtmlToText(item.description)}
                          </Text>
                        )}
                      </View>
                      <View style={[styles.tableCellRight, styles.rate16]}>
                        <Text>{item.unitPrice.toFixed(2)} CHF</Text>
                        {item.discount && (
                          <Text style={styles.discount}>-{item.discount}%</Text>
                        )}
                      </View>
                      <Text style={[styles.tableCellRight, styles.hours20]}>
                        {durationText}
                      </Text>
                      <Text style={[styles.tableCellRight, styles.total15]}>
                        {total.toFixed(2)} CHF
                      </Text>
                    </View>
                  );
                })}
            </View>
          </View>
        )}

        {/* Upcoming Items Table */}
        {upcoming.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>À prévoir</Text>
            <View style={styles.table}>
              <View style={styles.tableHeaderRed}>
                <Text style={[styles.tableCellLast, styles.designationFull]}>
                  Désignation
                </Text>
              </View>
              {upcoming
                .sort((a, b) => a.position - b.position)
                .map((item, index) => (
                  <View
                    key={item.id}
                    style={
                      index === upcoming.length - 1
                        ? styles.tableRowLast
                        : styles.tableRow
                    }
                  >
                    <View
                      style={[styles.tableCellLeft, styles.designationFull]}
                    >
                      <Text style={styles.upcomingItem}>
                        {parseHtmlToText(item.designation)}
                      </Text>
                      {item.description && (
                        <Text style={styles.itemDescription}>
                          {parseHtmlToText(item.description)}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.paymentInfo}>
            <Text style={styles.bold}>Conditions de paiement :</Text>
            <Text style={{ marginTop: 4 }}>
              Paiement à effectuer dans un délai de 30 jours
            </Text>
            <Text style={{ marginTop: 2 }}>
              Date limite : {paymentDate.toLocaleDateString("fr-CH")}
            </Text>
            <Text style={[styles.bold, { marginTop: 8 }]}>IBAN :</Text>
            <Text>CH00 0000 0000 0000 0000 0</Text>
          </View>
          <View style={styles.totalInfo}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total HT :</Text>
              <Text style={styles.totalValue}>
                {calculateTotal().toFixed(2)} CHF
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TVA (10%) :</Text>
              <Text style={styles.totalValue}>
                {(calculateTotal() * 0.1).toFixed(2)} CHF
              </Text>
            </View>
            <View style={styles.totalRowFinal}>
              <Text style={styles.totalLabelFinal}>Total TTC :</Text>
              <Text style={styles.totalValueFinal}>
                {(calculateTotal() * 1.1).toFixed(2)} CHF
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
