/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

const workerUrl = "https://loreal-chatbot.your-subdomain.workers.dev/";
const systemMessage = `You are a helpful L’Oréal beauty assistant. Only answer questions related to L’Oréal products, makeup, skincare, haircare, fragrances, beauty routines, and personalized product recommendations. Provide clear, friendly, and useful responses. If a user asks about something unrelated to L’Oréal or beauty routines, politely explain that you can only assist with L’Oréal-related beauty questions. Do not invent specific product details or claims when information is unavailable.`;
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
