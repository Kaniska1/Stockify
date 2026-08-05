import { useState } from "react";

import {
  ArrowRight,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "motion/react";

import { toast } from "sonner";

import { useApp } from "../context/AppContext";

const PRESET_AMOUNTS = [
  500,
  1000,
  5000,
  10000,
  25000,
  50000,
];

interface FundWalletModalProps {
  onDone: () => void;
}

function formatPreset(
  amount: number
): string {
  if (amount >= 1000) {
    return `$${amount / 1000}K`;
  }

  return `$${amount}`;
}

function formatCurrency(
  amount: number
): string {
  return amount.toLocaleString(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
}

export default function FundWalletModal({
  onDone,
}: FundWalletModalProps) {
  const { depositFunds } = useApp();

  const [selectedAmount, setSelectedAmount] =
    useState<number | null>(null);

  const [customAmount, setCustomAmount] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const parsedCustomAmount =
    Number.parseFloat(
      customAmount.replace(/,/g, "")
    );

  const amount =
    customAmount.trim() !== ""
      ? parsedCustomAmount
      : selectedAmount;

  const validAmount =
    amount !== null &&
    Number.isFinite(amount) &&
    amount > 0;

  const handlePresetSelect = (
    preset: number
  ) => {
    setSelectedAmount(preset);
    setCustomAmount("");
  };

  const handleCustomChange = (
    value: string
  ) => {
    const sanitizedValue = value
      .replace(/[^0-9.]/g, "")
      .replace(
        /(\..*)\./g,
        "$1"
      );

    setSelectedAmount(null);
    setCustomAmount(sanitizedValue);
  };

  const handleDeposit = async () => {
    if (
      !validAmount ||
      amount === null ||
      loading
    ) {
      return;
    }

    setLoading(true);

    try {
      await depositFunds(amount);

      toast.success(
        `${formatCurrency(
          amount
        )} added to your wallet`
      );

      onDone();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to add funds"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fund-wallet-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={onDone}
      >
        <motion.section
          className="fund-wallet-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fund-wallet-title"
          initial={{
            opacity: 0,
            scale: 0.96,
            y: 18,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.96,
            y: 10,
          }}
          transition={{
            duration: 0.22,
          }}
          onMouseDown={(event) =>
            event.stopPropagation()
          }
        >
          <header className="fund-wallet-header">
            <div className="fund-wallet-title">
              <span className="fund-wallet-title-icon">
                <Wallet size={18} />
              </span>

              <div>
                <span>
                  SIMULATED WALLET
                </span>

                <h2 id="fund-wallet-title">
                  Add funds
                </h2>

                <p>
                  Increase your virtual
                  trading balance.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="fund-wallet-close"
              onClick={onDone}
              aria-label="Close wallet modal"
            >
              <X size={17} />
            </button>
          </header>

          <div className="fund-wallet-body">
            <section className="fund-wallet-balance-note">
              <span>
                <ShieldCheck size={15} />
              </span>

              <div>
                <strong>
                  Demo funds only
                </strong>

                <p>
                  Deposits in Stockify are
                  simulated and do not move
                  real money.
                </p>
              </div>
            </section>

            <div className="fund-wallet-section-heading">
              <span>
                SELECT AN AMOUNT
              </span>

              <small>
                Quick deposit
              </small>
            </div>

            <div className="fund-wallet-presets">
              {PRESET_AMOUNTS.map(
                (preset) => (
                  <button
                    type="button"
                    key={preset}
                    className={
                      selectedAmount ===
                      preset
                        ? "fund-wallet-preset-active"
                        : ""
                    }
                    onClick={() =>
                      handlePresetSelect(
                        preset
                      )
                    }
                    disabled={loading}
                  >
                    {formatPreset(
                      preset
                    )}
                  </button>
                )
              )}
            </div>

            <label className="fund-wallet-custom">
              <span>
                Custom amount
              </span>

              <div
                className={
                  customAmount
                    ? "fund-wallet-custom-active"
                    : ""
                }
              >
                <DollarSign size={16} />

                <input
                  type="text"
                  inputMode="decimal"
                  value={customAmount}
                  onChange={(event) =>
                    handleCustomChange(
                      event.target.value
                    )
                  }
                  placeholder="Enter amount"
                  disabled={loading}
                />
              </div>
            </label>

            <AnimatePresence>
              {validAmount &&
                amount !== null && (
                  <motion.div
                    className="fund-wallet-summary"
                    initial={{
                      opacity: 0,
                      y: -5,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -5,
                    }}
                  >
                    <div>
                      <span>
                        Deposit amount
                      </span>

                      <strong className="sf-number">
                        {formatCurrency(
                          amount
                        )}
                      </strong>
                    </div>

                    <span className="fund-wallet-summary-icon">
                      <CheckCircle2
                        size={18}
                      />
                    </span>
                  </motion.div>
                )}
            </AnimatePresence>

            <button
              type="button"
              className="fund-wallet-submit"
              onClick={() =>
                void handleDeposit()
              }
              disabled={
                !validAmount || loading
              }
            >
              {loading ? (
                <span className="fund-wallet-spinner" />
              ) : (
                <>
                  Add funds
                  <ArrowRight size={15} />
                </>
              )}
            </button>

            <button
              type="button"
              className="fund-wallet-cancel"
              onClick={onDone}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}