import { renderToBuffer } from "@react-pdf/renderer";
import { getInvoice } from "../../actions";
import InvoiceTemplate from "@/lib/pdf/invoice-template";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const invoice = await getInvoice(parseInt(id, 10));

  if (!invoice) {
    return new Response("Invoice not found", { status: 404 });
  }

  const buffer = await renderToBuffer(
    InvoiceTemplate({ invoice })
  );

return new Response(buffer as unknown as BodyInit, {
      headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.invoice_number}.pdf"`,
    },
  });
}
