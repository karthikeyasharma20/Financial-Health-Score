import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from sqlalchemy.orm import Session

from app.services.score_calculator import calculate_user_metrics, get_or_calculate_score
from app.models import User, Recommendation

def generate_financial_pdf_report(db: Session, user_id: int) -> io.BytesIO:
    # 1. Fetch user data and metrics
    user = db.query(User).filter(User.id == user_id).first()
    score_record = get_or_calculate_score(db, user_id)
    metrics = calculate_user_metrics(db, user_id)
    recommendations = db.query(Recommendation).filter(
        Recommendation.user_id == user_id,
        Recommendation.resolved == False
    ).limit(5).all()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    story = []
    styles = getSampleStyleSheet()

    # 2. Design Custom Premium Styles (Deep Navy and Purple Palette)
    primary_color = colors.HexColor("#2E3192")
    secondary_color = colors.HexColor("#7F00FF")
    text_dark = colors.HexColor("#1A1A1A")
    light_bg = colors.HexColor("#F8F9FA")
    
    title_style = ParagraphStyle(
        name="DocTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=26,
        leading=30,
        textColor=primary_color,
        alignment=0, # Left-aligned
        spaceAfter=10
    )
    
    subtitle_style = ParagraphStyle(
        name="DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=12,
        leading=16,
        textColor=colors.gray,
        spaceAfter=25
    )

    h1_style = ParagraphStyle(
        name="Header1",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=secondary_color,
        spaceBefore=15,
        spaceAfter=10,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        name="BodyDark",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=text_dark,
        spaceAfter=8
    )

    rec_style = ParagraphStyle(
        name="RecommendationStyle",
        parent=styles["BodyText"],
        fontName="Helvetica-Oblique",
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#495057"),
        spaceAfter=6
    )

    # 3. Document Content Elements
    # Header Banner
    story.append(Paragraph("AI FINANCIAL HEALTH REPORT", title_style))
    story.append(Paragraph(f"Prepared for: <b>{user.full_name}</b> | Date: {datetime.utcnow().strftime('%B %d, %Y')}", subtitle_style))
    story.append(Spacer(1, 15))

    # Health Score Highlight Block
    score = score_record.score
    if score >= 800:
        rating = "Excellent"
        rating_color = colors.HexColor("#2E7D32") # Green
    elif score >= 700:
        rating = "Good"
        rating_color = colors.HexColor("#1565C0") # Blue
    elif score >= 550:
        rating = "Fair"
        rating_color = colors.HexColor("#EF6C00") # Orange
    else:
        rating = "Needs Attention"
        rating_color = colors.HexColor("#C62828") # Red

    score_html = f"""
    Your current Financial Health Score is: <b><font size="32" color="{secondary_color.hexval()}">{score}</font></b> / 1000<br/>
    Rating: <b><font color="{rating_color.hexval()}">{rating}</font></b>
    """
    
    score_p = Paragraph(score_html, ParagraphStyle(
        name="ScorePara", parent=body_style, fontSize=12, leading=18, spaceAfter=20
    ))
    
    # Put score in a styled callout box
    score_table = Table([[score_p]], colWidths=[doc.width])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), light_bg),
        ('PADDING', (0,0), (-1,-1), 15),
        ('BOX', (0,0), (-1,-1), 1.5, primary_color),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    
    story.append(score_table)
    story.append(Spacer(1, 20))

    # 4. Financial Metrics Table
    story.append(Paragraph("Key Financial Indicators", h1_style))
    
    data = [
        ["Indicator", "Your Metric", "Healthy Target Range", "Status"],
        ["Savings Rate", f"{metrics['savings_rate']*100:.1f}%", ">= 30.0%", "Healthy" if metrics['savings_rate'] >= 0.3 else "Needs Improvement"],
        ["Debt-to-Income", f"{metrics['debt_ratio']*100:.1f}%", "<= 20.0%", "Healthy" if metrics['debt_ratio'] <= 0.2 else "Needs Attention"],
        ["Credit Utilization", f"{metrics['credit_utilization']*100:.1f}%", "<= 30.0%", "Healthy" if metrics['credit_utilization'] <= 0.3 else "High Usage"],
        ["Investment Rate", f"{(metrics['investment_amount']/metrics['income'])*100:.1f}%" if metrics['income'] > 0 else "0.0%", ">= 20.0%", "Healthy" if (metrics['investment_amount']/metrics['income'] if metrics['income'] > 0 else 0) >= 0.2 else "Under-invested"],
        ["Emergency Fund", f"{metrics['emergency_fund_months']:.1f} months", "6.0 months", "Healthy" if metrics['emergency_fund_months'] >= 6 else "Insufficient"],
    ]

    metrics_table = Table(data, colWidths=[2.0*inch, 1.25*inch, 1.75*inch, 1.5*inch])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#FFFFFF")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#DEE2E6")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, light_bg]),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9.5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    
    story.append(metrics_table)
    story.append(Spacer(1, 20))

    # 5. Recommendations List
    story.append(Paragraph("AI-Powered Recommendations", h1_style))
    story.append(Paragraph("Based on your score, our machine learning engine suggests executing these immediate changes to optimize your budget and asset growth:", body_style))
    story.append(Spacer(1, 8))

    if recommendations:
        for idx, rec in enumerate(recommendations, 1):
            impact_tag = f"<b>[{rec.impact.upper()} IMPACT]</b>"
            impact_color = "#C62828" if rec.impact == "high" else ("#EF6C00" if rec.impact == "medium" else "#2E7D32")
            
            bullet_html = f"""
            {idx}. <font color="{impact_color}">{impact_tag}</font> {rec.recommendation_text}
            """
            story.append(Paragraph(bullet_html, rec_style))
            story.append(Spacer(1, 4))
    else:
        story.append(Paragraph("No recommendations found. Keep maintaining your outstanding financial habits!", body_style))

    # Footer/Disclaimers
    story.append(Spacer(1, 40))
    disclaimer_style = ParagraphStyle(
        name="Disclaimer",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8,
        leading=10,
        textColor=colors.gray,
        alignment=1 # Centered
    )
    story.append(Paragraph("Disclaimer: This report is generated by an automated AI model and does not constitute official financial advisory services. Please consult with a certified financial planner for high-risk assets planning.", disclaimer_style))

    # 6. Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer
