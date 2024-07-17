//MIDDLEWARE
export const resolveIndexById = (req, res, next) => {
  const {
    body,
    params: { id },
  } = req;

  const parsedId = parseInt(id);

  // Si no es un número
  if (isNaN(parsedId)) return res.sendStatus(400);

  // Si no existe el ID en el ARRAY
  const userIndex = users.findIndex((user) => user.id === parsedId);
  if (userIndex === -1) return res.sendStatus(404);

  // NOTA: como NO se puede pasar datos de un MIDDLEWARE a otro se modifica los valores de REQUEST y RESPONSE
  req.userIndex = userIndex;

  next(); // Se pueden pasar parámetros de tipo NULL o ERROR
};
