from flask import Flask, request, jsonify, Response
from flask_cors import CORS

import requests
import os

from database import get_connection, create_users_table


app = Flask(__name__)
CORS(app)


# =========================
# DATABASE
# =========================

create_users_table()


# =========================
# GEMINI CONFIG
# =========================

GEMINI_API_KEY = (
    os.getenv("GEMINI_API_KEY_3")
    or os.getenv("Gemini_API_Key_3")
)

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/"
    "v1beta/models/gemini-2.5-flash:generateContent"
)


# =========================
# HOME API
# =========================

@app.route("/")
def home():

    return jsonify({
        "success": True,
        "message": "Alnova AI Backend is Live! 🤖🚀"
    })


# =========================
# TEST API
# =========================

@app.route("/api/test")
def test():

    return jsonify({
        "success": True,
        "message": "Alnova AI Backend is Working! 🤖🚀"
    })


# =========================
# REGISTER API
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
# LOGIN API
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
# GEMINI AI FUNCTION
# =========================

def ask_gemini(prompt):

    if not GEMINI_API_KEY:

        raise Exception("GEMINI_API_KEY_3 is not configured.")


    response = requests.post(

        GEMINI_URL,

        params={
            "key": GEMINI_API_KEY
        },

        json={
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ]
        },

        timeout=180
    )

    response.raise_for_status()

    data = response.json()

    candidates = data.get("candidates", [])

    if not candidates:

        raise Exception("Gemini returned no response.")

    parts = candidates[0].get("content", {}).get("parts", [])

    text = ""

    for part in parts:

        text += part.get("text", "")

    return text.strip()


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
            "success": False,
            "reply": "Please enter a message."
        }), 400

    try:

        prompt = f"""
You are Alnova AI, a helpful AI assistant.

User message:
{user_message}

Answer clearly and helpfully.
"""

        answer = ask_gemini(prompt)

        return jsonify({
            "success": True,
            "reply": answer
        })

    except requests.exceptions.Timeout:

        return jsonify({
            "success": False,
            "reply": "AI response lene mein zyada time lag raha hai."
        }), 500

    except requests.exceptions.RequestException as error:

        print("Gemini Error:", error)

        return jsonify({
            "success": False,
            "reply": "Gemini se connection nahi ho raha."
        }), 500

    except Exception as error:

        print("Chat Error:", error)

        return jsonify({
            "success": False,
            "reply": "Backend mein error aa gaya."
        }), 500


# =========================
# AI RESUME BUILDER
# =========================

@app.route("/api/resume", methods=["POST"])
def create_resume():

    data = request.get_json(silent=True) or {}

    print("Resume Data Received:", data)


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
You are a professional resume writer.

Create a professional fresher resume for this student.

Name: {name}
Mobile: {phone}
Email: {email}
Course/Degree: {course}
Skills: {skills}
Education: {education}
Projects: {projects}

Create these sections:

CAREER OBJECTIVE
Write a short professional objective for a fresher.

EDUCATION
Write the education information professionally.

SKILLS
List the given skills clearly.

PROJECTS
Write the given projects professionally.

STRENGTHS
Give 4 simple professional strengths.

IMPORTANT:
- Do not create fake companies.
- Do not create fake work experience.
- Do not create fake achievements.
- Keep the language professional.
- This is a fresher/student resume.
- Keep the content easy to understand.

Return only the resume content.
"""


    try:

        resume_text = ask_gemini(prompt)


        if not resume_text:

            return jsonify({
                "success": False,
                "message": "AI did not return resume content."
            }), 500


        return jsonify({

            "success": True,

            "message": "Resume generated successfully! 🎉",

            "resume": resume_text,

            "contact": {
                "name": name,
                "phone": phone,
                "email": email,
                "course": course
            }

        })


    except requests.exceptions.Timeout:

        return jsonify({

            "success": False,

            "message":
            "AI response lene mein zyada time lag raha hai."

        }), 500


    except requests.exceptions.RequestException as error:

        print("Resume Gemini Error:", error)

        return jsonify({

            "success": False,

            "message":
            "Gemini se connection nahi ho raha."

        }), 500


    except Exception as error:

        print("Resume Error:", error)

        return jsonify({

            "success": False,

            "message":
            "Resume generate karte time error aa gaya."

        }), 500


# =========================
# START SERVER
# =========================

if __name__ == "__main__":

    port = int(os.getenv("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )
