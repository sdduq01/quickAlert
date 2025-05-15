import functions_framework
from google.cloud import bigquery
from flask import jsonify, make_response, request

# Initialize BigQuery client
db_client = bigquery.Client()

@functions_framework.http
def save_alert(request):
    """
    HTTP Cloud Function to save an alert into BigQuery table SavedAlerts.
    Expects JSON body with fields:
      alertId, userEmail, campaign, metric, target,
      frequency, whatsapp, email, enable (bool)
    """
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        resp = make_response('', 204)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Methods'] = 'POST,OPTIONS'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return resp

    data = request.get_json(silent=True)
    if not data:
        return make_response('Bad Request: JSON body required', 400)

    required_fields = [
        'alertId', 'userEmail', 'campaign', 'metric',
        'target', 'frequency', 'whatsapp', 'email', 'enable'
    ]

    missing = [f for f in required_fields if f not in data]
    if missing:
        return make_response(f"Bad Request: Missing fields {missing}", 400)

    # Prepare row for insertion
    table_id = 'kam-bi-451418.QuickAlert.SavedAlerts'
    row = {
        'alertId':   data['alertId'],
        'userEmail': data['userEmail'],
        'campaign':  data['campaign'],
        'metric':    data['metric'],
        'target':    data['target'],
        'frequency': data['frequency'],
        'whatsapp':  data['whatsapp'],
        'email':     data['email'],
        'enable':    data['enable']
    }

    # Insert row into BigQuery
    errors = db_client.insert_rows_json(table_id, [row])  # API: list of rows
    if errors:
        # Return errors if insertion failed
        return make_response(f"Error inserting into BigQuery: {errors}", 500)

    # Success response with CORS
    resp = make_response(jsonify({'status': 'success', 'alertId': data['alertId']}), 200)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp