export function errorHandler(err, _req, res, _next) {
  console.error(`[ERROR] ${new Date().toISOString()} - ${err.message}`);
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
}

export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Rota ${req.method} ${req.path} nao encontrada`,
  });
}

export function requestLogger(req, _res, next) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
}
