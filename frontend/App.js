function vote(candidate) {
  fetch("http://127.0.0.1:5000/vote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user: "demo_user",
      candidate: candidate
    })
  })
  .then(response => response.json())
  .then(data => {
    alert(data.message);
  })
  .catch(error => {
    alert("Error connecting to backend");
    console.error(error);
  });
}
