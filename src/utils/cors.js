module.exports = {
  origin: "http://localhost:8081", // Đảm bảo rằng Nuxt.js có thể gửi yêu cầu tới API
  methods: ["GET", "POST","PUT", "DELETE", "OPTIONS"],
  credentials: true,
};