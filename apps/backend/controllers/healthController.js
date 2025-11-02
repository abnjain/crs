export const ping = (req, res) => {
  try {
    res.status(200).json({ ok: true, message: "😊 Ping successful", uptime: Math.floor(process.uptime()) + " seconds", timestamp: Date.now() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Can't ping server or Internal Server Error", error: error.message });
  }
};