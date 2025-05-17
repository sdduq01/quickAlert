from google.cloud import bigquery
import functions_framework
from flask import jsonify, request, make_response

client = bigquery.Client()
PROJECT_ID = "kam-bi-451418"
DATASET = "QuickAlert"
TABLE_ID = f"{PROJECT_ID}.{DATASET}.SavedAlerts"

def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

@functions_framework.http
def management_alerts(request):
    # Manejar preflight OPTIONS
    if request.method == "OPTIONS":
        response = make_response()
        return add_cors_headers(response)

    user_email = request.args.get("user_email")
    if not user_email:
        response = jsonify({"error": "user_email is required"})
        return add_cors_headers(response), 400

    if request.method == "GET":
        query = f"SELECT * FROM `{TABLE_ID}` WHERE userEmail = @user_email"
        job = client.query(
            query,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("user_email", "STRING", user_email)
                ]
            )
        )
        results = [dict(row.items()) for row in job]
        response = jsonify(results)
        return add_cors_headers(response)

    elif request.method == "PUT":
        data = request.get_json()
        query = f"""
            UPDATE `{TABLE_ID}`
            SET campaign=@campaign, metric=@metric, target=@target,
                frequency=@frequency, whatsapp=@whatsapp, email=@alert_email,
                enable=@enable
            WHERE alertId=@alertId AND userEmail=@user_email
        """
        client.query(
            query,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("campaign", "STRING", data["campaign"]),
                    bigquery.ScalarQueryParameter("metric", "STRING", data["metric"]),
                    bigquery.ScalarQueryParameter("target", "STRING", data["target"]),
                    bigquery.ScalarQueryParameter("frequency", "STRING", data["frequency"]),
                    bigquery.ScalarQueryParameter("whatsapp", "STRING", data["whatsapp"]),
                    bigquery.ScalarQueryParameter("alert_email", "STRING", data["email"]),
                    bigquery.ScalarQueryParameter("enable", "BOOL", data["enable"]),
                    bigquery.ScalarQueryParameter("alertId", "STRING", data["alertId"]),
                    bigquery.ScalarQueryParameter("user_email", "STRING", user_email),
                ]
            )
        )
        response = jsonify({"message": "Alert updated successfully"})
        return add_cors_headers(response)

    elif request.method == "DELETE":
        data = request.get_json()
        query = f"DELETE FROM `{TABLE_ID}` WHERE alertId=@alertId AND userEmail=@user_email"
        client.query(
            query,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("alertId", "STRING", data["alertId"]),
                    bigquery.ScalarQueryParameter("user_email", "STRING", user_email),
                ]
            )
        )
        response = jsonify({"message": "Alert deleted successfully"})
        return add_cors_headers(response)

    response = jsonify({"error": "Unsupported method"})
    return add_cors_headers(response), 405
