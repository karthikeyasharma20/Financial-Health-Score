import csv
import io
from typing import List
from app.models import Transaction

def generate_transactions_csv(transactions: List[Transaction]) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write CSV Header
    writer.writerow(["Transaction ID", "Date", "Amount", "Type", "Category", "Description"])
    
    # Write Row Data
    for tx in transactions:
        writer.writerow([
            tx.id,
            tx.date.strftime("%Y-%m-%d %H:%M:%S") if tx.date else "",
            f"{tx.amount:.2f}",
            tx.type,
            tx.category,
            tx.description or ""
        ])
        
    return output.getvalue()
