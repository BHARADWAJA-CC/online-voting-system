from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

voted_users = set()
votes = {"Candidate A": 0, "Candidate B": 0}

@app.route("/vote", methods=["POST"])
def vote():
    user = request.json.get("user")
    candidate = request.json.get("candidate")

    if user in voted_users:
        return jsonify({"message": "User has already voted"}), 400

    voted_users.add(user)
    votes[candidate] += 1
    return jsonify({"message": "Vote recorded successfully"})

@app.route("/results", methods=["GET"])
def results():
    return jsonify(votes)

if __name__ == "__main__":
    app.run(debug=True)
