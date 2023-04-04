// `checkUsernameFree`, `checkUsernameExists` ve `checkPasswordLength` gereklidir (require)
// `auth-middleware.js` deki middleware fonksiyonları. Bunlara burda ihtiyacınız var!
const router = require("express").Router();
const userModel = require("../users/users-model");
const bcrypt = require("bcryptjs");
const middleware = require("./auth-middleware");
const { response } = require("../server");

/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status: 201
  {
    "user_id": 2,
    "username": "sue"
  }

  response username alınmış:
  status: 422
  {
    "message": "Username kullaniliyor"
  }

  response şifre 3 ya da daha az karakterli:
  status: 422
  {
    "message": "Şifre 3 karakterden fazla olmalı"
  }
 */

router.post(
  "/register",
  middleware.usernameBostami,
  middleware.sifreGecerlimi,
  async (req, res, next) => {
    try {
      const userBody = req.body;
      const hashedPassword = bcrypt.hashSync(req.body.password, 6);
      userBody.password = hashedPassword;
      const newUser = await userModel.ekle(userBody);
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  }
);

/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status: 200
  {
    "message": "Hoşgeldin sue!"
  }

  response geçersiz kriter:
  status: 401
  {
    "message": "Geçersiz kriter!"
  }
 */

router.post("/login", middleware.usernameVarmi, async (req, res, next) => {
  try {
    const users = await userModel.goreBul({
      "users.username": req.body.username,
    });
    const user = users[0];
    const isValid = bcrypt.compareSync(req.body.password, user.password);
    if (isValid) {
      req.session.user_id = user.user_id;
      res.status(200).json({ message: `Hoşgeldin ${req.body.username}` });
    } else {
      res.status(401).json({ message: "Geçersiz kriter" });
    }
  } catch (error) {
    next(error);
  }
});

/**
  3 [GET] /api/auth/logout

  response giriş yapmış kullanıcılar için:
  status: 200
  {
    "message": "Çıkış yapildi"
  }

  response giriş yapmamış kullanıcılar için:
  status: 200
  {
    "message": "Oturum bulunamadı!"
  }
 */

// Diğer modüllerde kullanılabilmesi için routerı "exports" nesnesine eklemeyi unutmayın.

router.get("/logout", (req, res, next) => {
  try {
    if (req.session.user_id) {
      req.session.destroy((err) => {
        if (err) {
          res
            .status(500)
            .json({ message: "Çıkış yapilirken hata olustu" });
        } else {
          res.status(200).json({ message: "Çıkış yapildi" });
        }
      });
    } else {
      res.status(200).json({ message: "Oturum bulunamadı!" });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
