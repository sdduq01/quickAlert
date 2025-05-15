import functions_framework
from google.cloud import bigquery
from flask import jsonify, make_response, request

client = bigquery.Client()

@functions_framework.http
def get_metrics(request):
    # Preflight CORS
    if request.method == 'OPTIONS':
        resp = make_response('', 204)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Methods'] = 'POST,OPTIONS'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return resp

    # Body JSON
    request_json = request.get_json(silent=True) or {}
    campaign = request_json.get("campaign")
    if not campaign:
        return ("Bad Request: 'campaign' parameter is required", 400)

    # Query parametrizado
    query = """
    SELECT DISTINCT Metrica AS metric
    FROM `kam-bi-451418.QuickAlert.LoadKpis`
    WHERE Campana = @campaign
    ORDER BY metric
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("campaign", "STRING", campaign)
        ]
    )
    result = client.query(query, job_config=job_config)
    metrics = [row["metric"] for row in result]

    # Respuesta con CORS
    resp = make_response(jsonify(metrics), 200)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp
