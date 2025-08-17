#!/usr/bin/env python3
# Rebuild Qianziwen PDFs from local HTML files in this folder.
# Requires: reportlab (pip install reportlab)

import os, re, sys
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, ListFlowable, ListItem
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont

FOLDER = os.path.dirname(os.path.abspath(__file__))

CHAPTERS = [
    ("part1-cosmos.html", "Cosmos & Seasons"),
    ("part2-nature.html", "Nature & Virtue"),
    ("part3-virtues.html", "Virtues & Conduct"),
    ("part4-history.html", "Heroes & Landmarks"),
    ("part5-governance.html", "Governance & Virtue"),
    ("part6-learning.html", "Learning & Growth"),
    ("part7-seasons.html", "Quiet Study & Nature"),
    ("part8-home.html", "Home Life & Conduct"),
    ("part9-values.html", "Values & Daily Conduct"),
    ("part10-nature2.html", "Resilience & True Nature"),
    ("part11-court.html", "Court Life & Order"),
    ("part12-virtue2.html", "Deeds & Statecraft"),
    ("part13-law.html", "Law, Order & Learning"),
    ("part14-culture.html", "Ceremony, Safety & Arts"),
    ("part15-cosmos2.html", "Cosmos, Time & Conduct"),
    ("part16-nature3.html", "Conduct & Harmony"),
]

def clean_html(t: str) -> str:
    t = re.sub(r'<br\s*/?>', ' ', t)
    t = re.sub(r'<[^>]+>', '', t)
    return re.sub(r'\s+', ' ', t).strip()

def extract_pairs(html_text: str):
    ens = re.findall(r'<div class="en">(.*?)</div>', html_text, flags=re.DOTALL)
    notes = re.findall(r'<div class="note">(.*?)</div>', html_text, flags=re.DOTALL)
    return [(clean_html(e), clean_html(n)) for e,n in zip(ens, notes)]

def extract_items(html_text: str):
    def pick(cls):
        return [clean_html(x) for x in re.findall(rf'<div class="{cls}">(.*?)</div>', html_text, flags=re.DOTALL)]
    han = pick("han"); pinyin = pick("pinyin"); en = pick("en"); note = pick("note")
    return list(zip(han, pinyin, en, note))

def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 9)
    canvas.setFillColorRGB(0.35,0.35,0.35)
    canvas.drawRightString(8.0*inch, 0.5*inch, f"Page {doc.page}")
    canvas.restoreState()

def build_english():
    out = os.path.join(FOLDER, "booklet-english.pdf")
    styles = getSampleStyleSheet()
    title = ParagraphStyle('title', parent=styles['Title'], textColor=colors.HexColor("#2e4c32"))
    subtitle = ParagraphStyle('subtitle', parent=styles['Heading2'], textColor=colors.HexColor("#2e4c32"))
    chapter_h = ParagraphStyle('chapter_h', parent=styles['Heading1'], textColor=colors.HexColor("#2e4c32"), spaceAfter=8)
    ptext = ParagraphStyle('ptext', parent=styles['BodyText'], fontSize=11, leading=15)
    note_style = ParagraphStyle('note', parent=styles['BodyText'], fontSize=10.5, leading=14, textColor=colors.HexColor("#3a3a3a"), leftIndent=10)
    note_style.italic = True

    doc = SimpleDocTemplate(out, pagesize=letter,
                            rightMargin=0.7*inch, leftMargin=0.7*inch,
                            topMargin=0.7*inch, bottomMargin=0.7*inch)

    story = []
    story.append(Paragraph("Thousand Character Classic — Family Booklet (English)", title))
    story.append(Paragraph("Explanations & Parent notes (print‑friendly)", subtitle))
    story.append(Spacer(1, 18))

    for i,(fname, sub) in enumerate(CHAPTERS, start=1):
        path = os.path.join(FOLDER, fname)
        if not os.path.exists(path): 
            continue
        html = open(path, "r", encoding="utf-8").read()
        pairs = extract_pairs(html)
        story.append(Paragraph(f"Chapter {i} — {sub}", chapter_h))
        for idx,(en_txt, note_txt) in enumerate(pairs, start=1):
            story.append(Paragraph(f"{idx}. {en_txt}", ptext))
            story.append(Paragraph(f"Parent note: {note_txt}", note_style))
            story.append(Spacer(1, 6))
        story.append(PageBreak())

    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print("Wrote", out)

def build_bilingual():
    out = os.path.join(FOLDER, "booklet-bilingual.pdf")
    try:
        pdfmetrics.registerFont(UnicodeCIDFont('STSong-Light'))
        CJK_FONT = 'STSong-Light'
    except Exception:
        CJK_FONT = 'Helvetica'

    styles = getSampleStyleSheet()
    title = ParagraphStyle('title', parent=styles['Title'], textColor=colors.HexColor("#2e4c32"))
    subtitle = ParagraphStyle('subtitle', parent=styles['Heading2'], textColor=colors.HexColor("#2e4c32"))
    chapter_h = ParagraphStyle('chapter_h', parent=styles['Heading1'], textColor=colors.HexColor("#2e4c32"), spaceAfter=8)
    ptext = ParagraphStyle('ptext', parent=styles['BodyText'], fontSize=11, leading=15)
    note_style = ParagraphStyle('note', parent=styles['BodyText'], fontSize=10.5, leading=14, textColor=colors.HexColor("#3a3a3a"), leftIndent=10)
    note_style.italic = True
    han_style = ParagraphStyle('han', parent=styles['Heading3'], fontName=CJK_FONT, fontSize=13.5, leading=16, textColor=colors.HexColor("#1f3b2d"))
    pinyin_style = ParagraphStyle('pinyin', parent=styles['BodyText'], fontSize=11.5, leading=15, textColor=colors.HexColor("#54626b"))

    doc = SimpleDocTemplate(out, pagesize=letter,
                            rightMargin=0.7*inch, leftMargin=0.7*inch,
                            topMargin=0.7*inch, bottomMargin=0.7*inch)

    story = []
    story.append(Paragraph("Thousand Character Classic — Bilingual Family Booklet", title))
    story.append(Paragraph("Chinese + Pinyin + English + Parent notes", subtitle))
    story.append(Spacer(1, 18))

    for i,(fname, sub) in enumerate(CHAPTERS, start=1):
        path = os.path.join(FOLDER, fname)
        if not os.path.exists(path): 
            continue
        html = open(path, "r", encoding="utf-8").read()
        items = extract_items(html)
        story.append(Paragraph(f"Chapter {i} — {sub}", chapter_h))
        for (han, py, en_txt, note_txt) in items:
            story.append(Paragraph(han, han_style))
            story.append(Paragraph(py, pinyin_style))
            story.append(Paragraph(en_txt, ptext))
            story.append(Paragraph("Parent note: " + note_txt, note_style))
            story.append(Spacer(1, 8))
        story.append(PageBreak())

    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print("Wrote", out)

def build_print_pack():
    out = os.path.join(FOLDER, "print-pack.pdf")
    styles = getSampleStyleSheet()
    title = ParagraphStyle('title', parent=styles['Title'], textColor=colors.HexColor("#2e4c32"))
    subtitle = ParagraphStyle('subtitle', parent=styles['Heading2'], textColor=colors.HexColor("#2e4c32"))
    ptext = ParagraphStyle('ptext', parent=styles['BodyText'], fontSize=11, leading=15)

    doc = SimpleDocTemplate(out, pagesize=letter,
                            rightMargin=0.7*inch, leftMargin=0.7*inch,
                            topMargin=0.6*inch, bottomMargin=0.6*inch)
    story = []
    story.append(Paragraph("Qianziwen (Thousand Character Classic) — Print Pack", title))
    story.append(Paragraph("A quick guide for families: one page for kids, one for parents.", ptext))
    story.append(Spacer(1, 12))
    from reportlab.platypus import ListFlowable, ListItem
    def add_list(items): story.append(ListFlowable([ListItem(Paragraph(pt, ptext)) for pt in items], bulletType='bullet', start='disc', leftIndent=18))

    story.append(Paragraph("Kids’ Guide — How to Read", subtitle))
    add_list([
        "<b>Look</b> at the Chinese line and try the pinyin slowly.",
        "<b>Listen</b> to the meaning in simple English.",
        "<b>Spot</b> one picture in your mind (sky, river, seasons, heroes…).",
        "<b>Do one thing</b> from the Parent Note (moon‑phase journal, kindness action, “soar time”).",
        "<b>Ask</b> one question: “What does this look like in my life?”",
        "<b>Two lines a day</b> is plenty — small steps make big learning.",
    ])
    story.append(Spacer(1, 12))
    story.append(Paragraph("Parents’ Guide — How to Lead", subtitle))
    add_list([
        "<b>Keep it short.</b> 5–10 minutes wins consistency.",
        "<b>Connect to today.</b> Nature patterns, chores, friendships, gratitude, calm.",
        "<b>Reflect, don’t lecture.</b> Ask open questions; let kids notice.",
        "<b>Model virtues.</b> Fair sharing, careful words, quiet starts, finishing well.",
        "<b>Celebrate small wins.</b> Keep a simple “family wins” list on the fridge.",
        "<b>Routine:</b> Mon–Fri read 2 lines · Sat 1 activity · Sun 1 story that matches a verse.",
    ])
    doc.build(story)
    print("Wrote", out)

if __name__ == "__main__":
    build_english()
    build_bilingual()
    build_print_pack()
    print("Done.")