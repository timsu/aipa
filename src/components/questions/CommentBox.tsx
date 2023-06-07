import Select from "@/components/inputs/Select";
import TextField from "@/components/inputs/TextField";
import { editFormStore } from "@/stores/editFormStore";
import { fillFormStore } from "@/stores/fillFormStore";
import { QuestionMeta, QuestionType, questionMeta } from "@/types";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useStore } from "@nanostores/react";
import { Question } from "@prisma/client";
import { MutableRefObject, useEffect, useMemo, useState } from "react";
import { usePopper } from "react-popper";

type Props = {
  question: Question;
  divRef: MutableRefObject<HTMLDivElement | null>;
};

export default function CommentBox({ question, divRef }: Props) {
  const questionId = useStore(fillFormStore.selectedQuestionId);

  const showQuestion = questionId == question.id;

  const bodyWidth = document.body.clientWidth;
  const padding = bodyWidth > 1300 ? 100 : bodyWidth > 800 ? 50 : 0;
  const placement = bodyWidth > 500 ? "right" : "bottom";

  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);
  const { styles, attributes } = usePopper(divRef.current, popperElement, {
    placement,
    modifiers: [
      { name: "arrow", options: { element: arrowElement } },
      {
        name: "preventOverflow",
        options: {
          altAxis: true,
          padding,
        },
      },
      {
        name: "flip",
      },
    ],
  });

  if (!showQuestion) return null;

  const close = () => {
    editFormStore.selectedQuestionId.set(undefined);
  };

  return (
    <div
      ref={setPopperElement}
      contentEditable={false}
      className="select-none rounded-md bg-white border p-4 shadow-lg  
        w-60 min-h-[50px]"
      style={styles.popper}
      {...attributes.popper}
    >
      <div className="flex items-center -mt-2 -mx-4 px-4 py-1 mb-4 border-b">
        <div className="flex-1">Add a comment</div>
        <div className="cursor-pointer ml-5" onClick={() => close()}>
          <XMarkIcon className="h-5 w-5" />
        </div>
      </div>
      <textarea className="w-full h-20 border rounded-md p-2" />
      <div className="arrow left-[-5px]" ref={setArrowElement} style={styles.arrow} />
    </div>
  );
}

const questionTitle = (question: Question) => {
  switch (question.type) {
    case QuestionType.SHORT_ANSWER:
      return "Short Answer";
    case QuestionType.LONG_ANSWER:
      return "Long Answer";
    case QuestionType.RADIO_BUTTONS:
      return "Select One";
    case QuestionType.CHECKBOXES:
      return "Select Multiple";
    case QuestionType.SIGNATURE:
      return "Signature Block";
    case QuestionType.UPLOAD:
      return "File Upload";
    default:
      return "Question";
  }
};

const isTextQuestion = (type: string) => {
  return type == QuestionType.SHORT_ANSWER || type == QuestionType.LONG_ANSWER;
};

function TextFieldOptions({ question }: { question: Question }) {
  const [type, setType] = useState<QuestionType>(question.type as QuestionType);

  return (
    <>
      <div>Type</div>
      <Select
        value={type}
        onChange={(e) => {
          setType(e.target.value as QuestionType);
          editFormStore.updateQuestion(question, { type: e.target.value });
        }}
      >
        <option value={QuestionType.SHORT_ANSWER}>Short Answer</option>
        <option value={QuestionType.LONG_ANSWER}>Long Answer</option>
      </Select>
    </>
  );
}

function TitleOptions({ question }: { question: Question }) {
  const [title, setTitle] = useState(question.title);

  return (
    <>
      <div>Name</div>
      <TextField
        placeholder="For reporting"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => editFormStore.updateQuestion(question, { title })}
      />
    </>
  );
}

const isChoiceQuestion = (type: string) => {
  return type == QuestionType.CHECKBOXES || type == QuestionType.RADIO_BUTTONS;
};

function ChoiceFieldOptions({ question }: { question: Question }) {
  const [type, setType] = useState<QuestionType>(question.type as QuestionType);
  const meta: QuestionMeta = questionMeta(question);
  const [freeText, setFreeText] = useState<string | null>(meta.freeText || null);

  return (
    <>
      <div>Type</div>
      <Select
        value={type}
        onChange={(e) => {
          setType(e.target.value as QuestionType);
          editFormStore.updateQuestion(question, { type: e.target.value });
        }}
      >
        <option value={QuestionType.CHECKBOXES}>Choose Multiple</option>
        <option value={QuestionType.RADIO_BUTTONS}>Choose One</option>
      </Select>

      <div>Allow Free Text</div>
      <div>
        <input
          type="checkbox"
          className="border rounded-md p-2 w-6 h-6"
          checked={freeText != null}
          onChange={(e) => {
            const newValue = freeText ? null : "Other";
            setFreeText(newValue);
            editFormStore.updateQuestion(question, {
              meta: {
                freeText: newValue,
              },
            });
          }}
        />
      </div>

      {freeText && (
        <>
          <div>Free Text Label</div>
          <TextField
            value={freeText}
            onChange={(e) => {
              setFreeText(e.target.value);
            }}
            onBlur={(e) => {
              editFormStore.updateQuestion(question, { meta: { freeText } });
            }}
          />
        </>
      )}
    </>
  );
}

function Required({ question }: { question: Question }) {
  const [required, setRequired] = useState(question.required);

  return (
    <>
      <div>Required?</div>
      <div>
        <input
          type="checkbox"
          className="border rounded-md p-2 w-6 h-6"
          checked={required}
          onChange={(e) => {
            setRequired(e.target.checked);
            editFormStore.updateQuestion(question, { required: e.target.checked });
          }}
        />
      </div>
    </>
  );
}
