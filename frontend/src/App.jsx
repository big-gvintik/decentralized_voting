import React, { useState, useEffect } from 'react';
import { backend } from "declarations/backend";

export default function VotingApp() {
  const [polls, setPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [voteResult, setVoteResult] = useState("");
  const [question, setQuestion] = useState("");
  const [optionsText, setOptionsText] = useState("");

  useEffect(() => {
    loadPolls();
  }, []);

  async function loadPolls() {
    try {
      const data = await backend.getAllPolls();
      setPolls(data);
    } catch (err) {
      console.error("Error loading surveys:", err);
    }
  }

  async function openPoll(pollId) {
    try {
      const id = Number(pollId);
      const pollOpt = await backend.getPoll(id);
      if (!pollOpt || pollOpt.length === 0) {
        alert("Survey not found or empty.");
        return;
      }
      setSelectedPoll(pollOpt[0]);
      setVoteResult("");
    } catch (err) {
      console.error("Error opening the survey:", err);
      alert("Error opening the survey");
    }
  }

  async function vote(optionIndex) {
    if (!selectedPoll) return;
    try {
      const result = await backend.vote(selectedPoll.id, optionIndex);
      if ("ok" in result) {
        setVoteResult("Vote counted.");
        const updated = await backend.getPoll(selectedPoll.id);
        if (updated && updated.length > 0) {
          setSelectedPoll(updated[0]);
        }
      } else {
        setVoteResult(result.err);
      }
    } catch (err) {
      setVoteResult("Voting error.");
      console.error(err);
    }
  }

  async function deletePoll(pollId) {
    if (window.confirm("Are you sure you want to delete this survey?")) {
      try {
        const result = await backend.deletePoll(pollId);
        if ("ok" in result) {
          alert("Survey deleted.");
          setSelectedPoll(null);
          await loadPolls();
        } else {
          alert(result.err);
        }
      } catch (err) {
        console.error("Deletion error:", err);
      }
    }
  }

  async function createPoll() {
    const options = optionsText
      .split("\n")
      .map((opt) => opt.trim())
      .filter((opt) => opt.length > 0);

    if (!question || options.length < 2) {
      alert("Questions and at least 2 options are required.");
      return;
    }

    try {
      const pollId = await backend.createPoll(question, options);
      console.log("Created a survey with ID:", pollId);
      setQuestion("");
      setOptionsText("");
      await loadPolls();
      await openPoll(pollId);
    } catch (err) {
      alert("Error creating a survey");
      console.error(err);
    }
  }

  return (
    <div id="app">
      <h1>Decentralized voting</h1>

      <div className="info-box">
        <h2>Create a new survey</h2>
        <div className="info-content">
          <p>
            <input
              type="text"
              placeholder="Question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
            />
          </p>
          <p>
            <textarea
              placeholder="Answer options (one per line)"
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              rows={4}
              style={{ width: "100%", padding: "8px" }}
            />
          </p>
          <button onClick={createPoll}>Create</button>
        </div>
      </div>

      <div className="info-box">
        <h2>List of surveys</h2>
        <div className="info-content">
          {polls.length === 0 ? (
            <p>There are no surveys yet.</p>
          ) : (
            <ul>
              {polls.map(([id, title]) => (
                <li key={id}>
                  <button onClick={() => openPoll(id)}>{title}</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {selectedPoll && (
        <div className="info-box">
          <h2>Survey</h2>
          <h4>{selectedPoll.question}</h4>
          <div className="info-content">
            <ul>
              {selectedPoll.options.map((opt, i) => {
                const total = selectedPoll.votes.reduce((sum, v) => sum + Number(v), 0);
                const count = Number(selectedPoll.votes[i]);
                const percent = total === 0 ? 0 : Math.round((count / total) * 100);
                return (
                  <li key={i}>
                    <button onClick={() => vote(i)}>{opt}</button> — {count} votes ({percent}%)
                  </li>
                );
              })}
            </ul>
            {voteResult && (
              <p style={{ marginTop: "1rem", fontWeight: "bold" }}>{voteResult}</p>
            )}
            <button
              style={{ backgroundColor: "#7421f0", marginTop: "1rem" }}
              onClick={() => deletePoll(selectedPoll.id)}
            >
              Delete the survey
            </button>
          </div>
        </div>
      )}
    </div>
  );
}