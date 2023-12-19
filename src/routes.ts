import { randomUUID } from "crypto";

import express from "express";

import { DateTime } from "luxon";

import { z } from "zod";

const router = express.Router();

router.use((_req, res, next) => {
  const request = {
    id: randomUUID(),

    received: DateTime.now().toUTC(),
  };

  res.locals["request"] = request;

  next();
});

router.post("/greeting", async (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(1).max(50),

      emailAddress: z.string().min(1).max(50).email(),

      gender: z.enum(["Male", "Female"]),

      coder: z.boolean(),
    });

    const parsedSchema = await schema.safeParseAsync({
      name: req.body.name,

      emailAddress: req.body.emailAddress,

      gender: req.body.gender,

      coder: req.body.coder,
    });

    if (parsedSchema.success) {
      return res.status(200).json({
        request: {
          request: {
            ...res.locals["request"],

            completed: DateTime.now().toUTC(),
          },

          message: `You sent ${parsedSchema.data.name} as your name and ${
            parsedSchema.data.emailAddress
          } as your email address! You are ${
            parsedSchema.data.gender === "Male" ? "Male" : "Female"
          }! You are ${parsedSchema.data.coder ? "a coder" : "not a coder"}!`,
        },
      });
    } else {
      return res.status(400).json({
        request: {
          ...res.locals["request"],

          completed: DateTime.now().toUTC(),
        },

        errorCode: "badRequest",
      });
    }
  } catch (error) {
    console.error(error);

    res.status(500).send({
      request: {
        ...res.locals["request"],

        completed: DateTime.now().toUTC(),
      },

      errorCode: "internalServerError",
    });
  }
});

export default router;
