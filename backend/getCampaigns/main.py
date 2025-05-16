import functions_framework
from google.cloud import bigquery
from flask import jsonify, make_response, request

client = bigquery.Client()

@functions_framework.http
def get_campaigns(request):

    if request.method == 'OPTIONS':
        resp = make_response('', 204)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Methods'] = 'GET,OPTIONS'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return resp

    query = """
    SELECT DISTINCT Campana AS campaign
    FROM `kam-bi-451418.QuickAlert.LoadKpis`
    ORDER BY campaign
    """
    result = client.query(query)
    campaigns = [row["campaign"] for row in result]

    resp = make_response(jsonify({"campaigns": campaigns}), 200)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp
