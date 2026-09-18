from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

from database import get_connection, create_users_table

app = Flask(__name__)
CORS(app)

create_users_table()


# =========================
# GEMINI AI
# =========================

def ask_gemini(prompt):

    api_key = os.environ.get("GEMINI_API_KEY_3")

    if not api_key:
        raise Exception("GEMINI_API_KEY_3 not found")

    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": api_key
    }

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    }

    response = requests.post(
        url,
        headers=headers,
        json=payload,
        timeout=120
    )

    response.raise_for_status()

    result = response.json()

    return result["candidates"][0]["content"]["parts"][0]["text"]


# =========================
# TEST
# =========================

@app.route("/api/test")
def test():

    return jsonify({
        "success": True,
        "message": "Alnova AI Backend is Working! 🤖🚀"
    })


# =========================
# REGISTER
# =========================

@app.route("/api/register", methods=["POST"])
def register():

    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip()
    password = str(data.get("password", ""))

    if not name or not email or not password:

        return jsonify({
            "success": False,
            "message": "Please fill all fields."
        }), 400

    try:

        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            "SELECT id FROM users WHERE email = ?",
            (email,)
        )

        existing_user = cursor.fetchone()

        if existing_user:

            connection.close()

            return jsonify({
                "success": False,
                "message": "Email already registered."
            }), 409

        cursor.execute(
            """
            INSERT INTO users
            (name, email, password)
            VALUES (?, ?, ?)
            """,
            (name, email, password)
        )

        connection.commit()
        connection.close()

        return jsonify({
            "success": True,
            "message": "Account created successfully! 🎉"
        })

    except Exception as error:

        print("Register Error:", error)

        return jsonify({
            "success": False,
            "message": "Registration failed."
        }), 500


# =========================
# LOGIN
# =========================

@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json(silent=True) or {}

    email = str(data.get("email", "")).strip()
    password = str(data.get("password", ""))

    if not email or not password:

        return jsonify({
            "success": False,
            "message": "Please enter email and password."
        }), 400

    try:

        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT id, name, email
            FROM users
            WHERE email = ? AND password = ?
            """,
            (email, password)
        )

        user = cursor.fetchone()

        connection.close()

        if user:

            return jsonify({
                "success": True,
                "message": "Login successful! 🚀",
                "user": {
                    "id": user["id"],
                    "name": user["name"],
                    "email": user["email"]
                }
            })

        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 401

    except Exception as error:

        print("Login Error:", error)

        return jsonify({
            "success": False,
            "message": "Login failed."
        }), 500


# =========================
# AI CHAT
# =========================

@app.route("/api/chat", methods=["POST"])
def chat():

    data = request.get_json(silent=True) or {}

    user_message = str(
        data.get("message", "")
    ).strip()

    if not user_message:

        return jsonify({
            "reply": "Please enter a message."
        })

    try:

        reply = ask_gemini(user_message)

        return jsonify({
            "reply": reply
        })

    except Exception as error:

        print("Gemini Chat Error:", error)

        return jsonify({
            "reply": "Gemini AI se connection nahi ho raha."
        }), 500


# =========================
# RESUME BUILDER
# =========================

@app.route("/api/resume", methods=["POST"])
def create_resume():

    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()
    phone = str(data.get("phone", "")).strip()
    email = str(data.get("email", "")).strip()
    course = str(data.get("course", "")).strip()
    skills = str(data.get("skills", "")).strip()
    education = str(data.get("education", "")).strip()
    projects = str(data.get("projects", "")).strip()

    if not name:

        return jsonify({
            "success": False,
            "message": "Please enter your name."
        }), 400

    if not course:

        return jsonify({
            "success": False,
            "message": "Please enter your course or degree."
        }), 400

    if not skills:

        return jsonify({
            "success": False,
            "message": "Please enter your skills."
        }), 400

    prompt = f"""
Create a professional fresher resume.

Name: {name}
Mobile: {phone}
Email: {email}
Course/Degree: {course}
Skills: {skills}
Education: {education}
Projects: {projects}

Create these sections:

CAREER OBJECTIVE
EDUCATION
SKILLS
PROJECTS
STRENGTHS

Rules:
- Do not create fake companies.
- Do not create fake work experience.
- Do not create fake achievements.
- Use only the information provided.
- Keep the language professional.
- This is a fresher/student resume.

Return only the resume content.
"""

    try:

        resume_text = ask_gemini(prompt)

        return jsonify({

            "success": True,

            "message": "Resume generated successfully! 🎉",

            "resume": resume_text,

            "contact": {
                "name": name,
                "phones
