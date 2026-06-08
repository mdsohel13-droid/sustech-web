# Project Ebook — "Build a World-Class Website with AI"

A publishable, Amazon-ready book documenting how the Sustech Technology website was
built — from an empty folder to a live site with an image-capable AI chatbot — in
**46 counted steps**. Written for non-technical readers ("AI mastering", no code).

## Deliverable

- **`Build-a-World-Class-Website-with-AI.docx`** — the manuscript (MS Word, 6×9″ trim,
  mirrored margins, roman front matter + arabic body, auto Table of Contents,
  3-format ISBN layout, 7 brand diagrams, 41 reader callouts).

Author: **Md. Sohel Sikder**, Managing Director & Founder, Sustech Technology Ltd.

## Regenerate

```bash
python ebook/figures.py        # writes figures/*.png (diagrams + cover mock)
python ebook/build_ebook.py    # writes the .docx
```

Requires: `python-docx`, `matplotlib` (`pip install python-docx matplotlib`).

## Finishing touches before publishing

1. Save the author portrait as `ebook/figures/author-photo.jpg`, then rebuild — it
   auto-embeds on the About-the-Author page (otherwise a placeholder shows).
2. Drop real screenshots in at the 4 placeholders (see Appendix E in the book).
3. In Word: right-click the Contents → **Update Field → Update entire table**.
4. Assign ISBNs (Appendix B) and export to PDF for the print editions.
