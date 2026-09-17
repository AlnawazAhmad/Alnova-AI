// ========================
// UTILITY
// ========================

function escapeHTML(str) {

    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ========================
// REGISTER
// ========================

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            alert(
                "Account created successfully! 🎉"
            );

            window.location.href =
                "login.html";
        }
    );
}


// ========================
// LOGIN
// ========================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            const email =
                document
                .getElementById("loginEmail")
                .value.trim();

            const password =
                document
                .getElementById("loginPassword")
                .value.trim();

            if (
                email !== "" &&
                password !== ""
            ) {

                alert(
                    "Login successful! 🚀"
                );

                window.location.href =
                    "dashboard.html";

            } else {

                alert(
                    "Please enter Email and Password ❌"
                );
            }
        }
    );
}


// ========================
// LOGOUT
// ========================

function logout() {

    alert(
        "You have been logged out."
    );

    window.location.href =
        "login.html";
}


// ========================
// HOME
// ========================

function startAlnova() {

    window.location.href =
        "login.html";
}


// ========================
// AI CHAT
// ========================

async function sendMessage() {

    const input =
        document.getElementById(
            "userMessage"
        );

    const chatMessages =
        document.getElementById(
            "chatMessages"
        );

    if (!input || !chatMessages)
        return;


    const message =
        input.value.trim();


    if (message === "") {

        alert(
            "Please type something!"
        );

        return;
    }


    const userMessageContainer =
        document.createElement("div");

    userMessageContainer.className =
        "user-message";

    userMessageContainer.textContent =
        message;

    chatMessages.appendChild(
        userMessageContainer
    );


    input.value = "";


    const aiMessageContainer =
        document.createElement("div");

    aiMessageContainer.className =
        "ai-message";

    aiMessageContainer.textContent =
        "🤖 Alnova AI is thinking...";

    chatMessages.appendChild(
        aiMessageContainer
    );


    chatMessages.scrollTop =
        chatMessages.scrollHeight;


    try {

        const response =
            await fetch(
                "http://127.0.0.1:5000/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: message
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                "Server error"
            );
        }


        const data =
            await response.json();


        aiMessageContainer.textContent =
            "🤖 Alnova AI: " +
            (
                data.reply ||
                "No response received."
            );


    } catch (error) {

        aiMessageContainer.textContent =
            "❌ Backend se connection nahi ho raha.";

        console.error(error);
    }


    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


// ========================
// AI NOTES
// ========================

async function generateNotes() {

    const topicInput =
        document.getElementById(
            "notesTopic"
        );

    const result =
        document.getElementById(
            "notesResult"
        );


    if (!topicInput || !result)
        return;


    const topic =
        topicInput.value.trim();


    if (topic === "") {

        alert(
            "Please enter a topic!"
        );

        return;
    }


    result.innerHTML = `
        <h2>
            🤖 Alnova AI is creating notes...
        </h2>

        <p>
            Please wait...
        </p>
    `;


    try {

        const response =
            await fetch(
                "http://127.0.0.1:5000/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        message:
                            `Create simple and easy study notes on ${topic}.

Include:

1. Definition
2. Introduction
3. Important Points
4. Features
5. Advantages
6. Applications
7. Short Conclusion

Use simple language suitable for a college student.`

                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                "Server error"
            );
        }


        const data =
            await response.json();


        result.innerHTML = `
            <h2>
                📚 Notes on
                ${escapeHTML(topic)}
            </h2>

            <p>
                ${escapeHTML(
                    data.reply ||
                    "No notes received."
                ).replace(
                    /\n/g,
                    "<br>"
                )}
            </p>
        `;


    } catch (error) {

        result.innerHTML = `
            <h2>❌ Error</h2>

            <p>
                Backend se connection nahi ho raha.
            </p>
        `;

        console.error(error);
    }
}


// ========================
// AI QUIZ
// ========================

// Quiz data store karne ke liye
let quizQuestions = [];


// Current question
let currentQuestion = 0;


// Student ka score
let quizScore = 0;


// ========================
// START QUIZ
// ========================

async function startQuiz() {

    const topicInput =
        document.getElementById(
            "quizTopic"
        );

    const countInput =
        document.getElementById(
            "quizCount"
        );

    const result =
        document.getElementById(
            "quizResult"
        );


    if (
        !topicInput ||
        !countInput ||
        !result
    ) return;


    const topic =
        topicInput.value.trim();


    const count =
        Number(countInput.value);


    if (topic === "") {

        alert(
            "Please enter a topic!"
        );

        return;
    }


    result.innerHTML = `
        <h2>
            🤖 Creating ${count} Questions...
        </h2>

        <p>
            Alnova AI is preparing your quiz.
            Please wait...
        </p>
    `;


    try {

        const response =
            await fetch(
                "http://127.0.0.1:5000/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        message:
                            `Create a multiple choice quiz on ${topic}.

Create exactly ${count} questions.

IMPORTANT:
Return ONLY valid JSON.
Do not use markdown.
Do not write anything before or after the JSON.

Use this exact format:

{
  "questions": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": 0
    }
  ]
}

The answer value must be:
0 for Option A
1 for Option B
2 for Option C
3 for Option D

Make questions suitable for a college student.
Make the questions different from each other.
Do not repeat questions.`

                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                "Server error"
            );
        }


        const data =
            await response.json();


        let aiText =
            data.reply || "";


        // Markdown JSON remove karna
        aiText =
            aiText
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();


        // JSON ke first { aur last } find karna
        const firstBrace =
            aiText.indexOf("{");

        const lastBrace =
            aiText.lastIndexOf("}");


        if (
            firstBrace !== -1 &&
            lastBrace !== -1
        ) {

            aiText =
                aiText.substring(
                    firstBrace,
                    lastBrace + 1
                );
        }


        const quizData =
            JSON.parse(aiText);


        if (
            !quizData.questions ||
            !Array.isArray(
                quizData.questions
            )
        ) {

            throw new Error(
                "Invalid quiz format"
            );
        }


        quizQuestions =
            quizData.questions;


        currentQuestion = 0;

        quizScore = 0;


        showQuestion();


    } catch (error) {

        result.innerHTML = `
            <h2>❌ Quiz Error</h2>

            <p>
                AI quiz generate nahi kar paaya.
            </p>

            <p>
                Please try again.
            </p>
        `;

        console.error(error);
    }
}


// ========================
// SHOW QUESTION
// ========================

function showQuestion() {

    const result =
        document.getElementById(
            "quizResult"
        );


    if (!result) return;


    if (
        currentQuestion >=
        quizQuestions.length
    ) {

        showQuizResult();

        return;
    }


    const question =
        quizQuestions[
            currentQuestion
        ];


    let optionsHTML = "";


    question.options.forEach(
        function(option, index) {

            optionsHTML += `
                <button
                    onclick="selectAnswer(${index})"
                    style="
                    display:block;
                    width:100%;
                    margin:10px 0;
                    padding:14px;
                    text-align:left;
                    background:white;
                    color:#111827;
                    border:1px solid #ccc;
                    border-radius:8px;
                    cursor:pointer;
                    "
                >
                    ${String.fromCharCode(
                        65 + index
                    )}.
                    ${escapeHTML(option)}
                </button>
            `;
        }
    );


    result.innerHTML = `

        <div>

            <h2>
                🧠 Question
                ${currentQuestion + 1}
                /
                ${quizQuestions.length}
            </h2>


            <h3>
                ${escapeHTML(
                    question.question
                )}
            </h3>


            <div>

                ${optionsHTML}

            </div>


            <p>
                🎯 Select your answer
            </p>

        </div>

    `;
}


// ========================
// SELECT ANSWER
// ========================

function selectAnswer(selectedAnswer) {

    const question =
        quizQuestions[
            currentQuestion
        ];


    // Correct answer check

    if (
        selectedAnswer ===
        Number(question.answer)
    ) {

        quizScore++;

        showAnswerMessage(
            true
        );

    } else {

        showAnswerMessage(
            false
        );
    }
}


// ========================
// ANSWER MESSAGE
// ========================

function showAnswerMessage(
    isCorrect
) {

    const result =
        document.getElementById(
            "quizResult"
        );


    const question =
        quizQuestions[
            currentQuestion
        ];


    let correctText =
        question.options[
            Number(question.answer)
        ];


    if (isCorrect) {

        result.innerHTML += `

            <div
                style="
                margin-top:20px;
                padding:15px;
                background:#e8f5e9;
                border-radius:8px;
                "
            >

                <h3>
                    ✅ Correct Answer!
                </h3>

                <button
                    onclick="nextQuestion()"
                    style="
                    padding:12px 20px;
                    border:none;
                    border-radius:8px;
                    background:#111827;
                    color:white;
                    cursor:pointer;
                    "
                >
                    Next Question →
                </button>

            </div>
        `;

    } else {

        result.innerHTML += `

            <div
                style="
                margin-top:20px;
                padding:15px;
                background:#ffebee;
                border-radius:8px;
                "
            >

                <h3>
                    ❌ Wrong Answer
                </h3>

                <p>
                    Correct Answer:
                    <b>
                        ${escapeHTML(
                            correctText
                        )}
                    </b>
                </p>


                <button
                    onclick="nextQuestion()"
                    style="
                    padding:12px 20px;
                    border:none;
                    border-radius:8px;
                    background:#111827;
                    color:white;
                    cursor:pointer;
                    "
                >
                    Next Question →
                </button>

            </div>
        `;
    }
}


// ========================
// NEXT QUESTION
// ========================

function nextQuestion() {

    currentQuestion++;

    showQuestion();
}


// ========================
// FINAL QUIZ RESULT
// ========================

function showQuizResult() {

    const result =
        document.getElementById(
            "quizResult"
        );


    const total =
        quizQuestions.length;


    const percentage =
        Math.round(
            (quizScore / total) * 100
        );


    let message = "";


    if (percentage >= 80) {

        message =
            "🔥 Excellent performance!";

    } else if (percentage >= 60) {

        message =
            "👏 Good job!";

    } else if (percentage >= 40) {

        message =
            "👍 Keep practicing!";

    } else {

        message =
            "📚 Keep studying and try again!";
    }


    result.innerHTML = `

        <div
            style="
            text-align:center;
            "
        >

            <h2>
                🎉 Quiz Completed!
            </h2>


            <h1>
                ${quizScore}
                /
                ${total}
            </h1>


            <h2>
                Score:
                ${percentage}%
            </h2>


            <h3>
                ${message}
            </h3>


            <button
                onclick="startQuiz()"
                style="
                padding:13px 22px;
                border:none;
                border-radius:8px;
                background:#111827;
                color:white;
                cursor:pointer;
                "
            >
                🔄 Try Again
            </button>

        </div>

    `;
}


// ========================
// STUDY PLANNER
// ========================

async function createPlanner() {

    const subjectInput =
        document.getElementById(
            "studySubject"
        );

    const hoursInput =
        document.getElementById(
            "studyHours"
        );

    const result =
        document.getElementById(
            "plannerResult"
        );


    if (
        !subjectInput ||
        !hoursInput ||
        !result
    ) return;


    const subject =
        subjectInput.value.trim();

    const hours =
        hoursInput.value.trim();


    if (
        subject === "" ||
        hours === ""
    ) {

        alert(
            "Please enter subject and study hours!"
        );

        return;
    }


    result.innerHTML = `
        <h2>
            🤖 Creating Study Plan...
        </h2>

        <p>
            Alnova AI is preparing your schedule...
        </p>
    `;


    try {

        const response =
            await fetch(
                "http://127.0.0.1:5000/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        message:
                            `Create a smart study plan for ${subject}.

The student can study ${hours} hours per day.

Include:
- Study time
- Practice time
- Revision time
- Short breaks
- Important tips

Use simple language.`

                    })
                }
            );


        const data =
            await response.json();


        result.innerHTML = `
            <h2>
                📅 Study Plan
            </h2>

            <p>
                <b>Subject:</b>
                ${escapeHTML(subject)}
            </p>

            <p>
                <b>Daily Hours:</b>
                ${escapeHTML(hours)}
            </p>

            <p>
                ${escapeHTML(
                    data.reply ||
                    "No study plan received."
                ).replace(
                    /\n/g,
                    "<br>"
                )}
            </p>
        `;


    } catch (error) {

        result.innerHTML = `
            <h2>❌ Error</h2>

            <p>
                Backend se connection nahi ho raha.
            </p>
        `;

        console.error(error);
    }
}


// ========================
// AI RESUME BUILDER
// ========================

async function createResume() {

    const nameInput =
        document.getElementById(
            "resumeName"
        );

    const courseInput =
        document.getElementById(
            "resumeCourse"
        );

    const skillsInput =
        document.getElementById(
            "resumeSkills"
        );

    const result =
        document.getElementById(
            "resumeResult"
        );


    if (
        !nameInput ||
        !courseInput ||
        !skillsInput ||
        !result
    ) return;


    const name =
        nameInput.value.trim();

    const course =
        courseInput.value.trim();

    const skills =
        skillsInput.value.trim();


    if (
        name === "" ||
        course === "" ||
        skills === ""
    ) {

        alert(
            "Please fill all details!"
        );

        return;
    }


    result.innerHTML = `
        <h2>
            🤖 Creating Resume...
        </h2>

        <p>
            Alnova AI is preparing your resume...
        </p>
    `;


    try {

        const response =
            await fetch(
                "http://127.0.0.1:5000/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        message:
                            `Create a professional resume for a college student.

Name: ${name}

Course/Degree: ${course}

Skills: ${skills}

Include:

1. Career Objective
2. Education
3. Technical Skills
4. Soft Skills
5. Projects
6. Strengths
7. Career Goal

Keep it professional and simple.`

                    })
                }
            );


        const data =
            await response.json();


        result.innerHTML = `
            <h2>
                📄 ${escapeHTML(name)}
            </h2>

            <p>
                ${escapeHTML(
                    data.reply ||
                    "No resume received."
                ).replace(
                    /\n/g,
                    "<br>"
                )}
            </p>
        `;


    } catch (error) {

        result.innerHTML = `
            <h2>❌ Error</h2>

            <p>
                Backend se connection nahi ho raha.
            </p>
        `;

        console.error(error);
    }
}


// ========================
// AI INTERVIEW
// ========================

async function startInterview() {

    const roleInput =
        document.getElementById(
            "interviewRole"
        );

    const result =
        document.getElementById(
            "interviewResult"
        );


    if (!roleInput || !result)
        return;


    const role =
        roleInput.value.trim();


    if (role === "") {

        alert(
            "Please enter a job role!"
        );

        return;
    }


    result.innerHTML = `
        <h2>
            🤖 Starting Interview...
        </h2>

        <p>
            Alnova AI is preparing interview questions...
        </p>
    `;


    try {

        const response =
            await fetch(
                "http://127.0.0.1:5000/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        message:
                            `Act as an interviewer for the job role of ${role}.

Create 5 interview questions.

Include:
1. Basic introduction question
2. Technical question
3. Practical question
4. Situation-based question
5. HR question

Use simple language.`

                    })
                }
            );


        const data =
            await response.json();


        result.innerHTML = `
            <h2>
                🎤 ${escapeHTML(role)}
                Interview
            </h2>

            <p>
                ${escapeHTML(
                    data.reply ||
                    "No interview questions received."
                ).replace(
                    /\n/g,
                    "<br>"
                )}
            </p>
        `;


    } catch (error) {

        result.innerHTML = `
            <h2>❌ Error</h2>

            <p>
                Backend se connection nahi ho raha.
            </p>
        `;

        console.error(error);
    }
}