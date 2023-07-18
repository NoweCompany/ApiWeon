export default (req, res, next) => {
  // const allowedOrigins = ['https://github.com/NoweCompany/weon', 'http://127.0.0.1:5500'];

  // const { origin } = req.headers;

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
