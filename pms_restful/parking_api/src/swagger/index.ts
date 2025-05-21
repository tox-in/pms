import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    version: "1.0.0",
    title: "RCA LMS API",
    description: "RCA Library Management System APIs Documentation",
  },
  host: "localhost:3000",
  basePath: "/api/v1",
  schemes: ["http"],
  consumes: ["application/json"],
  produces: ["application/json"],
  tags: [
    {
      name: "Auth",
      description: "Authentication endpoints",
    },
    {
      name: "Users",
      description: "Users endpoints",
    },
    {
      name: "vehicles",
      description: "Vehicles endpoints",
    },
    {
      name: "parkings",
      description: "Parkings endpoints",
    },
    {
      name: "sessions",
      description: "Parking Sessions endpoints",
    },
  ],
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
    },
  },
  definitions: {},
};

const outputFile = "./src/swagger/doc/swagger.json";
const routes = ["./src/routes/index.ts"];

swaggerAutogen()(outputFile, routes, doc).then(async () => {
  await import("./../app");
});
