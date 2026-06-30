"use client";

import {
  useState,
  type FormEvent,
} from "react";
import {
  Check,
  CircleDot,
  Clock3,
  ListChecks,
  Plus,
  Trash2,
  Vote,
} from "lucide-react";

import { PixelButton } from "@/components/ui/pixel-button";
import { PixelInput } from "@/components/ui/pixel-input";
import { PixelPanel } from "@/components/ui/pixel-panel";
import type {
  CreatePollInput,
} from "@/features/polls/poll-api";
import type { PollType } from "@/types/poll";

type PollCreateFormProps = {
  isSubmitting: boolean;
  onCreate: (
    input: CreatePollInput,
  ) => Promise<boolean>;
};

const controlClassName =
  "w-full border-2 border-outline bg-panel-deep px-3 py-3 text-sm text-cream outline-none transition focus:border-amber";

const pollTypeOptions: Array<{
  value: PollType;
  label: string;
  description: string;
  icon: typeof Check;
}> = [
  {
    value: "yes_no",
    label: "Ano / Ne",
    description: "Rychlé rozhodnutí se dvěma možnostmi.",
    icon: Check,
  },
  {
    value: "single_choice",
    label: "Jedna možnost",
    description: "Každý hráč vybere právě jednu odpověď.",
    icon: CircleDot,
  },
  {
    value: "multiple_choice",
    label: "Více možností",
    description: "Každý může označit více odpovědí.",
    icon: ListChecks,
  },
];

export function PollCreateForm({
  isSubmitting,
  onCreate,
}: PollCreateFormProps) {
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] =
    useState<PollType>("yes_no");

  const [options, setOptions] = useState([
    "",
    "",
  ]);

  const [closesAt, setClosesAt] = useState("");
  const [formError, setFormError] =
    useState<string | null>(null);

  function updateOption(
    index: number,
    value: string,
  ) {
    setOptions((currentOptions) =>
      currentOptions.map((option, optionIndex) =>
        optionIndex === index ? value : option,
      ),
    );
  }

  function removeOption(index: number) {
    setOptions((currentOptions) =>
      currentOptions.filter(
        (_, optionIndex) => optionIndex !== index,
      ),
    );
  }

  function addOption() {
    setOptions((currentOptions) => [
      ...currentOptions,
      "",
    ]);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setFormError(null);

    const trimmedQuestion = question.trim();
    const trimmedDescription = description.trim();

    if (trimmedQuestion.length < 4) {
      setFormError(
        "Otázka ankety musí mít alespoň 4 znaky.",
      );

      return;
    }

    if (trimmedQuestion.length > 160) {
      setFormError(
        "Otázka ankety může mít maximálně 160 znaků.",
      );

      return;
    }

    if (trimmedDescription.length > 500) {
      setFormError(
        "Popis ankety může mít maximálně 500 znaků.",
      );

      return;
    }

    const trimmedOptions = options
      .map((option) => option.trim())
      .filter(Boolean);

    if (
      type !== "yes_no" &&
      trimmedOptions.length < 2
    ) {
      setFormError(
        "Anketa musí mít alespoň dvě možnosti.",
      );

      return;
    }

    if (
      type !== "yes_no" &&
      trimmedOptions.length > 8
    ) {
      setFormError(
        "Anketa může mít maximálně osm možností.",
      );

      return;
    }

    if (
      type !== "yes_no" &&
      new Set(
        trimmedOptions.map((option) =>
          option.toLocaleLowerCase("cs-CZ"),
        ),
      ).size !== trimmedOptions.length
    ) {
      setFormError(
        "Každá možnost musí mít unikátní název.",
      );

      return;
    }

    const wasCreated = await onCreate({
      question: trimmedQuestion,
      description: trimmedDescription,
      type,
      options:
        type === "yes_no"
          ? undefined
          : trimmedOptions,
      closesAt: closesAt || null,
    });

    if (!wasCreated) {
      return;
    }

    setQuestion("");
    setDescription("");
    setType("yes_no");
    setOptions(["", ""]);
    setClosesAt("");
  }

  return (
    <PixelPanel tone="deep">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-pixel text-[9px] leading-5 text-amber-light">
            PARTY TOOL
          </p>

          <h2 className="mt-2 font-pixel text-[12px] leading-7 text-cream">
            Založit novou anketu
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-cream-muted">
            Rozhodni, co se bude hrát, objednávat nebo
            plánovat. LANtern spočítá hlasy za tebe.
          </p>
        </div>

        <div className="grid size-12 place-items-center border-2 border-outline bg-amber text-void shadow-pixel-sm">
          <Vote aria-hidden="true" size={22} />
        </div>
      </div>

      <form
        className="mt-7 grid gap-5"
        onSubmit={handleSubmit}
      >
        <PixelInput
          id="poll-question"
          label="Otázka ankety"
          maxLength={160}
          onChange={(event) =>
            setQuestion(event.target.value)
          }
          placeholder="Například: Co dáme jako první hru večera?"
          required
          value={question}
        />

        <label className="grid gap-2">
          <span className="font-pixel text-[9px] leading-5 text-cream">
            Popis
            <span className="ml-2 text-cream-muted">
              VOLITELNÉ
            </span>
          </span>

          <textarea
            className={`${controlClassName} min-h-28 resize-y`}
            maxLength={500}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Doplňující informace, pravidla hlasování nebo důvod, proč se o tom vůbec hlasuje."
            value={description}
          />
        </label>

        <fieldset>
          <legend className="font-pixel text-[9px] leading-5 text-cream">
            Typ hlasování
          </legend>

          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            {pollTypeOptions.map((pollType) => {
              const Icon = pollType.icon;
              const isSelected = type === pollType.value;

              return (
                <button
                  key={pollType.value}
                  aria-pressed={isSelected}
                  className={[
                    "border-2 p-4 text-left transition",
                    isSelected
                      ? "border-amber bg-amber/10 shadow-pixel-sm"
                      : "border-outline bg-panel-deep hover:border-outline-soft",
                  ].join(" ")}
                  onClick={() => setType(pollType.value)}
                  type="button"
                >
                  <Icon
                    aria-hidden="true"
                    className={
                      isSelected
                        ? "text-amber-light"
                        : "text-cream-muted"
                    }
                    size={19}
                  />

                  <p className="mt-3 font-pixel text-[9px] leading-5 text-cream">
                    {pollType.label}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-cream-muted">
                    {pollType.description}
                  </p>
                </button>
              );
            })}
          </div>
        </fieldset>

        {type !== "yes_no" ? (
          <fieldset>
            <div className="flex items-center justify-between gap-4">
              <legend className="font-pixel text-[9px] leading-5 text-cream">
                Možnosti hlasování
              </legend>

              <span className="font-pixel text-[8px] text-cream-muted">
                {options.length} / 8
              </span>
            </div>

            <div className="mt-3 grid gap-3">
              {options.map((option, index) => (
                <div
                  key={`poll-option-${index}`}
                  className="flex gap-3"
                >
                  <input
                    className={controlClassName}
                    maxLength={60}
                    onChange={(event) =>
                      updateOption(
                        index,
                        event.target.value,
                      )
                    }
                    placeholder={`Možnost ${index + 1}`}
                    value={option}
                  />

                  <button
                    aria-label={`Odebrat možnost ${index + 1}`}
                    className="grid size-12 shrink-0 place-items-center border-2 border-outline bg-panel-deep text-wine-light transition hover:border-wine"
                    disabled={
                      options.length <= 2 ||
                      isSubmitting
                    }
                    onClick={() => removeOption(index)}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" size={17} />
                  </button>
                </div>
              ))}
            </div>

            {options.length < 8 ? (
              <button
                className="mt-4 inline-flex items-center gap-2 border-2 border-outline px-3 py-2 font-pixel text-[8px] text-cream-muted transition hover:border-amber hover:text-amber-light"
                disabled={isSubmitting}
                onClick={addOption}
                type="button"
              >
                <Plus aria-hidden="true" size={14} />
                PŘIDAT MOŽNOST
              </button>
            ) : null}
          </fieldset>
        ) : (
          <div className="border-2 border-outline bg-panel-deep p-4 text-sm leading-6 text-cream-muted">
            LANtern automaticky vytvoří možnosti{" "}
            <strong className="text-cream">Ano</strong> a{" "}
            <strong className="text-cream">Ne</strong>.
          </div>
        )}

        <label className="grid max-w-md gap-2">
          <span className="flex items-center gap-2 font-pixel text-[9px] leading-5 text-cream">
            <Clock3 aria-hidden="true" size={14} />
            Konec hlasování
            <span className="text-cream-muted">
              VOLITELNÉ
            </span>
          </span>

          <input
            className={controlClassName}
            onChange={(event) =>
              setClosesAt(event.target.value)
            }
            type="datetime-local"
            value={closesAt}
          />
        </label>

        {formError ? (
          <p className="border-2 border-wine bg-wine/10 p-3 text-sm leading-6 text-cream">
            {formError}
          </p>
        ) : null}

        <div className="flex justify-end">
          <PixelButton
            disabled={isSubmitting}
            type="submit"
            variant="moss"
          >
            <Vote aria-hidden="true" size={16} />
            {isSubmitting
              ? "Zakládám anketu…"
              : "Spustit hlasování"}
          </PixelButton>
        </div>
      </form>
    </PixelPanel>
  );
}