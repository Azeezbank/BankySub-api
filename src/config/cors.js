const corsOptions = {
  // origin: (origin, callback) => {
  //   callback(null, true);
  // },
  origin: '*',
  methods: ["POST", "GET", "DELETE", "PUT", 'HEAD', 'PATCH',],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

export default corsOptions;