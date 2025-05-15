import functions_framework
from google.cloud import bigquery
from flask import jsonify, request

client = bigquery.Client()

@functions_framework.http
def get_metrics(request):
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)

    headers = {
        'Access-Control-Allow-Origin': '*'
    }

    campaign = request.args.get('campaign')
    if not campaign:
        return jsonify({"error": "Missing campaign parameter"}), 400, headers

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

    try:
        query_job = client.query(query, job_config=job_config)
        results = query_job.result()
        metrics = [row["metric"] for row in results]
        return jsonify({"metrics": metrics}), 200, headers
    except Exception as e:
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500, headers
