import fs from "fs";
import path from "path";
import { Glob } from "glob";
import { ensureDir } from "fs-extra";

const source = `${process.cwd()}/src`;
const destination = `${process.cwd()}/markdown`;

console.log("source", source);

interface ResultBlock {
  lines: string[];
  type: "code" | "comment";
}

const parseFile = (sources: string): ResultBlock[] => {
  const lines = sources.split("\n");
  // console.log("lines", lines);
  const resultingBlocks: ResultBlock[] = [];
  let commentBuffer: string[] = [];
  let codeBuffer: string[] = [];
  let isCode = true;
  const dumpCode = () => {
    if (codeBuffer.length > 0 && codeBuffer.some((x) => x.trim() !== "")) {
      resultingBlocks.push({
        type: "code",
        lines: codeBuffer,
      });
      codeBuffer = [];
    }
  };
  for (const line of lines) {
    const trimmed = line.trim();
    const startComment = trimmed.startsWith("/*");
    const endComment = trimmed.endsWith("*/");
    const oneLineComment = trimmed.startsWith("//");
    console.log(
      "=> ",
      isCode,
      trimmed,
      startComment,
      endComment,
      oneLineComment,
      commentBuffer,
      codeBuffer
    );

    // single line comment
    if ((startComment && endComment) || oneLineComment) {
      dumpCode();
      resultingBlocks.push({
        type: "comment",
        lines: [line],
      });
      console.log("(1)");
    } else if (startComment) {
      dumpCode();
      commentBuffer.push(trimmed);
      isCode = false;
      console.log("(2)");
    } else if (!isCode && !endComment) {
      commentBuffer.push(trimmed);
      console.log("(3)");
    } else if (!isCode && endComment) {
      commentBuffer.push(trimmed);
      resultingBlocks.push({
        type: "comment",
        lines: commentBuffer,
      });
      isCode = true;
      commentBuffer = [];
      console.log("(4)");
    } else {
      codeBuffer.push(line);
      console.log("(5)");
    }
  }
  dumpCode();
  return resultingBlocks;
};

const transform = (parsed: ResultBlock[]): string => {
  let result: string[] = [];
  for (const part of parsed) {
    if (part.type === "code") {
      result = result.concat("```ts", part.lines, "```");
    } else {
      result = result.concat(
        part.lines.map(
          (x) =>
            x
              .replace(/^\/\*(\*)?/, "") // comment start
              .replace(/\*\/$/, "") // comment end
              .replace(/^\/\//, "") // one-line comment
              .replace(/^\*/, "") // comment body *
        )
      );
    }
  }
  return result.join("\n");
};

const getFiles = async (cwd: string): Promise<string[]> =>
  new Promise((res, rej) => {
    new Glob(`**/*.ts`, { cwd }, (er, data) => {
      if (er) {
        return rej(er.toString());
      }
      return res(data);
    });
  });

async function main() {
  console.log("destination", destination);
  await ensureDir(destination);

  const files = await getFiles(source);

  console.log(JSON.stringify(files, undefined, 4));
  for (const name of files) {
    console.log("fileName", name);
    const fileName = `${source}/${name}`;
    const sources = fs.readFileSync(fileName).toString();
    const parsed = parseFile(sources);
    console.log("parsed", parsed);
    console.log("transform\n", transform(parsed));
  }
}
main();
