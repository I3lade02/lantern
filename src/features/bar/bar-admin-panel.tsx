"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import type { User } from "firebase/auth";
import {
  Beer,
  Check,
  Copy,
  LoaderCircle,
  Pencil,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  Save,
  Settings2,
  X,
  ScanLine,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { PixelBadge } from "@/components/ui/pixel-badge";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelInput } from "@/components/ui/pixel-input";
import { PixelModal } from "@/components/ui/pixel-modal";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { toast } from "@/components/ui/pixel-toast";
import {
  createBarDrink,
  getBarAdminOverview,
  saveBarOperator,
  updateBarDrink,
} from "@/features/bar/bar-admin-api";
import { getBarScanUrl } from "@/features/bar/bar-qr-url";
import { useMembers } from "@/features/members/use-members";
import { formatCzkFromCents } from "@/lib/money";
import {
  DRINK_CATEGORIES,
  DRINK_CATEGORY_LABELS,
  type BarAdminDrink,
  type BarAdminOverview,
  type BarDrinkInput,
  type DrinkCategory,
} from "@/types/bar";

type BarAdminPanelProps = {
  user: User;
};

type EditorState =
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      drink: BarAdminDrink;
    }
  | null;

function formatPriceForInput(
  priceCents: number,
): string {
  const crowns = Math.floor(priceCents / 100);
  const hellers = priceCents % 100;

  if (hellers === 0) {
    return String(crowns);
  }

  return `${crowns},${String(hellers).padStart(2, "0")}`;
}

function parsePriceInput(
  value: string,
): number | null {
  const normalizedValue = value
    .trim()
    .replace(",", ".");

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalizedValue)) {
    return null;
  }

  const numericValue = Number(normalizedValue);

  if (
    !Number.isFinite(numericValue) ||
    numericValue <= 0 ||
    numericValue > 1_000
  ) {
    return null;
  }

  return Math.round(numericValue * 100);
}

type DrinkEditorProps = {
  drink?: BarAdminDrink;
  onClose: () => void;
  onSave: (input: BarDrinkInput) => Promise<void>;
};

function DrinkEditor({
  drink,
  onClose,
  onSave,
}: DrinkEditorProps) {
  const [name, setName] = useState(
    drink?.name ?? "",
  );

  const [price, setPrice] = useState(
    drink
      ? formatPriceForInput(drink.priceCents)
      : "",
  );

  const [category, setCategory] =
    useState<DrinkCategory>(
      drink?.category ?? "lemonade",
    );

  const [imageUrl, setImageUrl] = useState(
    drink?.imageUrl ?? "",
  );

  const [isAvailable, setIsAvailable] = useState(
    drink?.isAvailable ?? true,
  );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const priceCents = parsePriceInput(price);

    if (!priceCents) {
      toast.error(
        "Cena musí být mezi 0,01 Kč a 1 000 Kč.",
      );
      return;
    }

    if (name.trim().length < 2) {
      toast.error(
        "Název nápoje musí mít alespoň 2 znaky.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave({
        name: name.trim(),
        priceCents,
        category,
        imageUrl: imageUrl.trim() || null,
        isAvailable,
      });

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PixelModal
      description={
        drink
          ? "Uprav název, cenu, kategorii nebo dostupnost nápoje."
          : "Přidej nový nápoj, vytvoř QR token a připrav ho pro taverní pult."
      }
      onClose={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
      open
      size="md"
      title={drink ? "Upravit nápoj" : "Přidat nápoj"}
    >
      <form
        className="grid gap-5"
        onSubmit={handleSubmit}
      >
        <PixelInput
          id="bar-drink-name"
          label="Název nápoje"
          maxLength={100}
          onChange={(event) =>
            setName(event.target.value)
          }
          placeholder="Například Coca-Cola 0,5 l"
          required
          value={name}
        />

        <PixelInput
          id="bar-drink-price"
          inputMode="decimal"
          label="Cena v Kč"
          onChange={(event) =>
            setPrice(event.target.value)
          }
          placeholder="35"
          required
          value={price}
        />

        <label className="grid gap-2">
          <span className="font-pixel text-[9px] leading-5 text-cream">
            Kategorie
          </span>

          <select
            className="w-full border-2 border-outline bg-panel-deep px-3 py-3 text-sm text-cream outline-none focus:border-amber"
            onChange={(event) =>
              setCategory(
                event.target.value as DrinkCategory,
              )
            }
            value={category}
          >
            {DRINK_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {DRINK_CATEGORY_LABELS[item]}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-2">
          <PixelInput
            id="bar-drink-image"
            label="Obrázek nápoje (volitelné)"
            maxLength={500}
            onChange={(event) =>
              setImageUrl(event.target.value)
            }
            placeholder="/drinks/cola.png nebo https://…"
            value={imageUrl}
          />

          <p className="text-xs leading-5 text-cream-muted">
            Použij obrázek z adresáře public nebo HTTPS
            odkaz. Bez obrázku se vytiskne pixelová
            ilustrace podle kategorie.
          </p>
        </div>

        <label className="flex items-center gap-3 border-2 border-outline bg-panel-deep p-4">
          <input
            checked={isAvailable}
            className="size-4 accent-amber"
            onChange={(event) =>
              setIsAvailable(event.target.checked)
            }
            type="checkbox"
          />

          <span className="text-sm text-cream">
            Nápoj je momentálně dostupný
          </span>
        </label>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <PixelButton
            disabled={isSubmitting}
            onClick={onClose}
            variant="ghost"
          >
            <X aria-hidden="true" size={16} />
            Zrušit
          </PixelButton>

          <PixelButton
            disabled={isSubmitting}
            type="submit"
            variant="moss"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle
                  aria-hidden="true"
                  className="animate-spin"
                  size={16}
                />
                Ukládám…
              </>
            ) : (
              <>
                <Save aria-hidden="true" size={16} />
                {drink
                  ? "Uložit změny"
                  : "Přidat nápoj"}
              </>
            )}
          </PixelButton>
        </div>
      </form>
    </PixelModal>
  );
}

type DrinkQrModalProps = {
  drink: BarAdminDrink;
  onClose: () => void;
};

function DrinkQrModal({
  drink,
  onClose,
}: DrinkQrModalProps) {
  const scanUrl = getBarScanUrl(drink.qrToken);

  async function copyScanUrl() {
    try {
      await navigator.clipboard.writeText(scanUrl);

      toast.success(
        "Odkaz pro QR nápoj byl zkopírován.",
      );
    } catch {
      toast.error(
        "Odkaz se nepodařilo zkopírovat.",
      );
    }
  }

  return (
    <PixelModal
      description="Tento QR kód bude po dokončení scan obrazovky otevírat potvrzení nápoje pro konkrétní session."
      onClose={onClose}
      open
      size="sm"
      title={drink.name}
    >
      <div className="grid justify-items-center border-2 border-outline bg-cream p-6 shadow-pixel-sm">
        <QRCodeSVG
          level="M"
          size={220}
          value={scanUrl}
        />
      </div>

      <div className="mt-5 border-2 border-outline bg-panel-deep p-4">
        <p className="font-pixel text-[8px] text-cream-muted">
          CENA
        </p>

        <p className="mt-2 text-lg font-semibold text-amber-light">
          {formatCzkFromCents(drink.priceCents)}
        </p>

        <p className="mt-4 break-all text-xs leading-5 text-cream-muted">
          {scanUrl}
        </p>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <PixelButton
          onClick={onClose}
          variant="ghost"
        >
          Zavřít
        </PixelButton>

        <PixelButton
          onClick={() => {
            void copyScanUrl();
          }}
          variant="amber"
        >
          <Copy aria-hidden="true" size={16} />
          Kopírovat odkaz
        </PixelButton>
      </div>
    </PixelModal>
  );
}

export function BarAdminPanel({
  user,
}: BarAdminPanelProps) {
  const {
    members,
    isLoading: areMembersLoading,
  } = useMembers(true);

  const [overview, setOverview] =
    useState<BarAdminOverview | null>(null);

  const [selectedPayerId, setSelectedPayerId] =
    useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [isSavingOperator, setIsSavingOperator] =
    useState(false);

  const [error, setError] = useState<string | null>(
    null,
  );

  const [editorState, setEditorState] =
    useState<EditorState>(null);

  const [qrDrink, setQrDrink] =
    useState<BarAdminDrink | null>(null);

  const loadOverview = useCallback(async () => {
    setIsLoading(true);

    try {
      const nextOverview =
        await getBarAdminOverview(user);

      setOverview(nextOverview);

      setSelectedPayerId(
        nextOverview.config?.payerId ?? "",
      );

      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Taverní bar se nepodařilo načíst.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [user]);

 useEffect(() => {
  let isActive = true;

  void getBarAdminOverview(user)
    .then((nextOverview) => {
      if (!isActive) {
        return;
      }

      setOverview(nextOverview);

      setSelectedPayerId(
        nextOverview.config?.payerId ?? "",
      );

      setError(null);
    })
    .catch((loadError: unknown) => {
      if (!isActive) {
        return;
      }

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Taverní bar se nepodařilo načíst.",
      );
    })
    .finally(() => {
      if (!isActive) {
        return;
      }

      setIsLoading(false);
    });

  return () => {
    isActive = false;
  };
}, [user]);

  async function handleSaveOperator() {
    if (!selectedPayerId) {
      toast.error(
        "Vyber stálého provozovatele baru.",
      );
      return;
    }

    setIsSavingOperator(true);

    try {
      const config = await saveBarOperator(
        user,
        selectedPayerId,
      );

      setOverview((currentOverview) => ({
        config,
        drinks: currentOverview?.drinks ?? [],
      }));

      toast.success(
        "Provozovatel baru byl nastaven.",
      );
    } catch (saveError) {
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : "Provozovatele baru se nepodařilo uložit.",
      );
    } finally {
      setIsSavingOperator(false);
    }
  }

  async function handleSaveDrink(
    input: BarDrinkInput,
  ) {
    try {
      if (editorState?.mode === "edit") {
        await updateBarDrink(
          user,
          editorState.drink.id,
          input,
        );

        toast.success("Nápoj byl upraven.");
      } else {
        await createBarDrink(user, input);

        toast.success(
          "Nápoj byl přidán do taverní nabídky.",
        );
      }

      await loadOverview();
    } catch (saveError) {
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : "Nápoj se nepodařilo uložit.",
      );

      throw saveError;
    }
  }

  async function toggleAvailability(
    drink: BarAdminDrink,
  ) {
    try {
      await updateBarDrink(user, drink.id, {
        name: drink.name,
        priceCents: drink.priceCents,
        category: drink.category,
        imageUrl: drink.imageUrl,
        isAvailable: !drink.isAvailable,
      });

      await loadOverview();

      toast.success(
        drink.isAvailable
          ? `${drink.name} je nyní skrytý.`
          : `${drink.name} je znovu dostupný.`,
      );
    } catch (updateError) {
      toast.error(
        updateError instanceof Error
          ? updateError.message
          : "Dostupnost nápoje se nepodařilo změnit.",
      );
    }
  }

  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-5 py-8 pb-16">
        <section className="flex flex-col gap-5 border-b-2 border-outline pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-pixel text-[10px] leading-6 text-amber-light">
              TAVERN CONTROL
            </p>

            <h1 className="mt-3 font-pixel text-xl leading-10 text-cream">
              Taverní bar
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-cream-muted">
              Nastav provozovatele, přidej nápoje a
              připrav QR štítky pro herní večery.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
                className="inline-flex items-center justify-center gap-2 border-2 border-outline bg-panel px-4 py-3 font-pixel text-[9px] text-cream transition hover:border-amber hover:text-amber-light"
                href="/bar/scan"
            >
                <ScanLine aria-hidden="true" size={15} />
                Skenovat QR
            </Link>

            <Link
              className="inline-flex items-center justify-center gap-2 border-2 border-outline bg-amber px-4 py-3 font-pixel text-[9px] text-void shadow-pixel-sm transition hover:brightness-110"
              href="/bar/print"
            >
              <Printer aria-hidden="true" size={15} />
              Tisk nabídky
            </Link>

            <PixelButton
                disabled={isLoading}
                onClick={() => {
                void loadOverview();
                }}
                size="sm"
                variant="ghost"
            >
                <RefreshCw
                    aria-hidden="true"
                    className={isLoading ? "animate-spin" : ""}
                    size={15}
                />
                Obnovit
            </PixelButton>
            </div>
        </section>

        {error ? (
          <div className="mt-8 border-2 border-danger bg-wine-dark p-5 text-sm leading-7 text-cream">
            {error}
          </div>
        ) : null}

        <section className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
          <PixelPanel tone="deep">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center border-2 border-outline bg-amber text-void shadow-pixel-sm">
                <Settings2
                  aria-hidden="true"
                  size={19}
                />
              </div>

              <div>
                <p className="font-pixel text-[9px] text-amber-light">
                  PROVOZOVATEL
                </p>

                <p className="mt-1 text-sm text-cream-muted">
                  Jediný člověk, kterému vzniknou
                  pohledávky za QR nápoje.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <label
                className="font-pixel text-[9px] text-cream"
                htmlFor="bar-operator"
              >
                Stálý provozovatel baru
              </label>

              <select
                className="w-full border-2 border-outline bg-panel-deep px-3 py-3 text-sm text-cream outline-none focus:border-amber disabled:cursor-not-allowed disabled:opacity-60"
                disabled={
                  areMembersLoading ||
                  isSavingOperator
                }
                id="bar-operator"
                onChange={(event) =>
                  setSelectedPayerId(
                    event.target.value,
                  )
                }
                value={selectedPayerId}
              >
                <option value="">
                  Vyber člena party…
                </option>

                {members.map((member) => (
                  <option
                    key={member.id}
                    value={member.id}
                  >
                    {member.displayName}
                    {member.role === "admin"
                      ? " · admin"
                      : ""}
                  </option>
                ))}
              </select>

              {overview?.config ? (
                <p className="text-sm leading-6 text-cream-muted">
                  Aktuálně účtuje:{" "}
                  <span className="font-semibold text-cream">
                    {overview.config.payerName}
                  </span>
                </p>
              ) : (
                <p className="text-sm leading-6 text-wine-light">
                  Provozovatel zatím není nastavený.
                </p>
              )}

              <PixelButton
                disabled={
                  !selectedPayerId ||
                  isSavingOperator ||
                  areMembersLoading
                }
                onClick={() => {
                  void handleSaveOperator();
                }}
                variant="moss"
              >
                {isSavingOperator ? (
                  <>
                    <LoaderCircle
                      aria-hidden="true"
                      className="animate-spin"
                      size={16}
                    />
                    Ukládám…
                  </>
                ) : (
                  <>
                    <Check
                      aria-hidden="true"
                      size={16}
                    />
                    Uložit provozovatele
                  </>
                )}
              </PixelButton>
            </div>
          </PixelPanel>

          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-pixel text-[9px] text-cream-muted">
                  NÁPOJOVÁ NABÍDKA
                </p>

                <h2 className="mt-2 font-pixel text-sm text-cream">
                  {overview?.drinks.length ?? 0} NÁPOJŮ
                </h2>
              </div>

              <PixelButton
                onClick={() =>
                  setEditorState({
                    mode: "create",
                  })
                }
                variant="moss"
              >
                <Plus aria-hidden="true" size={16} />
                Přidat nápoj
              </PixelButton>
            </div>

            {isLoading ? (
              <div className="mt-5 grid min-h-64 place-items-center border-2 border-outline bg-panel-deep">
                <div className="text-center">
                  <LoaderCircle
                    aria-hidden="true"
                    className="mx-auto animate-spin text-amber-light"
                    size={26}
                  />

                  <p className="mt-4 text-sm text-cream-muted">
                    Sčítám lahve na polici…
                  </p>
                </div>
              </div>
            ) : null}

            {!isLoading &&
            overview &&
            overview.drinks.length === 0 ? (
              <div className="mt-5 grid min-h-64 place-items-center border-2 border-outline bg-panel-deep p-6 text-center">
                <div>
                  <Beer
                    aria-hidden="true"
                    className="mx-auto text-cream-muted"
                    size={30}
                  />

                  <p className="mt-4 font-pixel text-[10px] text-cream">
                    BAR JE ZATÍM PRÁZDNÝ
                  </p>

                  <p className="mt-3 max-w-sm text-sm leading-6 text-cream-muted">
                    Přidej první nápoj a LANtern mu
                    vytvoří bezpečný QR token.
                  </p>
                </div>
              </div>
            ) : null}

            {!isLoading &&
            overview &&
            overview.drinks.length > 0 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {overview.drinks.map((drink) => (
                  <article
                    className="border-2 border-outline bg-panel p-5 shadow-pixel-sm"
                    key={drink.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-cream">
                          {drink.name}
                        </p>

                        <p className="mt-2 text-lg font-semibold text-amber-light">
                          {formatCzkFromCents(
                            drink.priceCents,
                          )}
                        </p>
                      </div>

                      <PixelBadge
                        tone={
                          drink.isAvailable
                            ? "moss"
                            : "muted"
                        }
                      >
                        {drink.isAvailable
                          ? "DOSTUPNÉ"
                          : "SKRYTÉ"}
                      </PixelBadge>
                    </div>

                    <p className="mt-4 font-pixel text-[8px] text-cream-muted">
                      {DRINK_CATEGORY_LABELS[
                        drink.category
                      ].toUpperCase()}
                    </p>

                    <div className="mt-5 grid gap-2 border-t-2 border-outline-soft pt-4 sm:grid-cols-2">
                      <PixelButton
                        onClick={() => setQrDrink(drink)}
                        size="sm"
                        variant="amber"
                      >
                        <QrCode
                          aria-hidden="true"
                          size={15}
                        />
                        QR kód
                      </PixelButton>

                      <PixelButton
                        onClick={() =>
                          setEditorState({
                            mode: "edit",
                            drink,
                          })
                        }
                        size="sm"
                        variant="ghost"
                      >
                        <Pencil
                          aria-hidden="true"
                          size={15}
                        />
                        Upravit
                      </PixelButton>

                      <PixelButton
                        className="sm:col-span-2"
                        onClick={() => {
                          void toggleAvailability(drink);
                        }}
                        size="sm"
                        variant={
                          drink.isAvailable
                            ? "wine"
                            : "moss"
                        }
                      >
                        {drink.isAvailable
                          ? "Skrýt nápoj"
                          : "Znovu zpřístupnit"}
                      </PixelButton>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      </main>

      {editorState ? (
        <DrinkEditor
          drink={
            editorState.mode === "edit"
              ? editorState.drink
              : undefined
          }
          key={
            editorState.mode === "edit"
              ? `edit-${editorState.drink.id}`
              : "create-drink"
          }
          onClose={() => setEditorState(null)}
          onSave={handleSaveDrink}
        />
      ) : null}

      {qrDrink ? (
        <DrinkQrModal
          drink={qrDrink}
          onClose={() => setQrDrink(null)}
        />
      ) : null}
    </>
  );
}
