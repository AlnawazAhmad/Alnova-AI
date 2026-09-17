// ==========================================
// ALNOVA AI - MAIN JAVASCRIPT
// ==========================================

const API_URL = "http://127.0.0.1:5000";


// ==========================================
// START ALNOVA
// ==========================================

function startAlnova() {

    window.location.href = "register.html";

}


// ==========================================
// REGISTER
// ==========================================

const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const name =
                document.getElementById(
                    "registerName"
                ).value.trim();

            const email =
                document.getElementById(
                    "registerEmail"
                ).value.trim();

            const password =
                document.getElementById(
                    "registerPassword"
                ).value;

            const confirmPassword =
                document.getElementById(
                    "confirmPassword"
                ).value;


            if (!name || !email || !password || !confirmPassword) {

                alert("Please fill all fields. ❌");

                return;
            }


            if (password !== confirmPassword) {

                alert("Passwords do not match. ❌");

                return;
            }


            if (password.length < 6) {

                alert(
                    "Password must be at least 6 characters."
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        API_URL + "/api/register",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                name: name,
                                email: email,
                                password: password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (data.success) {

                    alert(
                        "Account created successfully! 🎉"
                    );

                    window.location.href =
                        "login.html";

                } else {

                    alert(
                        data.message ||
                        "Registration failed."
                    );
                }


            } catch (error) {

                console.error(error);

                alert(
                    "Backend is not running. ❌"
                );
            }

        }
    );

}


// ==========================================
// LOGIN
// ==========================================

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document.getElementById(
                    "loginEmail"
                ).value.trim();

            const password =
                document.getElementById(
                    "loginPassword"
                ).value;


            if (!email || !password) {

                alert(
                    "Please enter email and password."
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        API_URL + "/api/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email: email,
                                password: password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (data.success) {

                    // Save user information
                    localStorage.setItem(
                        "alnovaUser",
                        JSON.stringify(data.user)
                    );


                    alert(
                        "Login successful! 🚀"
                    );


                    window.location.href =
                        "dashboard.html";

                } else {

                    alert(
                        data.message ||
                        "Invalid email or password."
                    );
                }


            } catch (error) {

                console.error(error);

                alert(
                    "Backend is not running. ❌"
                );
            }

        }
    );

}


// ==========================================
// DASHBOARD USER NAME
// ==========================================

function showUserName() {

    const user =
        JSON.parse(
            localStorage.getItem(
                "alnovaUser"
            )
        );


    if (!user) {

        return;
    }


    const welcome =
        document.querySelector(
            ".dashboard h1"
        );


    if (welcome) {

        welcome.innerHTML =
            "Welcome, " +
            user.name +
            " 👋🚀";
    }

}


showUserName();


// ==========================================
// LOGOUT
// ==========================================

function logout() {

    localStorage.removeItem(
        "alnovaUser"
    );

    window.location.href =
        "login.html";

}


// ==========================================
// AI CHAT
// ==========================================

async function sendMessage() {

    const input =
        document.getElementById(
            "userMessage"
        );

    const messages =
        document.getElementById(
            "chatMessages"
        );


    if (!input || !messages) {

        return;
    }


    const message =
        input.value.trim();


    if (!message) {

        return;
    }


    // User message
    const userDiv =
        document.createElement("div");

    userDiv.className =
        "user-message";

    userDiv.innerText =
        message;

    messages.appendChild(
        userDiv
    );


    input.value = "";


    // AI message
    const aiDiv =
        document.createElement("div");

    aiDiv.className =
        "ai-message";

    aiDiv.innerText =
        "🤖 Thinking...";

    messages.appendChild(
        aiDiv
    );


    messages.scrollTop =
        messages.scrollHeight;


    try {

        const response =
            await fetch(
                API_URL + "/api/chat",
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
                "AI request failed"
            );
        }


        aiDiv.innerText = "";


        const reader =
            response.body.getReader();

        const decoder =
            new TextDecoder();


        while (true) {

            const {
                value,
                done
            } =
                await reader.read();


            if (done) {

                break;
            }


            const text =
                decoder.decode(
                    value,
                    {
                        stream: true
                    }
                );


            aiDiv.innerText +=
                text;


            messages.scrollTop =
                messages.scrollHeight;
        }


    } catch (error) {

        console.error(error);

        aiDiv.innerText =
            "❌ AI se connection nahi ho raha. Ollama aur Flask check karo.";
    }

}


// Enter key for chat
const userMessage =
    document.getElementById(
        "userMessage"
    );


if (userMessage) {

    userMessage.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                sendMessage();

            }

        }
    );

}


// ==========================================
// AI NOTES
// ==========================================

async function generateNotes() {

    const topicInput =
        document.getElementById(
            "notesTopic"
        );

    const result =
        document.getElementById(
            "notesResult"
        );


    if (!topicInput || !result) {

        return;
    }


    const topic =
        topicInput.value.trim();


    if (!topic) {

        alert(
            "Please enter a topic. ❌"
        );

        return;
    }


    result.innerHTML =
        "<h2>🤖 Generating Notes...</h2>" +
        "<p>Please wait...</p>";


    try {

        const response =
            await fetch(
                API_URL + "/api/notes",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        topic: topic
                    })
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message
            );
        }


        result.innerHTML =
            "<h2>📝 " +
            topic +
            "</h2>" +
            "<div style='white-space: pre-wrap;'>" +
            escapeHTML(data.notes) +
            "</div>";


    } catch (error) {

        console.error(error);

        result.innerHTML =
            "<h2>❌ Error</h2>" +
            "<p>Notes generate nahi ho paaye.</p>";
    }

}


// ==========================================
// DOWNLOAD NOTES
// ==========================================

function downloadNotes() {

    const result =
        document.getElementById(
            "notesResult"
        );


    if (!result) {

        return;
    }


    const notes =
        result.innerText;


    if (
        notes.trim() === "" ||
        notes.includes(
            "Enter a topic"
        ) ||
        notes.includes(
            "Generating Notes"
        )
    ) {

        alert(
            "Please generate notes first! ❌"
        );

        return;
    }


    const file =
        new Blob(
            [notes],
            {
                type: "text/plain"
            }
        );


    const link =
        document.createElement("a");


    link.href =
        URL.createObjectURL(file);


    link.download =
        "Alnova-AI-Notes.txt";


    link.click();


    URL.revokeObjectURL(
        link.href
    );

}


// ==========================================
// AI QUIZ
// ==========================================

let currentQuiz = [];

let currentQuestion = 0;

let quizScore = 0;


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


    if (!topicInput || !countInput || !result) {

        return;
    }


    const topic =
        topicInput.value.trim();

    const count =
        parseInt(
            countInput.value
        );


    if (!topic) {

        alert(
            "Please enter quiz topic. ❌"
        );

        return;
    }


    if (!count || count < 1) {

        alert(
            "Please enter number of questions. ❌"
        );

        return;
    }


    result.innerHTML =
        "<h2>🧠 Creating Quiz...</h2>" +
        "<p>AI is preparing questions...</p>";


    try {

        const response =
            await fetch(
                API_URL + "/api/quiz",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        topic: topic,
                        count: count
                    })
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message
            );
        }


        currentQuiz =
            data.questions;

        currentQuestion = 0;

        quizScore = 0;


        showQuizQuestion();


    } catch (error) {

        console.error(error);

        result.innerHTML =
            "<h2>❌ Quiz Error</h2>" +
            "<p>Quiz generate nahi ho paaya. Please try again.</p>";
    }

}


// ==========================================
// SHOW QUIZ QUESTION
// ==========================================

function showQuizQuestion() {

    const result =
        document.getElementById(
            "quizResult"
        );


    if (!result) {

        return;
    }


    if (
        currentQuestion >=
        currentQuiz.length
    ) {

        finishQuiz();

        return;
    }


    const question =
        currentQuiz[
            currentQuestion
        ];


    let html = "";


    html +=
        "<h2>🧠 Question " +
        (currentQuestion + 1) +
        " of " +
        currentQuiz.length +
        "</h2>";


    html +=
        "<h3>" +
        escapeHTML(
            question.question
        ) +
        "</h3>";


    html +=
        "<div style='margin-top:20px;'>";


    question.options.forEach(
        function (option, index) {

            html +=
                "<button " +
                "onclick='checkQuizAnswer(" +
                index +
                ")' " +
                "style='display:block;width:100%;margin:10px 0;text-align:left;'>" +
                String.fromCharCode(
                    65 + index
                ) +
                ". " +
                escapeHTML(
                    option
                ) +
                "</button>";

        }
    );


    html += "</div>";


    result.innerHTML =
        html;

}


// ==========================================
// CHECK QUIZ ANSWER
// ==========================================

function checkQuizAnswer(
    selected
) {

    const question =
        currentQuiz[
            currentQuestion
        ];


    if (
        selected ===
        question.answer
    ) {

        quizScore++;

        alert(
            "Correct! ✅"
        );

    } else {

        const correctOption =
            question.options[
                question.answer
            ];


        alert(
            "Wrong ❌\nCorrect answer: " +
            correctOption
        );
    }


    currentQuestion++;


    showQuizQuestion();

}


// ==========================================
// FINISH QUIZ
// ==========================================

function finishQuiz() {

    const result =
        document.getElementById(
            "quizResult"
        );


    const total =
        currentQuiz.length;


    const percentage =
        total > 0
            ? Math.round(
                (quizScore / total) * 100
            )
            : 0;


    result.innerHTML =
        "<h2>🎉 Quiz Completed!</h2>" +

        "<h3>Your Score: " +
        quizScore +
        " / " +
        total +
        "</h3>" +

        "<p>Percentage: " +
        percentage +
        "%</p>" +

        "<button onclick='startQuiz()'>" +
        "🔄 Try Again" +
        "</button>";
}


// ==========================================
// STUDY PLANNER
// ==========================================

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


    if (!subjectInput || !hoursInput || !result) {

        return;
    }


    const subject =
        subjectInput.value.trim();

    const hours =
        hoursInput.value;


    if (!subject || !hours) {

        alert(
            "Please enter subject and study hours. ❌"
        );

        return;
    }


    result.innerHTML =
        "<h2>📅 Creating Study Plan...</h2>" +
        "<p>Please wait...</p>";


    try {

        const response =
            await fetch(
                API_URL + "/api/planner",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        subject: subject,
                        hours: hours
                    })
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message
            );
        }


        result.innerHTML =
            "<h2>📅 " +
            subject +
            " Study Plan</h2>" +

            "<div style='white-space:pre-wrap;'>" +
            escapeHTML(data.plan) +
            "</div>";


    } catch (error) {

        console.error(error);

        result.innerHTML =
            "<h2>❌ Error</h2>" +
            "<p>Study plan generate nahi ho paaya.</p>";
    }

}


// ==========================================
// AI RESUME
// ==========================================

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
    ) {

        return;
    }


    const name =
        nameInput.value.trim();

    const course =
        courseInput.value.trim();

    const skills =
        skillsInput.value.trim();


    if (!name || !course || !skills) {

        alert(
            "Please fill all resume details. ❌"
        );

        return;
    }


    result.innerHTML =
        "<h2>📄 Creating Resume...</h2>" +
        "<p>AI is preparing your resume...</p>";


    try {

        const response =
            await fetch(
                API_URL + "/api/resume",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        course: course,
                        skills: skills
                    })
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message
            );
        }


        result.innerHTML =
            "<h2>📄 Your AI Resume</h2>" +

            "<div style='white-space:pre-wrap;'>" +
            escapeHTML(data.resume) +
            "</div>" +

            "<button onclick='downloadResume()'>" +
            "📥 Download Resume" +
            "</button>";


    } catch (error) {

        console.error(error);

        result.innerHTML =
            "<h2>❌ Error</h2>" +
            "<p>Resume generate nahi ho paaya.</p>";
    }

}


// ==========================================
// DOWNLOAD RESUME
// ==========================================

function downloadResume() {

    const result =
        document.getElementById(
            "resumeResult"
        );


    if (!result) {

        return;
    }


    const resume =
        result.innerText;


    if (
        !resume ||
        resume.includes(
            "Fill the details"
        ) ||
        resume.includes(
            "Creating Resume"
        )
    ) {

        alert(
            "Please generate resume first."
        );

        return;
    }


    const file =
        new Blob(
            [resume],
            {
                type: "text/plain"
            }
        );


    const link =
        document.createElement("a");


    link.href =
        URL.createObjectURL(file);


    link.download =
        "Alnova-AI-Resume.txt";


    link.click();


    URL.revokeObjectURL(
        link.href
    );

}


// ==========================================
// AI INTERVIEW
// ==========================================

async function startInterview() {

    const roleInput =
        document.getElementById(
            "interviewRole"
        );

    const result =
        document.getElementById(
            "interviewResult"
        );


    if (!roleInput || !result) {

        return;
    }


    const role =
        roleInput.value.trim();


    if (!role) {

        alert(
            "Please enter job role. ❌"
        );

        return;
    }


    result.innerHTML =
        "<h2>🎤 Starting Interview...</h2>" +
        "<p>AI interviewer is preparing a question...</p>";


    try {

        const response =
            await fetch(
                API_URL + "/api/interview",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        role: role
                    })
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message
            );
        }


        result.innerHTML =
            "<h2>🎤 Interview Question</h2>" +

            "<p>" +
            escapeHTML(
                data.question
            ) +
            "</p>" +

            "<textarea id='interviewAnswer' " +
            "placeholder='Write your answer here...' " +
            "style='width:100%;height:150px;padding:12px;margin-top:15px;'>" +
            "</textarea>" +

            "<br>" +

            "<button onclick='submitInterviewAnswer()'>" +
            "Submit Answer 🚀" +
            "</button>";


        // Save role
        sessionStorage.setItem(
            "interviewRole",
            role
        );


    } catch (error) {

        console.error(error);

        result.innerHTML =
            "<h2>❌ Error</h2>" +
            "<p>Interview start nahi ho paaya.</p>";
    }

}


// ==========================================
// SUBMIT INTERVIEW ANSWER
// ==========================================

async function submitInterviewAnswer() {

    const answerInput =
        document.getElementById(
            "interviewAnswer"
        );

    const result =
        document.getElementById(
            "interviewResult"
        );


    if (!answerInput || !result) {

        return;
    }


    const answer =
        answerInput.value.trim();


    const role =
        sessionStorage.getItem(
            "interviewRole"
        );


    if (!answer) {

        alert(
            "Please write your answer first. ❌"
        );

        return;
    }


    result.innerHTML =
        "<h2>🤖 Evaluating Answer...</h2>" +
        "<p>Please wait...</p>";


    try {

        const response =
            await fetch(
                API_URL + "/api/interview",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        role: role,
                        answer: answer
                    })
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message
            );
        }


        result.innerHTML =
            "<h2>📊 Interview Feedback</h2>" +

            "<div style='white-space:pre-wrap;'>" +
            escapeHTML(
                data.feedback
            ) +
            "</div>" +

            "<button onclick='startInterview()'>" +
            "🔄 Next Interview Question" +
            "</button>";


    } catch (error) {

        console.error(error);

        result.innerHTML =
            "<h2>❌ Error</h2>" +
            "<p>Feedback generate nahi ho paaya.</p>";
    }

}


// ==========================================
// HTML SECURITY HELPER
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;
}