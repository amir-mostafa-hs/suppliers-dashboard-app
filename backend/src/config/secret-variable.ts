import "dotenv/config";

interface Variables {
  port: number;
}

export const SECRET_VARIABLES: Variables = {
  port: Number(process.env.PORT) || 5040,
};
