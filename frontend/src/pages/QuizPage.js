import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Chatbot from "../Components/Chatbot";
import "./css/QuizPage.css";
const API = process.env.REACT_APP_BACKEND_URL;

const QuizPage = () => {
  const { subject } = useParams();
  const storedUser = localStorage.getItem("user");
  const email = storedUser ? JSON.parse(storedUser).email : null;


  const [questionData, setQuestionData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [correct, setCorrect] = useState(null);
  const [loading, setLoading] = useState(false);
  const [solving, setSolving] = useState(false);
  const [solution, setSolution] = useState(null);
  const [difficulty, setDifficulty] = useState(1);
  const [theme, setTheme] = useState("");

  const subjectName = subject
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const chapter = subject.toLowerCase().replaceAll("-", "");

  const didFetch = React.useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchQuestion();
  }, []);


  const fetchQuestion = async () => {
    setLoading(true);
    setQuestionData(null);

    setSelected(null);
    setCorrect(null);
    setTheme("");

    try {
      const res = await fetch(`${API}/api/get-question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, chapter }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        setLoading(false);
        return;
      }

      setQuestionData(data);
      setDifficulty(data.difficulty_used);
    } catch (err) {
      console.error("Fetch failed:", err);
      alert("Backend not reachable");
    }

    setLoading(false);
  };

  const submitAnswer = async (option) => {
    if (selected !== null) return;

    setSelected(option);
    const isCorrect = option === questionData.correct_answer;
    setCorrect(isCorrect);
    setTheme(isCorrect ? "correct" : "wrong");

    await fetch(`${API}/api/submit-answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        chapter,
        correct: isCorrect,
        difficulty,
      }),
    });
  };

  const solveQuestion = async () => {
    if (solving) return;

    setSolving(true);
    setSolution(null);

    try {
      const res = await fetch(`${API}/api/solve-question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chapter,
          question: questionData.question,
        }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        setSolving(false);
        return;
      }

      setSolution(data);

    } catch (err) {
      console.error(err);
      alert("Failed to get solution");
    }

    setSolving(false);
  };


  return (
    <div className={`quiz-page ${theme}`}>
      <Navbar />

      <div className="quiz-content">
        <h1>{subjectName} Quiz</h1>

        {loading && <p>Loading question...</p>}

        {questionData && (
          <div className="quiz-box">
            <h3>{questionData.question}</h3>

            {questionData.options.map((opt, idx) => (
              <button
                key={idx}
                className={`option-btn ${selected === opt
                  ? opt === questionData.correct_answer
                    ? "correct"
                    : "wrong"
                  : selected && !correct && opt === questionData.correct_answer
                    ? "correct"
                    : ""
                  }`}
                onClick={() => submitAnswer(opt)}
              >
                {opt}
              </button>

            ))}

            {selected && correct && (
              <div className="correct-box">
                🎉 Correct Answer!
                <button onClick={fetchQuestion}>Next Question</button>
              </div>
            )}

            {selected && !correct && (
              <div className="wrong-box">
                ❌ Wrong Answer
                <h4>Explanation:</h4>
                {questionData.explanations.map((exp, i) => (
                  <p key={i}>{exp}</p>
                ))}
                <button onClick={solveQuestion} disabled={solving}>
                  {solving ? "Solving..." : "Solve"}
                </button>
                <button onClick={fetchQuestion}>Next Question</button>
                {solving && (
                  <div className="solve-loading">
                    Solving step-by-step...
                  </div>
                )}

                {solution && (
                  <div className="answer-box">
                    <h4>Answer</h4>

                    {solution.given && (
                      <p><b>Given:</b> {solution.given}</p>
                    )}

                    {solution.to_find && (
                      <p><b>To Find:</b> {solution.to_find}</p>
                    )}

                    {Array.isArray(solution.solution) &&
                      solution.solution.map((step, i) => (
                        <p key={i}>{step}</p>
                      ))
                    }

                    {solution.final_answer && (
                      <p><b>Final Answer:</b> {solution.final_answer}</p>
                    )}
                  </div>
                )}

              </div>
            )}
          </div>
        )}
      </div>

      <Chatbot />
    </div>
  );
};

export default QuizPage;
