import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

export const registerUser = async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    console.log(req.body);
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!name || !username || !email || !password) {
      return res.status(401).json({ message: "required field is empty" });
    }

    await User.create({
      name,
      username,
      email,
      password: hashedPassword,
    });

    return res.status(200).json({ message: "user created Successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Failed to create user!" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).lean();

    if (!user) {
      return res.status(401).json({ message: "User does not exists!!" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Wrong password!!" });
    }

    const age = 1000 * 60 * 60;

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: age }
    );

    const { password: userPassword, ...userInfo } = user;

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: age,
      })
      .status(200)
      .json(userInfo);
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "unable to Login " });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "User Not in the Database" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);

    await User.findByIdAndUpdate(user._id, { token: token }, { new: true });

    const resetLink = `${req.protocol}://${req.get(
      "host"
    )}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.email",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Password Reset Request",
      html: `<h3>Password Reset Request</h3>
          <p>Hi ${user.name},</p>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${resetLink}">Reset Paassword</a>
          <p>If you did not request this, please ignore this email.</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: "Error sending email", error });
      }

      res.status(200).json({ message: "Reset link sent to your email" });
    });
  } catch (error) {
    console.log(error);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { password } = req.body;
    const user = await User.findOne({ token });

    const verifytoken = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!verifytoken)
      return res.status(401).json({ message: "try again token is not valid" });

    const newPassword = await bcrypt.hash(password, 10);

    const userData = await User.findByIdAndUpdate(
      user._id,
      { $set: { password: newPassword, token: "" } },
      { new: true }
    ).lean();

    const { password: newPass, ...userinfo } = userData;

    return res
      .status(200)
      .json({ message: "Password reset Successfull!!", userinfo });
  } catch (error) {
    console.log(error);
  }
};

export const logoutUser = async (req, res) => {
  res.clearCookie("token").status(200).json({ message: "Logout Successful" });
};
