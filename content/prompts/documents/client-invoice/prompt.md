---
title: Clean client invoice
summary: A professional A4 invoice with line items, VAT, totals, bank details and a thank-you note.
category: documents
models: [Claude, ChatGPT]
tags: [invoice, freelance, finance, pdf]
difficulty: beginner
created: 2026-09-12
settings:
  Output: A4 HTML → PDF
blanks:
  from:
    label: From
    default: Studio Paloma Ltd
  to:
    label: Billed to
    default: Harbour & Co.
  vat:
    label: VAT rate
    default: 20%
results:
  - type: document
    pages: [page-1.jpg]
    pdf: document.pdf
    alt: A minimal invoice from Studio Paloma with four line items and a bold total of £8,916.00.
    model: Claude
    placeholder: true
---
Generate a professional invoice as a printable A4 page from {{from}} to {{to}}. Include the invoice number, issue and due dates and PO number; billed-to and from blocks (with VAT number); a line-item table (description with a short sub-detail, qty, rate, amount); subtotal, VAT at {{vat}} and a bold total; bank details and a short thank-you note. Minimal design with a single accent colour. Double-check that all the maths adds up.
