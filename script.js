/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Replace this placeholder with your deployed Cloudflare Worker URL.
const workerUrl = "https://08-prj-loreal-chatbot-2.colin-harrison05.workers.dev";
const systemMessage = `You are a helpful L’Oréal beauty assistant. Only answer questions about L’Oréal products, makeup, skincare, haircare, fragrances, beauty routines, or personalized product recommendations. Politely redirect unrelated questions to L’Oréal beauty topics. Do not invent product details or claims when information is unavailable.`;
const conversation = [];

// Set initial message
addMessage("👋 Hello! How can I help you today?", "ai");

// Add a message to the chat window.
function addMessage(message, sender) {
  const messageElement = document.createElement("div");
  messageElement.className = `msg ${sender}`;
  messageElement.textContent = message;
  chatWindow.appendChild(messageElement);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  conversation.push({ role: "user", content: message });
  userInput.value = "";

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemMessage },
          ...conversation,
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("The chatbot request failed.");
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    addMessage(reply, "ai");
    conversation.push({ role: "assistant", content: reply });
  } catch (error) {
    addMessage("Sorry, I could not connect right now. Please try again.", "ai");
    console.error(error);
  }
});
