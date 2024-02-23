export default (req, res, next) => {
  const allowedOrigins = [
    'https://weon.nowecompany.com.br/',
    'https://hmlg.weon.nowecompany.com.br/',
    'http://127.0.0.1:5501/',
  ];

  const { origin } = req.headers;

  // if (allowedOrigins.includes(origin)) {
  //   res.header('Access-Control-Allow-Origin', origin);
  //   console.log(origin);
  // } else {
  //   console.log('null');
  //   res.header('Access-Control-Allow-Origin', null);
  // }
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, GET, DELETE, PUT');
  res.header('Access-Control-Allow-Headers', 'Content-Type, authorization');
  res.header('Access-Control-Max-Age', '86400');
  next();
};
