export type ArithmeticResult =
  | { valid: true; value: number }
  | { valid: false };

const operators: Record<string, { precedence: number; apply: (left: number, right: number) => number }> = {
  "+": { precedence: 1, apply: (left, right) => left + right },
  "-": { precedence: 1, apply: (left, right) => left - right },
  "*": { precedence: 2, apply: (left, right) => left * right },
  "/": { precedence: 2, apply: (left, right) => left / right },
};

/** Parses basic kitchen arithmetic without executing user-provided JavaScript. */
export function parseArithmeticExpression(input: string): ArithmeticResult {
  const compact = input.replace(/\s/g, "");
  if (!compact) return { valid: false };
  const tokens = compact.match(/(?:\d+(?:[.,]\d+)?)|[+\-*/()]/g);
  if (!tokens || tokens.join("") !== compact) return { valid: false };

  const values: number[] = [];
  const operationStack: string[] = [];
  const reduce = () => {
    const operation = operationStack.pop();
    const right = values.pop();
    const left = values.pop();
    if (!operation || right === undefined || left === undefined) throw new Error("invalid expression");
    const value = operators[operation].apply(left, right);
    if (!Number.isFinite(value)) throw new Error("invalid result");
    values.push(value);
  };

  try {
    let expectsValue = true;
    for (const token of tokens) {
      if (/^\d/.test(token)) {
        if (!expectsValue) return { valid: false };
        const value = Number(token.replace(",", "."));
        if (!Number.isFinite(value)) return { valid: false };
        values.push(value);
        expectsValue = false;
      } else if (token === "(") {
        if (!expectsValue) return { valid: false };
        operationStack.push(token);
      } else if (token === ")") {
        if (expectsValue) return { valid: false };
        while (operationStack.at(-1) !== "(") {
          if (!operationStack.length) return { valid: false };
          reduce();
        }
        operationStack.pop();
        expectsValue = false;
      } else {
        if (expectsValue) {
          if (token === "-") values.push(0);
          else return { valid: false };
        }
        while (operationStack.at(-1) !== "(") {
          const previous = operationStack.at(-1);
          if (!previous || operators[previous]?.precedence < operators[token].precedence) break;
          reduce();
        }
        operationStack.push(token);
        expectsValue = true;
      }
    }
    if (expectsValue) return { valid: false };
    while (operationStack.length) {
      if (operationStack.at(-1) === "(") return { valid: false };
      reduce();
    }
    return values.length === 1 && values[0] >= 0 ? { valid: true, value: values[0] } : { valid: false };
  } catch {
    return { valid: false };
  }
}

export function calculate(input: string): number | null {
  if (!input.trim()) return 0;
  const result = parseArithmeticExpression(input);
  return result.valid ? result.value : null;
}
