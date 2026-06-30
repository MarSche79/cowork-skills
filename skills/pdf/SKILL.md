---
name: "pdf"
description: "Read, extract, merge, split, create, fill forms, OCR, watermark, encrypt/decrypt PDF files. Triggers: any .pdf file, 'PDF', 'merge PDFs', 'extract from PDF', 'fill PDF form', 'OCR'."
---

# PDF Processing Guide

## Overview
This guide covers essential PDF processing operations using Python libraries and command-line tools.

## Quick Start
```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("document.pdf")
print(f"Pages: {len(reader.pages)}")
text = ""
for page in reader.pages:
    text += page.extract_text()
```

## Python Libraries

### pypdf - Basic Operations

#### Merge PDFs
```python
from pypdf import PdfWriter, PdfReader
writer = PdfWriter()
for pdf_file in ["doc1.pdf", "doc2.pdf", "doc3.pdf"]:
    reader = PdfReader(pdf_file)
    for page in reader.pages:
        writer.add_page(page)
with open("merged.pdf", "wb") as output:
    writer.write(output)
```

#### Split PDF
```python
reader = PdfReader("input.pdf")
for i, page in enumerate(reader.pages):
    writer = PdfWriter()
    writer.add_page(page)
    with open(f"page_{i+1}.pdf", "wb") as output:
        writer.write(output)
```

#### Extract Metadata
```python
reader = PdfReader("document.pdf")
meta = reader.metadata
print(f"Title: {meta.title}, Author: {meta.author}")
```

#### Rotate Pages
```python
page = reader.pages[0]
page.rotate(90)
```

### pdfplumber - Text and Table Extraction

#### Extract Text with Layout
```python
import pdfplumber
with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        print(text)
```

#### Extract Tables
```python
with pdfplumber.open("document.pdf") as pdf:
    for i, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        for j, table in enumerate(tables):
            for row in table:
                print(row)
```

#### Advanced Table Extraction to Excel
```python
import pandas as pd
with pdfplumber.open("document.pdf") as pdf:
    all_tables = []
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            if table:
                df = pd.DataFrame(table[1:], columns=table[0])
                all_tables.append(df)
if all_tables:
    combined_df = pd.concat(all_tables, ignore_index=True)
    combined_df.to_excel("extracted_tables.xlsx", index=False)
```

### reportlab - Create PDFs

#### Basic PDF Creation
```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
c = canvas.Canvas("hello.pdf", pagesize=letter)
width, height = letter
c.drawString(100, height - 100, "Hello World!")
c.save()
```

#### Multi-Page PDF
```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet
doc = SimpleDocTemplate("report.pdf", pagesize=letter)
styles = getSampleStyleSheet()
story = [Paragraph("Report Title", styles['Title']), Spacer(1, 12),
         Paragraph("Body text...", styles['Normal']), PageBreak(),
         Paragraph("Page 2", styles['Heading1'])]
doc.build(story)
```

**IMPORTANT**: Never use Unicode subscript/superscript characters in ReportLab. Use `<sub>` and `<super>` tags instead.

## Command-Line Tools

### pdftotext (poppler-utils)
```bash
pdftotext input.pdf output.txt
pdftotext -layout input.pdf output.txt
pdftotext -f 1 -l 5 input.pdf output.txt
```

### qpdf
```bash
qpdf --empty --pages file1.pdf file2.pdf -- merged.pdf
qpdf input.pdf --pages . 1-5 -- pages1-5.pdf
qpdf --password=mypassword --decrypt encrypted.pdf decrypted.pdf
```

## Common Tasks

### OCR Scanned PDFs
```python
import pytesseract
from pdf2image import convert_from_path
images = convert_from_path('scanned.pdf')
text = ""
for i, image in enumerate(images):
    text += f"Page {i+1}:\n" + pytesseract.image_to_string(image) + "\n\n"
```

### Add Watermark
```python
watermark = PdfReader("watermark.pdf").pages[0]
reader = PdfReader("document.pdf")
writer = PdfWriter()
for page in reader.pages:
    page.merge_page(watermark)
    writer.add_page(page)
with open("watermarked.pdf", "wb") as output:
    writer.write(output)
```

### Password Protection
```python
writer.encrypt("userpassword", "ownerpassword")
```

### Extract Images
```bash
pdfimages -j input.pdf output_prefix
```

## Quick Reference
| Task | Best Tool | Method |
|------|-----------|--------|
| Merge PDFs | pypdf | `writer.add_page(page)` |
| Split PDFs | pypdf | One page per file |
| Extract text | pdfplumber | `page.extract_text()` |
| Extract tables | pdfplumber | `page.extract_tables()` |
| Create PDFs | reportlab | Canvas or Platypus |
| CLI merge | qpdf | `qpdf --empty --pages ...` |
| OCR scanned | pytesseract | Convert to image first |

## Dependencies
Install as needed: `pip install pypdf pdfplumber reportlab pytesseract pdf2image pandas`

## PDF Forms
For filling PDF forms, use pdf-lib (JavaScript) or pypdf. Key approach:
- Read form fields with `reader.get_form_text_fields()`
- Fill with `writer.update_page_form_field_values(page, fields_dict)`
- For complex forms, use JavaScript pdf-lib via Node.js


