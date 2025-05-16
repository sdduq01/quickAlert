import functions_framework
from flask import jsonify, request
from google.cloud import bigquery
from datetime import datetime
import os

@functions_framework.http
def save_alert(request):
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }

    if request.method == 'OPTIONS':
        return '', 204, headers

    try:
        data = request.get_json()

        client = bigquery.Client()
        table_id = "kam-bi-451418.QuickAlert.SavedAlerts"

        row_to_insert = {
            "alertId": data.get("alertId", ""),
            "userEmail": data.get("userEmail", ""),
            "campaign": data.get("campaign", ""),
            "metric": data.get("metric", ""),
            "target": data.get("target", ""),
            "frequency": data.get("frequency", ""),
            "whatsapp": data.get("whatsapp", None),
            "email": data.get("email", ""),
            "enabled": data.get("enable", True),
            "creationTimestamp": datetime.utcnow().isoformat()
        }

        errors = client.insert_rows_json(table_id, [row_to_insert])

        if errors == []:
            return jsonify({"status": "success"}), 200, headers
        else:
            return jsonify({"status": "error", "details": errors}), 500, headers

    except Exception as e:
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500, headers
