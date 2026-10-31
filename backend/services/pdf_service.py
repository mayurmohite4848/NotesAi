import os
import io
import re
from datetime import datetime
from PIL import Image
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable, Image as RLImage
)

def split_pdf_to_images(pdf_path, output_dir):
    """
    Extracts embedded page images from an uploaded PDF file, or converts pages to images.
    Returns list of saved image paths in page order.
    """
    os.makedirs(output_dir, exist_ok=True)
    extracted_images = []

    try:
        from pypdf import PdfReader
        reader = PdfReader(pdf_path)
        
        base_name = os.path.splitext(os.path.basename(pdf_path))[0]
        
        for idx, page in enumerate(reader.pages):
            page_num = idx + 1
            # Check for embedded images in the page
            found_img = False
            for img_idx, image_file_object in enumerate(page.images):
                img_ext = os.path.splitext(image_file_object.name)[1] or ".jpg"
                out_filename = f"{base_name}_page_{page_num}_{img_idx}{img_ext}"
                out_path = os.path.join(output_dir, out_filename)
                with open(out_path, "wb") as fp:
                    fp.write(image_file_object.data)
                extracted_images.append(out_path)
                found_img = True
                break # Take primary image per page
            
            # If no direct image was extracted, fallback to rendering page placeholder
            if not found_img:
                out_filename = f"{base_name}_page_{page_num}.png"
                out_path = os.path.join(output_dir, out_filename)
                # Create a clean white canvas for text extraction
                img = Image.new("RGB", (1200, 1600), color=(255, 255, 255))
                img.save(out_path)
                extracted_images.append(out_path)

    except Exception as e:
        print(f"[PDF Service] Error splitting PDF {pdf_path}: {e}")

    return extracted_images

def generate_notebook_pdf(notebook, output_stream):
    """
    Generates a beautifully styled, printable PDF document of a full multi-page notebook using ReportLab.
    """
    doc = SimpleDocTemplate(
        output_stream,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'NotebookTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#1e1b4b'),
        spaceAfter=12
    )

    subtitle_style = ParagraphStyle(
        'NotebookSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#4f46e5'),
        spaceAfter=20
    )

    page_heading_style = ParagraphStyle(
        'PageHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=14,
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        'PageBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=15,
        textColor=colors.HexColor('#334155'),
        spaceAfter=10
    )

    meta_style = ParagraphStyle(
        'MetaText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#64748b')
    )

    story = []

    # 1. Cover / Header Banner
    story.append(Paragraph(notebook.get('title', 'Notebook Notes'), title_style))
    sub = f"Subject: {notebook.get('subject_tag', 'General')}  |  Total Pages: {len(notebook.get('pages', []))}  |  Generated: {datetime.now().strftime('%b %d, %Y')}"
    story.append(Paragraph(sub, subtitle_style))
    
    if notebook.get('description'):
        story.append(Paragraph(f"<b>Description:</b> {notebook.get('description')}", body_style))
        story.append(Spacer(1, 10))

    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#6366f1'), spaceAfter=20))

    # 2. Table of Contents / Outline
    pages = notebook.get('pages', [])
    if pages:
        story.append(Paragraph("<b>Table of Contents</b>", page_heading_style))
        toc_data = []
        for p in pages:
            p_num = p.get('page_number', 1)
            p_title = p.get('title') or f"Page {p_num}"
            toc_data.append([
                Paragraph(f"<b>Page {p_num}:</b> {p_title}", body_style)
            ])
        
        toc_table = Table(toc_data, colWidths=[500])
        toc_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ]))
        story.append(toc_table)
        story.append(Spacer(1, 25))

    # 3. Individual Pages
    for idx, p in enumerate(pages):
        if idx > 0:
            story.append(PageBreak())

        p_num = p.get('page_number', idx + 1)
        p_title = p.get('title') or f"Page {p_num}"
        
        # Header
        story.append(Paragraph(f"Page {p_num} &mdash; {p_title}", page_heading_style))
        story.append(HRFlowable(width="100%", thickness=0.75, color=colors.HexColor('#cbd5e1'), spaceAfter=14))

        # Content text (split by newlines to keep paragraph formatting)
        content_text = p.get('content') or p.get('extracted_text') or "No content."
        for line in content_text.split('\n'):
            line_clean = line.strip()
            if not line_clean:
                story.append(Spacer(1, 4))
                continue
            
            # Simple markdown bold replacement for ReportLab
            formatted_line = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', line_clean)
            formatted_line = re.sub(r'\*(.*?)\*', r'<i>\1</i>', formatted_line)
            
            if line_clean.startswith('#'):
                header_level = len(re.match(r'^#+', line_clean).group(0))
                header_text = line_clean.lstrip('#').strip()
                story.append(Paragraph(f"<b>{header_text}</b>", ParagraphStyle(
                    'SubHead',
                    parent=body_style,
                    fontName='Helvetica-Bold',
                    fontSize=11,
                    spaceBefore=8,
                    spaceAfter=4,
                    textColor=colors.HexColor('#1e293b')
                )))
            elif line_clean.startswith('-') or line_clean.startswith('*') or line_clean.startswith('•'):
                bullet_text = line_clean.lstrip('-*• ').strip()
                story.append(Paragraph(f"&bull; {bullet_text}", ParagraphStyle('Bullet', parent=body_style, leftIndent=12)))
            else:
                story.append(Paragraph(formatted_line, body_style))

        # Footer notes
        story.append(Spacer(1, 15))
        story.append(Paragraph(f"Digitized with NoteExtract AI &bull; {notebook.get('title', 'Notebook')}", meta_style))

    doc.build(story)

def generate_notebook_markdown(notebook):
    """
    Generates a consolidated Markdown (.md) bundle for a notebook.
    """
    lines = []
    lines.append(f"# {notebook.get('title', 'Notebook')}")
    lines.append(f"**Subject:** {notebook.get('subject_tag', 'General')}  ")
    lines.append(f"**Created:** {notebook.get('created_at', '')}  ")
    lines.append(f"**Total Pages:** {len(notebook.get('pages', []))}\n")

    if notebook.get('description'):
        lines.append(f"_{notebook.get('description')}_\n")

    lines.append("---\n")

    for p in notebook.get('pages', []):
        p_num = p.get('page_number', 1)
        p_title = p.get('title') or f"Page {p_num}"
        lines.append(f"## Page {p_num}: {p_title}\n")
        lines.append(p.get('content') or p.get('extracted_text') or "")
        lines.append("\n---\n")

    return "\n".join(lines)


def generate_single_note_pdf(note, output_stream):
    """
    Generates a beautifully styled, printable PDF document for a single note using ReportLab.
    """
    doc = SimpleDocTemplate(
        output_stream,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'NoteTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#1e1b4b'),
        spaceAfter=10
    )

    subtitle_style = ParagraphStyle(
        'NoteSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#6366f1'),
        spaceAfter=16
    )

    body_style = ParagraphStyle(
        'NoteBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=15,
        textColor=colors.HexColor('#334155'),
        spaceAfter=8
    )

    ai_style = ParagraphStyle(
        'AIInsights',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=6
    )

    meta_style = ParagraphStyle(
        'NoteMeta',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#64748b')
    )

    story = []

    # Title & Metadata
    title_text = note.get('title') or "Untitled Note"
    story.append(Paragraph(title_text, title_style))

    tags = note.get('tags', [])
    tags_str = ", ".join([f"#{t}" for t in tags]) if tags else "None"
    created = note.get('created_at', datetime.now().strftime('%b %d, %Y'))
    sub_text = f"Tags: {tags_str}  |  Date: {created}  |  Digitized with NoteExtract AI"
    story.append(Paragraph(sub_text, subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#6366f1'), spaceAfter=16))

    # AI Insights (if available)
    if note.get('ai_insights'):
        insights_data = [[
            Paragraph(f"<b>AI Summary & Key Takeaways:</b><br/>{note['ai_insights']}", ai_style)
        ]]
        insights_table = Table(insights_data, colWidths=[520])
        insights_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f1f5f9')),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
            ('LINELEFT', (0, 0), (0, -1), 3, colors.HexColor('#6366f1')),
        ]))
        story.append(insights_table)
        story.append(Spacer(1, 14))

    # Note Content
    content_text = note.get('content') or note.get('extracted_text') or "No content."
    for line in content_text.split('\n'):
        line_clean = line.strip()
        if not line_clean:
            story.append(Spacer(1, 4))
            continue

        formatted_line = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', line_clean)
        formatted_line = re.sub(r'\*(.*?)\*', r'<i>\1</i>', formatted_line)

        if line_clean.startswith('#'):
            header_text = line_clean.lstrip('#').strip()
            story.append(Paragraph(f"<b>{header_text}</b>", ParagraphStyle(
                'SubHead',
                parent=body_style,
                fontName='Helvetica-Bold',
                fontSize=12,
                leading=16,
                spaceBefore=8,
                spaceAfter=4,
                textColor=colors.HexColor('#0f172a')
            )))
        elif line_clean.startswith('-') or line_clean.startswith('*') or line_clean.startswith('•'):
            bullet_text = line_clean.lstrip('-*• ').strip()
            story.append(Paragraph(f"&bull; {bullet_text}", ParagraphStyle('Bullet', parent=body_style, leftIndent=12)))
        else:
            story.append(Paragraph(formatted_line, body_style))

    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=0.75, color=colors.HexColor('#e2e8f0'), spaceAfter=8))
    story.append(Paragraph("NoteExtract AI &bull; Grounded Document Intelligence Platform", meta_style))

    doc.build(story)


def generate_single_note_markdown(note):
    """
    Generates a Markdown (.md) representation of a single note.
    """
    lines = []
    lines.append(f"# {note.get('title', 'Untitled Note')}\n")
    tags = note.get('tags', [])
    if tags:
        lines.append(f"**Tags:** {', '.join([f'#{t}' for t in tags])}  ")
    lines.append(f"**Created:** {note.get('created_at', '')}  \n")

    if note.get('ai_insights'):
        lines.append(f"> **AI Insights:** {note['ai_insights']}\n")

    lines.append("---\n")
    lines.append(note.get('content') or note.get('extracted_text') or "")
    lines.append("\n")
    return "\n".join(lines)

