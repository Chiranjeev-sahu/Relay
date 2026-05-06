export default {
  origin: [process.env.FRONTEND_URL || "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  headers: ["Content-type", "Authorization", "Accept", "Origin"],
};
