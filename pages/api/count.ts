import { PrismaClient } from "@prisma/client";
import type { NextApiHandler } from "next";
import { z } from "zod";

const prisma = new PrismaClient();

const handler: NextApiHandler = async (req, res) => {
  const referer = z.string().url().safeParse(req.headers.referer);
  if (!referer.success) {
    console.error(`Invalid Referer: ${req.headers.referer}`);
    return res.status(400).send("Bad Request");
  }

  const domain = new URL(referer.data).hostname;

  let site = await prisma.site.findUnique({
    where: { referer: domain },
  });

  if (!site) {
    site = await prisma.site.create({
      data: {
        referer: domain,
        count: 1,
      },
    });

    return res.send(1);
  }

  const count = site.count + 1;

  await prisma.site.update({
    where: { referer: domain },
    data: { count },
  });

  res.send(count);
};

export default handler;
