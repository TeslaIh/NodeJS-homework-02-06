const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");

const { newError } = require("../../additionals");

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
    await User.create({ email, password: hashPassword, avatarURL });
    res.status(201).json({
      user: {
        email,
      },
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
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw newError(401, "Password is wrong");
    }

    const payload = {
      id: user._id,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });

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
