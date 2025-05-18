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
    try:
        # Preflight
        if request.method == "OPTIONS":
            response = make_response('', 204)
            return add_cors_headers(response)

        user_email = request.args.get("user_email")
        if not user_email:
            return add_cors_headers(jsonify({"error": "user_email is required"})), 400

        # GET
        if request.method == "GET":
            query = f"SELECT * FROM `{TABLE_ID}` WHERE userEmail = @user_email"
            job = client.query(
                query,
                job_config=bigquery.QueryJobConfig(
                    query_parameters=[bigquery.ScalarQueryParameter("user_email", "STRING", user_email)]
                )
            )
            results = [dict(row.items()) for row in job]
            return add_cors_headers(jsonify(results))

        # PUT
        elif request.method == "PUT":
            data = request.get_json()
            if not data:
                return add_cors_headers(jsonify({"error": "JSON body is required"})), 400

            alert_id = data.get("alertId")
            if not alert_id:
                return add_cors_headers(jsonify({"error": "alertId is required"})), 400

            # Validación y construcción de query dinámica
            query = None
            query_params = []

            if all(k in data for k in ("campaign", "metric", "target", "frequency", "whatsapp", "email", "enabled")):
                query = f"""
                    UPDATE `{TABLE_ID}`
                    SET campaign=@campaign,
                        metric=@metric,
                        target=@target,
                        frequency=@frequency,
                        whatsapp=@whatsapp,
                        email=@alert_email,
                        enabled=@enabled
                    WHERE alertId=@alertId AND userEmail=@user_email
                """
                query_params = [
                    bigquery.ScalarQueryParameter("campaign", "STRING", data["campaign"]),
                    bigquery.ScalarQueryParameter("metric", "STRING", data["metric"]),
                    bigquery.ScalarQueryParameter("target", "STRING", str(data["target"])),
                    bigquery.ScalarQueryParameter("frequency", "STRING", data["frequency"]),
                    bigquery.ScalarQueryParameter("whatsapp", "STRING", data["whatsapp"]),
                    bigquery.ScalarQueryParameter("alert_email", "STRING", data["email"]),
                    bigquery.ScalarQueryParameter("enabled", "BOOL", data["enabled"]),
                    bigquery.ScalarQueryParameter("alertId", "STRING", alert_id),
                    bigquery.ScalarQueryParameter("user_email", "STRING", user_email),
                ]
            elif "enabled" in data:
                query = f"""
                    UPDATE `{TABLE_ID}`
                    SET enabled=@enabled
                    WHERE alertId=@alertId AND userEmail=@user_email
                """
                query_params = [
                    bigquery.ScalarQueryParameter("enabled", "BOOL", data["enabled"]),
                    bigquery.ScalarQueryParameter("alertId", "STRING", alert_id),
                    bigquery.ScalarQueryParameter("user_email", "STRING", user_email),
                ]
            else:
                return add_cors_headers(jsonify({"error": "No hay campos suficientes para actualizar"})), 400

            # Ejecutar la actualización
            client.query(query, job_config=bigquery.QueryJobConfig(query_parameters=query_params))
            return add_cors_headers(jsonify({"message": "Alerta actualizada correctamente"}))

        # DELETE
        elif request.method == "DELETE":
            data = request.get_json()
            alert_id = data.get("alertId")
            if not alert_id:
                return add_cors_headers(jsonify({"error": "alertId is required"})), 400

            query = f"DELETE FROM `{TABLE_ID}` WHERE alertId=@alertId AND userEmail=@user_email"
            query_params = [
                bigquery.ScalarQueryParameter("alertId", "STRING", alert_id),
                bigquery.ScalarQueryParameter("user_email", "STRING", user_email),
            ]
            client.query(query, job_config=bigquery.QueryJobConfig(query_parameters=query_params))
            return add_cors_headers(jsonify({"message": "Alerta eliminada correctamente"}))

        else:
            return add_cors_headers(jsonify({"error": f"Método {request.method} no soportado"})), 405

    except Exception as e:
        print("Error en management_alerts:", str(e))  # 👈 Para Cloud Logs
        return add_cors_headers(jsonify({"error": str(e)})), 500
