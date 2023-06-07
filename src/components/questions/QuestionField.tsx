import { Homemade_Apple } from "next/font/google";
import { HTMLAttributes, useEffect, useRef, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { Tooltip } from "react-tooltip";

import useAutosizeTextArea from "@/components/hooks/useAutosizeTextArea";
import { fillFormStore } from "@/stores/fillFormStore";
import { QuestionType, UploadType, questionMeta } from "@/types";
import { CheckCircleIcon, PaperAirplaneIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useStore } from "@nanostores/react";
import Prisma, { Question } from "@prisma/client";
import { classNames } from "@/lib/utils";
import QuestionAttributes from "./QuestionAttributes";
import CommentBox from "./CommentBox";

const signatureFont = Homemade_Apple({ subsets: ["latin"], weight: ["400"] });

let saveTimeout: NodeJS.Timeout | null = null;

export default function QuestionField(props: { question: Prisma.Question }) {
  const { question } = props;
  const storedAnswer = useStore(fillFormStore.answers)[question.id];
  const error = useStore(fillFormStore.errors)[question.id];
  const [answer, setAnswerState] = useState<any>("");
  const [saved, setSaved] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);
  const readOnly = useStore(fillFormStore.readOnly);

  useEffect(() => {
    const div = divRef.current;
    if (!div) return;
    const clickListener = () => {
      fillFormStore.selectedQuestionId.set(question.id);
    };
    div.addEventListener("focusin", clickListener);
    return () => {
      div.removeEventListener("focusin", clickListener);
    };
  }, []);

  useEffect(() => {
    if (storedAnswer) {
      setAnswerState(storedAnswer.value);
      setSaved(true);
    }
  }, [storedAnswer]);

  const setAnswer = async (value: any, saveNow?: boolean) => {
    if (readOnly) return;
    setAnswerState(value);
    setSaved(false);
    error && fillFormStore.clearError(question.id);

    if (saveTimeout) clearTimeout(saveTimeout);
    if (saveNow) {
      await fillFormStore.onEditAnswer(question, value);
      setSaved(true);
    } else saveTimeout = setTimeout(saveAnswer, 3000);
  };

  const saveAnswer = async () => {
    if (readOnly) return;
    if (saveTimeout) clearTimeout(saveTimeout);
    if (!saved) {
      await fillFormStore.onEditAnswer(question, answer);
    }
    setSaved(true);
  };

  const componentProps = { question, answer, setAnswer, saveAnswer, saved, readOnly, error };

  const canComment = fillFormStore.canComment;

  return (
    <div ref={divRef} className={`flex flex-col text-slate-800 my-2`}>
      {question.subtitle && (
        <div className={`text-slate-700 whitespace-pre-wrap mb-4`}>{question.subtitle}</div>
      )}
      {question.type === QuestionType.SHORT_ANSWER ? (
        <ShortAnswer {...componentProps} />
      ) : question.type === QuestionType.LONG_ANSWER ? (
        <TextArea {...componentProps} />
      ) : question.type === QuestionType.TEXT ? (
        <div className="flex flex-col gap-4">{question.options || ""}</div>
      ) : question.type === QuestionType.UPLOAD ? (
        <Uploader {...componentProps} />
      ) : question.type === QuestionType.SIGNATURE ? (
        <Signature {...componentProps} />
      ) : question.type === QuestionType.RADIO_BUTTONS ||
        question.type == QuestionType.CHECKBOXES ? (
        <MultiSelect {...componentProps} />
      ) : null}

      {error && <div className={`text-red-700`}>{error}</div>}
      {canComment && <CommentBox question={question} divRef={divRef} />}
    </div>
  );
}

function SavedIcon({ saved }: { saved: boolean }) {
  return null;
  return (
    <CheckCircleIcon
      className={`w-4 h-4 ml-2 text-green-500 transition-opacity ${
        saved ? "opacity-100" : "opacity-0"
      }`}
      data-tooltip-id="tooltip"
      data-tooltip-content="Answer saved"
      tabIndex={-1}
    />
  );
}

type QuestionComponentProps = {
  question: Prisma.Question;
  answer: string;
  setAnswer: (value: any, saveNow?: boolean) => void;
  saved: boolean;
  readOnly: boolean | undefined;
  error: string | undefined;
};

function ShortAnswer({
  error,
  question,
  answer,
  saved,
  readOnly,
  setAnswer,
}: QuestionComponentProps) {
  return (
    <div className="flex items-end">
      <input
        name={question.title}
        placeholder={question.title}
        readOnly={readOnly}
        className={classNames(
          "question border rounded-md flex-1 p-2 focus:ring-0",
          error && "border-red-500"
        )}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onBlur={() => setAnswer(answer, true)}
      />
      <SavedIcon saved={saved} />
    </div>
  );
}

function TextArea({ error, question, answer, saved, readOnly, setAnswer }: QuestionComponentProps) {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  useAutosizeTextArea(textAreaRef.current, answer);

  return (
    <div className="flex items-end">
      <textarea
        name={question.title}
        placeholder={question.title}
        ref={textAreaRef}
        readOnly={readOnly}
        className={classNames(
          "question border-b rounded-md focus:ring-0 flex-1 min-h-[5rem]",
          error ? "border-red-500" : "border-gray-200"
        )}
        value={answer}
        onChange={(e) => setAnswer((e.target as HTMLTextAreaElement).value)}
        onBlur={(e) => {
          setAnswer((e.target as HTMLTextAreaElement).value, true);
        }}
      />
      <SavedIcon saved={saved} />
    </div>
  );
}

function MultiSelect({ error, question, answer, readOnly, setAnswer }: QuestionComponentProps) {
  const options = question.options || "";
  const splitOptions = options
    .split("\n")
    .map((option) => option.trim())
    .filter(Boolean);

  const inputType = question.type === QuestionType.RADIO_BUTTONS ? "radio" : "checkbox";
  const selectedOptions = new Set(
    answer
      .split("\n")
      .map((option) => option.trim())
      .filter(Boolean)
  );
  const [freeTextAnswer, setFreeTextAnswer] = useState("");

  const onClick = (option: string, value: boolean) => {
    if (readOnly) return;
    if (inputType == "radio") {
      setAnswer(option, true);
      if (freeTextAnswer) setFreeTextAnswer("");
    } else {
      if (value) {
        selectedOptions.add(option);
      } else {
        selectedOptions.delete(option);
      }
      setAnswer(Array.from(selectedOptions).join("\n"), true);
    }
  };

  const onFreeTextBlur = () => {
    if (inputType == "radio" && freeTextAnswer) {
      setAnswer(freeTextAnswer, true);
    } else {
      const answers = Array.from(selectedOptions).filter((a) => splitOptions.includes(a));
      if (freeTextAnswer) answers.push(freeTextAnswer);
      setAnswer(answers.join("\n"), true);
    }
  };

  const freeText = questionMeta(question).freeText;
  useEffect(() => {
    if (freeText) {
      const answers = Array.from(selectedOptions);
      const freeTextAnswer = answers.find((a) => !splitOptions.includes(a));
      if (freeTextAnswer) setFreeTextAnswer(freeTextAnswer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, freeText]);

  const cursorMode = readOnly ? "" : "cursor-pointer";

  return (
    <div className={classNames("flex flex-col gap-2", error && "border-red-500 border rounded-md")}>
      {splitOptions.length === 0 && <div className="text-slate-500">No options</div>}
      {splitOptions.map((option, index) => {
        const selected = selectedOptions.has(option) && (inputType != "radio" || !freeTextAnswer);
        return (
          <div
            key={option}
            className={classNames(
              "p-2 border rounded-md flex items-center",
              cursorMode,
              selected ? "bg-blue-100 border-blue-700" : "bg-gray-100"
            )}
            onClick={() => onClick(option, !selected)}
          >
            <div
              contentEditable={false}
              className={classNames(
                "relative px-2 rounded-md mr-4 font-bold",
                selected ? "bg-blue-300 text-blue-700" : "bg-gray-200 text-gray-500"
              )}
            >
              <input
                type={inputType}
                className="question absolute top-0 left-0 w-full h-full bg-transparent border-none rounded-md"
                name={question.id}
                value={option}
                checked={false}
                readOnly={readOnly}
                onChange={() => onClick(option, !selected)}
              />
              {String.fromCharCode(65 + index)}
            </div>
            <div>{option}</div>
          </div>
        );
      })}
      {freeText && (
        <input
          type="text"
          placeholder={freeText}
          readOnly={readOnly}
          className={classNames(
            "p-2 border border-gray-200 rounded-md flex items-center",
            freeTextAnswer ? "bg-blue-100 border-blue-700" : "bg-gray-100"
          )}
          value={freeTextAnswer}
          onChange={(e) => setFreeTextAnswer(e.target.value)}
          onBlur={onFreeTextBlur}
        />
      )}
    </div>
  );
}

function Uploader({ readOnly, question }: QuestionComponentProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleChange = (file: File) => {
    if (readOnly) return;
    setFiles((files) => [...files, file]);
  };

  const fileTypes =
    question.options == UploadType.IMAGES
      ? ["png", "jpg", "gif"]
      : question.options == UploadType.DOCS
      ? ["pdf", "doc", "docx"]
      : question.options == UploadType.SPREADSHEETS
      ? ["xls", "xlsx", "csv"]
      : undefined;

  return (
    <div className="mb-4">
      {files.map((file) => (
        <div key={file.name} className="flex items-center my-1">
          <div className="flex-1">{file.name}</div>
          <XMarkIcon
            className="w-4 h-4 text-slate-500 cursor-pointer"
            onClick={() => setFiles((files) => files.filter((f) => f.name !== file.name))}
          />
        </div>
      ))}

      <FileUploader handleChange={handleChange} name="file" types={fileTypes} />
    </div>
  );
}

function Signature({
  error,
  question,
  answer,
  readOnly,
  saved,
  setAnswer,
}: QuestionComponentProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (typeof answer == "string" && answer.startsWith("{")) {
      const { name } = JSON.parse(answer);
      setName(name);
    }
  }, [answer]);

  const recordSig = () => {
    // here we can add additional logic to record the signature
    setAnswer(
      {
        name,
        ua: navigator.userAgent,
      },
      true
    );
  };

  return (
    <>
      <div className="flex items-end -mb-2">
        <div className="relative flex-1 max-w-md -ml-2">
          <div
            className={classNames(
              "absolute border-b h-14 w-full pointer-events-none -z-10 ml-2",
              error && "border-red-500"
            )}
          />
          <input
            name={question.title}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={recordSig}
            placeholder={question.title || "Click here to sign"}
            readOnly={readOnly}
            className={classNames(
              "ml-1 w-full question indent-2 bg-transparent h-20",
              name ? "text-3xl" : "text-lg",
              name && signatureFont.className
            )}
          />
        </div>
        <div className="pb-6">
          <SavedIcon saved={saved} />
        </div>
      </div>
      <div className="text-sm">
        By writing your name, you consent to usin an electronic signature.
      </div>
    </>
  );
}
