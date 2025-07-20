const corsOptions = {
  origin: (origin, callback) => {
    callback(null, true);
  },
  methods: ["POST", "GET", "DELETE", "PUT"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

export default corsOptions;