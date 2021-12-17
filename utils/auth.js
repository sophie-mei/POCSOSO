import jwt from "jsonwebtoken";

export const getJwtToken = (serviceKey, secretKey) => {
    const token = jwt.sign(
      {
        serviceKey: serviceKey,
      },
      secretKey,
      { expiresIn: 5 * 60 }
    );
    return token;
}