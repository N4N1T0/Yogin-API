// cookieConfig.mjs

export const cookiesConfig = {
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
  maxAge: 60 * 60 * 1000, // 1 hora
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  signed: true,
  domain: process.env.NODE_ENV === "production" ? ".yog-in.es" : "localhost",
};

export const setCookies = (req, res) => {
  res.cookie(
    "sessionData",
    JSON.stringify({
      userId: req.session?.userId,
      role: req.session?.role,
      initialRole: req.session?.initialRole,
    }),
    cookiesConfig // Usar la configuración de cookies
  );

  res.cookie("sessionId", req.session.id, cookiesConfig); // También usa cookieConfig aquí
};
