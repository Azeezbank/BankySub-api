const allowedOrigins = [
  "https://bankyconnect.vercel.app",
  "http://localhost:5173",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["POST", "GET", "DELETE", "PUT", "HEAD", "PATCH"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
};

export default corsOptions;