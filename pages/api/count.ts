import { PrismaClient } from "@prisma/client";
import type { NextApiHandler } from "next";
import { z } from "zod";

const prisma = new PrismaClient();

const handler: NextApiHandler = async (req, res) => {
  const referer = z.string().url().safeParse(res.getHeader("Referer"));
  if (!referer.success) return res.status(400).send("Bad Request");

  let site = await prisma.site.findUnique({
    where: { referer: referer.data },
  });

  if (!site) {
    site = await prisma.site.create({
      data: {
        referer: referer.data,
        count: 1,
      },
    });

    return res.send(1);
  }

  const count = site.count + 1;

  await prisma.site.update({
    where: { referer: referer.data },
    data: { count },
  });

  res.send(count);
};

export default handler;
