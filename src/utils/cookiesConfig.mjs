export const cookiesConfig = {
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
  maxAge: 72 * 60 * 60 * 1000, // 72 hora
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  // signed: true, ---> no se necesita con los JWT, ya vienen encriptados
  // domain: process.env.NODE_ENV === "production" ? ".yog-in.es" : "localhost",
  domain:
    process.env.NODE_ENV === "production"
      ? "yogin-api-lilac.vercel.app"
      : undefined,
};

export const setCookies = (_req, res, token) => {
  // Establecer el token JWT en una cookie
  res.cookie("sessionToken", token, cookiesConfig);
};
