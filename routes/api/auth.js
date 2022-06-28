const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const { nanoid } = require("nanoid");

const { newError, sendMail } = require("../../additionals");

const { User, schemas } = require("../../models/user");

const router = express.Router();

const { SECRET_KEY } = process.env;

const { auth, upload } = require("../../middlewares");

const avatarsDir = path.join(__dirname, "../../", "public", "avatars");

router.post("/signup", async (req, res, next) => {
  try {
    const { error } = schemas.register.validate(req.body);
    if (error) {
      throw newError(400, "Email or password invalid");
    }
    const { email, password } = req.body;
    const result = await User.findOne({ email });
    if (result) {
      throw newError(409, "Email in use");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
            const verificationToken = nanoid();
            await User.create({
              email,
              password: hashPassword,
              avatarURL,
              verificationToken,
            });
            const mail = {
              to: email,
              subject: "Confirm registration",
              html: `<a target="_blank" 
            href="localhost:3000/api/users/verify/${verificationToken}">
                Press for confirm email
            </a>`,
            };
    await sendMail(mail);

    res.status(201).json({
      user: {
        email,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
      throw newError(404);
    }
    await User.findByIdAndUpdate(user._id, {
      verificationToken: null,
      verify: true,
    });
    res.json({
      message: "Varification successful",
    });
  } catch (error) {
    next(error);
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const { error } = schemas.verifyEmail.validate(req.body);
    if (error) {
      throw newError(400, "Email or password invalid");
    }
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw newError(401);
    }
    if (user.verify) {
      throw newError(400, "Verification has already been passed");
    }
    const mail = {
      to: email,
      subject: "Confirm regestration",
      html: `<a 
            target="_blank" 
            href="localhost:3000/api/users/verify/${user.verificationToken}">
                Press for confirm email
            </a>`,
    };
    await sendMail(mail);
    res.json({
      message: "Verification email sent",
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { error } = schemas.login.validate(req.body);
    if (error) {
      throw newError(400, "Email or password is wrong");
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      throw newError(401, "Email is wrong");
    }

    if (!user.verify) {
      throw newError(401, "Email not verify");
    }
    
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw newError(401, "Password is wrong");
    }

    const payload = {
      id: user._id,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "2h" });

    await User.findByIdAndUpdate(user._id, { token });

    res.json({
      token,
      user: {
        email,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/current", auth, async (req, res, next) => {
  const { email } = req.user;
  res.json({ email });
});

router.get("/logout", auth, async (req, res, next) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: null });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/avatars",
  auth,
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      const { _id: id } = req.user;
      const { originalname, path: tempUpload } = req.file;
      const [extension] = originalname.split(".").reverse();
      const fileName = `${id}.${extension}`;
      const resultUpload = path.join(avatarsDir, fileName);
      await fs.rename(tempUpload, resultUpload);
      const avatarURL = path.join("avatars", fileName);
      await User.findByIdAndUpdate(id, { avatarURL });
      res.json({
        avatarURL,
      });
    } catch (error) {
      await fs.unlink(req.file.path);
      next(error);
    }
  }
);

module.exports = router;
