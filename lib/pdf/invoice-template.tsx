import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { type InvoiceWithItems } from "@/app/invoices/actions";

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#111",
  },
  invoiceNumber: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
  },
  headerRight: {
    textAlign: "right",
  },
  label: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  addresses: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  addressBlock: {
    width: "45%",
  },
  companyName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    marginTop: 4,
    marginBottom: 2,
  },
  addressText: {
    color: "#555",
    lineHeight: 1.5,
  },
  description: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    marginBottom: 15,
    color: "#333",
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#ddd",
    paddingBottom: 6,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  colDesc: {
    width: "50%",
  },
  colQty: {
    width: "15%",
    textAlign: "right",
  },
  colRate: {
    width: "15%",
    textAlign: "right",
  },
  colAmount: {
    width: "20%",
    textAlign: "right",
  },
  headerCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalRow: {
    flexDirection: "row",
    borderTopWidth: 2,
    borderTopColor: "#ddd",
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },
  totalAmount: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },
  paymentSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: "center",
    color: "#aaa",
    fontSize: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#eee",
    paddingTop: 8,
  },
});

function fmt(n: number) {
  return `$ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function InvoiceTemplate({
  invoice,
}: {
  invoice: InvoiceWithItems;
}) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>
              {invoice.invoice_number}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Date: </Text>
              {fmtDate(invoice.date)}
            </Text>
            <Text style={{ marginTop: 2 }}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Due: </Text>
              {fmtDate(invoice.due_date)}
            </Text>
          </View>
        </View>

        {/* Addresses */}
        <View style={styles.addresses}>
          <View style={styles.addressBlock}>
            <Text style={styles.label}>From</Text>
            <Text style={styles.companyName}>Extempore Productions</Text>
            <Text style={styles.addressText}>46 New York Ave, Apt 1L</Text>
            <Text style={styles.addressText}>Brooklyn, NY 11216</Text>
            <Text style={styles.addressText}>(651) 675 7951</Text>
            <Text style={styles.addressText}>
              ariephraimfeldman@gmail.com
            </Text>
          </View>
          <View style={styles.addressBlock}>
            <Text style={styles.label}>Bill To</Text>
            <Text style={styles.companyName}>{invoice.client.name}</Text>
            {invoice.client.address && (
              <Text style={styles.addressText}>
                {invoice.client.address}
              </Text>
            )}
            {invoice.client.email && (
              <Text style={styles.addressText}>
                {invoice.client.email}
              </Text>
            )}
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <Text style={styles.description}>{invoice.notes}</Text>
        )}

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.colDesc}>
              <Text style={styles.headerCell}>Description</Text>
            </View>
            <View style={styles.colQty}>
              <Text style={styles.headerCell}>Qty</Text>
            </View>
            <View style={styles.colRate}>
              <Text style={styles.headerCell}>Rate</Text>
            </View>
            <View style={styles.colAmount}>
              <Text style={styles.headerCell}>Amount</Text>
            </View>
          </View>

          {invoice.line_items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <View style={styles.colDesc}>
                <Text>{item.description}</Text>
              </View>
              <View style={styles.colQty}>
                <Text>{item.quantity}</Text>
              </View>
              <View style={styles.colRate}>
                <Text>{fmt(item.unit_price)}</Text>
              </View>
              <View style={styles.colAmount}>
                <Text>{fmt(item.total)}</Text>
              </View>
            </View>
          ))}

          <View style={styles.totalRow}>
            <View style={[styles.colDesc, { flexDirection: "row", justifyContent: "flex-end" }]}>
              <Text style={styles.totalLabel} />
            </View>
            <View style={styles.colQty} />
            <View style={styles.colRate}>
              <Text style={styles.totalLabel}>Total</Text>
            </View>
            <View style={styles.colAmount}>
              <Text style={styles.totalAmount}>{fmt(invoice.total)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.paymentSection}>
          <Text style={styles.label}>Payment Details</Text>
          <Text style={[styles.addressText, { marginTop: 4 }]}>
            Please pay via check or via ACH. Please call for ACH information.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            www.ariephraimfeldman.com | ariephraimfeldman@gmail.com | IG:
            @aefeldman
          </Text>
        </View>
      </Page>
    </Document>
  );
}
