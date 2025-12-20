const success = (res, { code = 200, message = 'Berhasil', data, total, meta }) => {
  const response = { code, success: true, message };
  if (data !== undefined) response.data = data;
  if (total !== undefined) response.total = total;
  if (meta !== undefined) response.meta = meta;
  return res.status(code).json(response);
};

const clientError = (res, { code = 400, message = 'Permintaan tidak valid', errors }) => {
  const response = { code, success: false, message };
  if (errors) response.errors = errors;
  return res.status(code).json(response);
};

const serverError = (res, { code = 500, message = 'Terjadi kesalahan pada server', error } = {}) => {
  if (process.env.NODE_ENV !== 'production' && error) {
    console.error('❌ Server error details:', error);
  }
  return res.status(code).json({ code, success: false, message });
};

const badRequest = (res, message = 'Permintaan tidak valid', errors = null) =>
  clientError(res, { code: 400, message, errors });

const unauthorized = (res, message = 'Tidak sah (Unauthorized)') =>
  clientError(res, { code: 401, message });

const forbidden = (res, message = 'Akses ditolak (Forbidden)') =>
  clientError(res, { code: 403, message });

const notFound = (res, message = 'Data tidak ditemukan') =>
  clientError(res, { code: 404, message });

const methodNotAllowed = (res, message = 'Metode tidak diizinkan') =>
  clientError(res, { code: 405, message });

const notAcceptable = (res, message = 'Tidak dapat diterima') =>
  clientError(res, { code: 406, message });

const requestTimeout = (res, message = 'Permintaan melewati batas waktu') =>
  clientError(res, { code: 408, message });

const conflict = (res, message = 'Konflik data') =>
  clientError(res, { code: 409, message });

const gone = (res, message = 'Sumber daya tidak tersedia lagi') =>
  clientError(res, { code: 410, message });

const tooManyRequests = (res, message = 'Terlalu banyak permintaan') =>
  clientError(res, { code: 429, message });

const internalServerError = (res, message = 'Terjadi kesalahan pada server', error = null) =>
  serverError(res, { code: 500, message, error });

const notImplemented = (res, message = 'Fitur belum diimplementasikan') =>
  serverError(res, { code: 501, message });

const badGateway = (res, message = 'Gateway tidak valid') =>
  serverError(res, { code: 502, message });

const serviceUnavailable = (res, message = 'Layanan sedang tidak tersedia') =>
  serverError(res, { code: 503, message });

const gatewayTimeout = (res, message = 'Gateway timeout') =>
  serverError(res, { code: 504, message });

const httpVersionNotSupported = (res, message = 'Versi HTTP tidak didukung') =>
  serverError(res, { code: 505, message });

export {
  success,
  clientError,
  serverError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  methodNotAllowed,
  notAcceptable,
  requestTimeout,
  conflict,
  gone,
  tooManyRequests,
  internalServerError,
  notImplemented,
  badGateway,
  serviceUnavailable,
  gatewayTimeout,
  httpVersionNotSupported,
};