function vote(candidate) {
  fetch("http://localhost:5000/vote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: "test_user", candidate: candidate })
  })
  .then(res => res.json())
  .then(data => alert(data.message));
}
