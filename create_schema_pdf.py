import pandas as pd
from reportlab.platypus import SimpleDocTemplate, Paragraph, PageBreak
from reportlab.lib.styles import getSampleStyleSheet

file_path = r"C:\Users\fdasb\Downloads\UNICEF SUSI BATCH1_08072026_PMT\NASSCO Multi-Dimensional Poverty.dta"

df = pd.read_stata(file_path)

pdf = SimpleDocTemplate("UNICEF_MDP_Schema.pdf")
styles = getSampleStyleSheet()

content = [Paragraph("NASSCO Multi-Dimensional Poverty Dataset Schema", styles["Title"])]

for col in df.columns:
    sample = (
        str(df[col].dropna().iloc[0])
        if not df[col].dropna().empty
        else "NULL"
    )

    content.append(
        Paragraph(
            f"<b>{col}</b><br/>"
            f"Type: {df[col].dtype}<br/>"
            f"Nulls: {df[col].isna().sum()}<br/>"
            f"Sample: {sample}",
            styles["BodyText"],
        )
    )

pdf.build(content)

print("UNICEF_MDP_Schema.pdf created")