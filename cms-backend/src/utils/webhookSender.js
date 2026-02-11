const axios = require("axios");

exports.sendArtifactWebhook = async (artifact) => {
  try {
    await axios.post(
      "https://webhook.site/d9ba53eb-64b5-481a-834f-d44045f98fae",
      {
        id: artifact._id,
        title: artifact.title,
        createdAt: artifact.createdAt,
      },
    );

    console.log("✅ Webhook sent successfully");
  } catch (err) {
    console.log("❌ Webhook failed:", err.message);
  }
};
